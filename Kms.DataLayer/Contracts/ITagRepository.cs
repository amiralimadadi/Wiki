using Kms.Domain.Entities.QuestionAndAnswer;

namespace Kms.DataLayer.Contracts
{
	public interface ITagRepository:IGenericRepository<Tag>
	{
		List<Tag> GetNewTagList(List<string> tags);
		List<Tag> GetTagList(List<string> tags);

	}
}
