using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.ProjectAndProposal;

namespace Kms.DataLayer.Repositories
{
    public class ProjectRepository : GenericRepository<Project>, IProjectRepository
    {
        public ProjectRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context,
            authenticateService)
        {
        }
    }
}
