using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.KnowledgeContentGroup;
using Kms.Domain.Entities.QuestionAndAnswer;

namespace Kms.DataLayer.Repositories
{
	public class KnowledgeContentTagRepository:GenericRepository<KnowledgeContentTag>,IKnowledgeContentTagRepository
	{
		public KnowledgeContentTagRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
		{
		}

		public async Task<List<KnowledgeContentTag>> CreateTagsForKnowledgeContentTag(
			List<Tag> tags, KnowledgeContent knowledgeContent, bool saveNow)
		{
			if (tags.Count == 0)
				return null!;
			var knowledgeContentTags =
				(from t in tags
				select new KnowledgeContentTag
				{
					EntityId = knowledgeContent.Id,
					TagId = t.Id
				}).ToList();
			if (saveNow)
				await AddRangeAsync(knowledgeContentTags, saveNow);
			return knowledgeContentTags;
		}
	}
}