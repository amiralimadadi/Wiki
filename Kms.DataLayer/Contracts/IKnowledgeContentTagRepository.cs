using Kms.Domain.Entities.KnowledgeContentGroup;
using Kms.Domain.Entities.QuestionAndAnswer;

namespace Kms.DataLayer.Contracts
{
	public interface IKnowledgeContentTagRepository : IGenericRepository<KnowledgeContentTag>
	{
		Task<List<KnowledgeContentTag>> CreateTagsForKnowledgeContentTag(List<Tag> tags, KnowledgeContent knowledgeContent, bool saveNow);
	}
}
