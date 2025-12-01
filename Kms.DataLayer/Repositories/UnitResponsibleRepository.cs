
using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.General;

namespace Kms.DataLayer.Repositories
{
    public class UnitResponsibleRepository : GenericRepository<UnitResponsible>, IUnitResponsibleRepository
    {
        public UnitResponsibleRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
        {
        }
    }
}
