using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.QuestionAndAnswer;

namespace Kms.DataLayer.Repositories
{
	public class QuestionTagRepository : GenericRepository<QuestionTag>, IQuestionTagRepository
	{
		public QuestionTagRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
		{
		}

		public List<QuestionTag> GetQuestionTagList(List<Tag> tags, int questionId)
		{
			var result = from t in tags
				select new QuestionTag()
				{
					EntityId = questionId,
					TagId = t.Id
				};
			return result.ToList();
		}
	}
}
