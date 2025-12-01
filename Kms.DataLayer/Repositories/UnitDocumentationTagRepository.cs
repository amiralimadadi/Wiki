
using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.General;
using Kms.Domain.Entities.UnitDocumentation;

namespace Kms.DataLayer.Repositories
{
    public class UnitDocumentationTagRepository : GenericRepository<UnitDocumentationTag>, IUnitDocumentationTagRepository
    {
        public UnitDocumentationTagRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
        {
        }
    }
}
