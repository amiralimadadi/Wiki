using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.General;

namespace Kms.DataLayer.Repositories
{
    public class ProcessProfessionalRepository : GenericRepository<ProcessProfessional>, IProcessProfessionalRepository
    {
        public ProcessProfessionalRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
        {
        }

        public async Task<bool> CheckIfUserIsExpert(int userId, int goalId)
        {
	        var result = GetEntity(a => a.UserId == userId && a.Kind == "Expert" && a.GoalId == goalId);
	        return result.Any();
        }

        public async Task<bool> CheckIfUserIsOwner(int userId, int goalId)
        {
	        var result = GetEntity(a => a.UserId == userId && a.Kind == "Owner" && a.GoalId == goalId);
	        return result.Any();
        }
    }
}
