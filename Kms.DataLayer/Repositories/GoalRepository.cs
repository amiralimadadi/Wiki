using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.General;

namespace Kms.DataLayer.Repositories
{
	public class GoalRepository : GenericRepository<Goal>,IGoalRepository
	{
		/// <summary>
		/// The root of Goals Tree
		/// </summary>
		public static int RootId = 1;


		public GoalRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
		{
		}

    }
}
