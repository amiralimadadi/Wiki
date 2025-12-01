using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.Account;

namespace Kms.DataLayer.Repositories
{
    public class RoleRepository : GenericRepository<Role>, IRoleRepository
    {
        private readonly KmsDbContext _context;

        public RoleRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
        {
            _context = context;
        }
    }
}
