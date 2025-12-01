using Kms.Domain.Entities.QuestionAndAnswer;

namespace Kms.DataLayer.Contracts
{
	public interface IQuestionTagRepository:IGenericRepository<QuestionTag>
	{
		List<QuestionTag> GetQuestionTagList(List<Tag> tags, int questionId);
	}
}
