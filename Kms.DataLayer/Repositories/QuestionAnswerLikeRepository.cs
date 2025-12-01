using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.QuestionAndAnswer;

namespace Kms.DataLayer.Repositories
{
    public enum LikeEntityType
    {
        Question,
        Answer,
        KnowledgeContent,
        Comment,
        Proposal,
        ProposalComment,
        Project,
        ProjectComment
    }

    public class LikeRepository : GenericRepository<Like>,ILikeRepository
    {
        

        public LikeRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
        {
        }
    }
}
