using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.QuestionAndAnswer;

namespace Kms.DataLayer.Repositories
{
    public class QuestionGoalRepository : GenericRepository<QuestionGoal>, IQuestionGoalRepository
    {
        public QuestionGoalRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
        {
        }

        public async Task<List<int>> GetGoalsForAQuestion(int questionId)
        {
	        var questionGoals = GetEntity(a => a.QuestionId == questionId).ToList();

            if (!questionGoals.Any()) return new List<int>();

            return questionGoals.Select(a => a.GoalId).ToList();

        }
    }
}
