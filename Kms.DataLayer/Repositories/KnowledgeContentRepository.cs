using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.KnowledgeContentGroup;

namespace Kms.DataLayer.Repositories
{
    public class KnowledgeContentRepository : GenericRepository<KnowledgeContent>, IKnowledgeContentRepository
    {
        public KnowledgeContentRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
        {
        }
    }
}
