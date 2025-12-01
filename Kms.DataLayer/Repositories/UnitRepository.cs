using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.General;

namespace Kms.DataLayer.Repositories
{
    public class UnitRepository : GenericRepository<Unit>, IUnitRepository
    {
        public UnitRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
        {
        }
    }
}
