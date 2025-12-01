using Kms.DataLayer.Contracts;
using Common.UserService;
using Kms.DataLayer.Context;
using Kms.Domain.Entities.KnowledgeContentGroup;

namespace Kms.DataLayer.Repositories
{
	public class KnowledgeContentExpertConfirmRepository : GenericRepository<KnowledgeContentExpertConfirm>, IKnowledgeContentExpertConfirmRepository
	{
		public KnowledgeContentExpertConfirmRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
		{
		}
	}
}
