using Common.OperationResult;
using Common.SqlDto;
using Kms.Application.Services.Account;
using Kms.Application.ViewModels;
using Kms.DataLayer.Context;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Kms.Application.Services.HomeLanding
{
    public class HomeLandingService : IHomeLandingService
    {
        private readonly IAccountService _accountService;
        private readonly KmsDbContext _dbContext;
        public HomeLandingService(
            IAccountService accountService,
            KmsDbContext dbContext
            )
        {
            _accountService = accountService;
            _dbContext = dbContext;
        }

        public async Task<OperationResult<List<HomeLandingContentsViewModel>>> GetTop50Contents()
        {
            var currentUserId = _accountService.GetUserId();
            const string sql = @"
;WITH PvAgg AS (
    SELECT
        pv.EntityType,
        pv.EntityId,
        COUNT(1) AS PageViewCount
    FROM PageViews pv
    WHERE pv.IsActive = 1 AND pv.IsDeleted = 0
      AND pv.EntityType IN ('Question','KnowledgeContent','Comment','Proposal','Project')
    GROUP BY pv.EntityType, pv.EntityId
),
TopPerType AS (
    SELECT
        a.*,
        ROW_NUMBER() OVER (PARTITION BY a.EntityType ORDER BY a.PageViewCount DESC, a.EntityId) AS rn
    FROM PvAgg a
),
Top50 AS (
    SELECT EntityType, EntityId, PageViewCount
    FROM TopPerType
    WHERE rn <= 50
),
ContentUnion AS (
    SELECT
        'Question' AS EntityType,
        q.Id AS EntityId,
        q.QuestionTitle AS Title,
        CAST(q.QuestionText AS nvarchar(max)) AS [Text],
        q.CreatedDate,
        q.UserId
    FROM Questions q
    WHERE q.IsActive = 1 AND q.IsDeleted = 0

    UNION ALL

    SELECT
        'KnowledgeContent',
        k.Id,
        k.Title,
        CAST(k.Abstract AS nvarchar(max)) AS [Text],
        k.CreatedDate,
        k.UserId
    FROM KnowledgeContents k
    WHERE k.IsActive = 1 AND k.IsDeleted = 0

    UNION ALL

    SELECT
        'Proposal',
        p.Id,
        p.Title,
        CAST(p.Abstract AS nvarchar(max)) AS [Text],
        p.CreatedDate,
        p.UserId
    FROM Proposals p
    WHERE p.IsActive = 1 AND p.IsDeleted = 0

    UNION ALL

    SELECT
        'Project',
        pr.Id,
        pr.Title,
        CAST(pr.Abstract AS nvarchar(max)) AS [Text],
        pr.CreatedDate,
        pr.UserId
    FROM Projects pr
    WHERE pr.IsActive = 1 AND pr.IsDeleted = 0
),
LikesAgg AS (
    SELECT l.EntityType, l.EntityId, COUNT(1) AS LikeCount
    FROM Likes l
    WHERE l.IsActive = 1 AND l.IsDeleted = 0
    GROUP BY l.EntityType, l.EntityId
),
CommentAgg AS (
    SELECT 'Question' AS EntityType, a.QuestionId AS EntityId, COUNT(1) AS CommentCount
    FROM Answers a
    WHERE a.IsActive = 1 AND a.IsDeleted = 0
    GROUP BY a.QuestionId

    UNION ALL
    SELECT 'KnowledgeContent', c.KnowledgeContentId, COUNT(1)
    FROM Comments c
    WHERE c.IsActive = 1 AND c.IsDeleted = 0
    GROUP BY c.KnowledgeContentId

    UNION ALL
    SELECT 'Proposal', pc.ProposalId, COUNT(1)
    FROM ProposalComments pc
    WHERE pc.IsActive = 1 AND pc.IsDeleted = 0
    GROUP BY pc.ProposalId

    UNION ALL
    SELECT 'Project', prc.ProjectId, COUNT(1)
    FROM ProjectComments prc
    WHERE prc.IsActive = 1 AND prc.IsDeleted = 0
    GROUP BY prc.ProjectId
)
SELECT
    t.EntityType,
    t.EntityId,
    t.PageViewCount,

    ISNULL(cu.Title, '') AS Title,
    CASE
    WHEN cu.[Text] IS NULL THEN ''
    WHEN LEN(cu.[Text]) > 200 THEN LEFT(cu.[Text], 200) + '...'
    ELSE cu.[Text]
END AS [Text],

    ISNULL(cu.CreatedDate, '1900-01-01') AS CreatedDate,

    ISNULL(la.LikeCount, 0) AS LikeCount,
    ISNULL(ca.CommentCount, 0) AS CommentCount,

    cu.UserId AS UserId,
    u.FullName AS FullName,
CASE 
    WHEN EXISTS (
        SELECT 1
        FROM Likes l2
        WHERE l2.IsActive = 1 
          AND l2.IsDeleted = 0
          AND l2.UserId = @CurrentUserId
          AND l2.EntityType = t.EntityType
          AND l2.EntityId = t.EntityId
    )
    THEN CAST(1 AS bit)
    ELSE CAST(0 AS bit)
END AS IsLiked

FROM Top50 t
LEFT JOIN ContentUnion cu
    ON cu.EntityType = t.EntityType AND cu.EntityId = t.EntityId
LEFT JOIN Users u
    ON u.Id = cu.UserId
LEFT JOIN LikesAgg la
    ON la.EntityType = t.EntityType AND la.EntityId = t.EntityId
LEFT JOIN CommentAgg ca
    ON ca.EntityType = t.EntityType AND ca.EntityId = t.EntityId
ORDER BY t.PageViewCount DESC, t.EntityType, t.EntityId;
";

            var rows = await _dbContext.Set<Top50ContentsSqlRow>()
                .FromSqlRaw(
                    sql,
                    new SqlParameter("@CurrentUserId", currentUserId)
                )
                .AsNoTracking()
                .ToListAsync();


            var result = rows.Select(r => new HomeLandingContentsViewModel
            {
                EntityId = r.EntityId,
                EntityType = Enum.Parse<VisitPageEntityEnum>(r.EntityType),
                PageViewCount = r.PageViewCount,
                Title = r.Title,
                Text = r.Text ?? "",
                CreatedDate = r.CreatedDate,
                LikeCount = r.LikeCount,
                CommentCount = r.CommentCount,

                User = r.UserId == null ? null : new UserViewModel
                {
                    Id = r.UserId.Value,
                    FullName = r.FullName
                },

                IsLiked = r.IsLiked,

                IsConfirm = null,
                Attachments = new List<AttachmentViewModel>(),
                Tags = new List<TagsViewModel>()
            }).ToList();

            return new OperationResult<List<HomeLandingContentsViewModel>>(true, result, string.Empty);
        }


        public async Task<OperationResult<List<HomeLandingContentsViewModel>>> GetmanualSearch(string search)
        {
            var currentUserId = _accountService.GetUserId();

            var fullTextSearch = string.Join(
      " AND ",
      search
          .Trim()
          .Split(' ', StringSplitOptions.RemoveEmptyEntries)
          .Select(x => $"{x}*")
  );
            string sql = @$"
DECLARE @q NVARCHAR(4000) = N'{fullTextSearch}*';
DECLARE @CurrentUserId INT = 1; 

;WITH Hits AS (
    SELECT N'KnowledgeContent' AS EntityType, ft.[KEY] AS EntityId, ft.[RANK] AS [Rank]
    FROM CONTAINSTABLE(dbo.KnowledgeContents, (Title, [Text], Abstract), @q) ft

    UNION ALL
    SELECT N'Question', ft.[KEY], ft.[RANK]
    FROM CONTAINSTABLE(dbo.Questions, (QuestionTitle, QuestionText), @q) ft

    UNION ALL
    SELECT N'Project', ft.[KEY], ft.[RANK]
    FROM CONTAINSTABLE(dbo.Projects, (Title, Abstract, IdeaCode, ProposalCode), @q) ft

    UNION ALL
    SELECT N'Proposal', ft.[KEY], ft.[RANK]
    FROM CONTAINSTABLE(dbo.Proposals, (Title, Abstract, IdeaCode, Code), @q) ft

    UNION ALL
    SELECT N'UnitDocumentation', ft.[KEY], ft.[RANK]
    FROM CONTAINSTABLE(dbo.UnitDocumentations, (Title, Position, [Text]), @q) ft
),
Content AS (
    
    SELECT
        h.EntityType,
        h.EntityId,
        q.QuestionTitle AS Title,
        CAST(q.QuestionText AS NVARCHAR(MAX)) AS [Text],
        q.CreatedDate,
        q.UserId,
        h.[Rank]
    FROM Hits h
    JOIN dbo.Questions q ON q.Id = h.EntityId
    WHERE h.EntityType = N'Question'

    UNION ALL
    SELECT
        h.EntityType,
        h.EntityId,
        k.Title,
        CAST(COALESCE(k.Abstract, k.[Text]) AS NVARCHAR(MAX)) AS [Text],
        k.CreatedDate,
        k.UserId,
        h.[Rank]
    FROM Hits h
    JOIN dbo.KnowledgeContents k ON k.Id = h.EntityId
    WHERE h.EntityType = N'KnowledgeContent'

    UNION ALL
    SELECT
        h.EntityType,
        h.EntityId,
        pr.Title,
        CAST(pr.Abstract AS NVARCHAR(MAX)) AS [Text],
        pr.CreatedDate,
        pr.UserId,
        h.[Rank]
    FROM Hits h
    JOIN dbo.Projects pr ON pr.Id = h.EntityId
    WHERE h.EntityType = N'Project'

    UNION ALL
    SELECT
        h.EntityType,
        h.EntityId,
        p.Title,
        CAST(p.Abstract AS NVARCHAR(MAX)) AS [Text],
        p.CreatedDate,
        p.UserId,
        h.[Rank]
    FROM Hits h
    JOIN dbo.Proposals p ON p.Id = h.EntityId
    WHERE h.EntityType = N'Proposal'

    UNION ALL
    SELECT
        h.EntityType,
        h.EntityId,
        ud.Title,
        CAST(ud.[Text] AS NVARCHAR(MAX)) AS [Text],
        ud.CreatedDate,
        ud.UserId,
        h.[Rank]
    FROM Hits h
    JOIN dbo.UnitDocumentations ud ON ud.Id = h.EntityId
    WHERE h.EntityType = N'UnitDocumentation'
),
PvAgg AS (
    SELECT pv.EntityType, pv.EntityId, COUNT(1) AS PageViewCount
    FROM dbo.PageViews pv
    WHERE pv.IsActive = 1 AND pv.IsDeleted = 0
    GROUP BY pv.EntityType, pv.EntityId
),
LikesAgg AS (
    SELECT l.EntityType, l.EntityId, COUNT(1) AS LikeCount
    FROM dbo.Likes l
    WHERE l.IsActive = 1 AND l.IsDeleted = 0
    GROUP BY l.EntityType, l.EntityId
),
CommentAgg AS (
    SELECT N'Question' AS EntityType, a.QuestionId AS EntityId, COUNT(1) AS CommentCount
    FROM dbo.Answers a
    WHERE a.IsActive = 1 AND a.IsDeleted = 0
    GROUP BY a.QuestionId

    UNION ALL
    SELECT N'KnowledgeContent', c.KnowledgeContentId, COUNT(1)
    FROM dbo.Comments c
    WHERE c.IsActive = 1 AND c.IsDeleted = 0
    GROUP BY c.KnowledgeContentId

    UNION ALL
    SELECT N'Proposal', pc.ProposalId, COUNT(1)
    FROM dbo.ProposalComments pc
    WHERE pc.IsActive = 1 AND pc.IsDeleted = 0
    GROUP BY pc.ProposalId

    UNION ALL
    SELECT N'Project', prc.ProjectId, COUNT(1)
    FROM dbo.ProjectComments prc
    WHERE prc.IsActive = 1 AND prc.IsDeleted = 0
    GROUP BY prc.ProjectId
),
IsLikedAgg AS (
    SELECT l.EntityType, l.EntityId, CAST(1 AS bit) AS IsLiked
    FROM dbo.Likes l
    WHERE l.IsActive = 1 AND l.IsDeleted = 0
      AND l.UserId = @CurrentUserId
    GROUP BY l.EntityType, l.EntityId
)
SELECT TOP (200)
    c.EntityId,
    c.EntityType,
    ISNULL(pv.PageViewCount, 0) AS PageViewCount,

    ISNULL(c.Title, N'') AS Title,
    CASE
        WHEN c.[Text] IS NULL THEN N''
        WHEN LEN(c.[Text]) > 200 THEN LEFT(c.[Text], 200) + N'...'
        ELSE c.[Text]
    END AS [Text],

    c.CreatedDate,

    ISNULL(la.LikeCount, 0) AS LikeCount,
    ISNULL(ca.CommentCount, 0) AS CommentCount,
    ISNULL(il.IsLiked, CAST(0 AS bit)) AS IsLiked,

    CAST(NULL AS bit) AS IsConfirm,

    c.UserId,
    u.FullName,

    c.[Rank]
FROM Content c
LEFT JOIN dbo.Users u ON u.Id = c.UserId
LEFT JOIN PvAgg pv ON pv.EntityType = c.EntityType AND pv.EntityId = c.EntityId
LEFT JOIN LikesAgg la ON la.EntityType = c.EntityType AND la.EntityId = c.EntityId
LEFT JOIN CommentAgg ca ON ca.EntityType = c.EntityType AND ca.EntityId = c.EntityId
LEFT JOIN IsLikedAgg il ON il.EntityType = c.EntityType AND il.EntityId = c.EntityId
ORDER BY c.[Rank] DESC, ISNULL(pv.PageViewCount, 0) DESC, c.EntityType, c.EntityId;

";

            var rows = await _dbContext.Set<Top50ContentsSqlRow>()
                .FromSqlRaw(
                    sql
                )
                .AsNoTracking()
                .ToListAsync();


            var result = rows.Select(r => new HomeLandingContentsViewModel
            {
                EntityId = r.EntityId,
                EntityType = Enum.Parse<VisitPageEntityEnum>(r.EntityType),
                PageViewCount = r.PageViewCount,
                Title = r.Title,
                Text = r.Text ?? "",
                CreatedDate = r.CreatedDate,
                LikeCount = r.LikeCount,
                CommentCount = r.CommentCount,

                User = r.UserId == null ? null : new UserViewModel
                {
                    Id = r.UserId.Value,
                    FullName = r.FullName
                },

                IsLiked = r.IsLiked,

                IsConfirm = null,
                Attachments = new List<AttachmentViewModel>(),
                Tags = new List<TagsViewModel>()
            }).ToList();

            return new OperationResult<List<HomeLandingContentsViewModel>>(true, result, string.Empty);
        }
    }
}
