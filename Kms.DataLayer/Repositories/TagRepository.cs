using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.QuestionAndAnswer;

namespace Kms.DataLayer.Repositories
{
	public class TagRepository : GenericRepository<Tag>, ITagRepository
	{
		public TagRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
		{
		}

		public List<Tag> GetNewTagList(List<string> tags)
		{
			var newTags = new List<Tag>();
			var existTags = GetEntity(a => tags.Contains(a.TagTitle));
			foreach (var t in tags.Distinct())
			{
				if (!existTags.Select(a => a.TagTitle).Contains(t))
					newTags.Add(new Tag()
					{
						TagTitle = t.Trim().TrimEnd().TrimStart()
					});
			}

			return newTags;
		}

		public List<Tag> GetTagList(List<string> tagTitles)
		{
			tagTitles.ForEach(a=>a = a.Trim().TrimStart().TrimEnd());
			var tags = GetEntity(a => tagTitles.Contains(a.TagTitle));
			return tags.ToList();
		}
	}
}
