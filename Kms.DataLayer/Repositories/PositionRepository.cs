using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.UnitDocumentation;

namespace Kms.DataLayer.Repositories
{
public class PositionRepository : GenericRepository<Position>, IPositionRepository
{
    public PositionRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context,
        authenticateService)
    {
    }
}
}
