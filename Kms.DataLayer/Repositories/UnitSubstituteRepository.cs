using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.UnitDocumentation;

namespace Kms.DataLayer.Repositories
{
public class UnitSubstituteRepository : GenericRepository<UnitSubstitute>, IUnitSubstituteRepository
{
    public UnitSubstituteRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context,
        authenticateService)
    {
    }
}
}
