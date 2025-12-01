using Kms.Domain.Entities.General;

namespace Kms.DataLayer.Contracts;

public interface IProcessProfessionalRepository : IGenericRepository<ProcessProfessional>
{
	Task<bool> CheckIfUserIsExpert(int userId, int goalId);
	Task<bool> CheckIfUserIsOwner(int userId, int goalId);

}