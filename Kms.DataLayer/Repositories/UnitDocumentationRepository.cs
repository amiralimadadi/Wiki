
using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;

using Kms.Domain.Entities.UnitDocumentation;

namespace Kms.DataLayer.Repositories
{
    public class UnitDocumentationRepository : GenericRepository<UnitDocumentation>, IUnitDocumentationRepository
    {
        public UnitDocumentationRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
        {
        }
    }
}

