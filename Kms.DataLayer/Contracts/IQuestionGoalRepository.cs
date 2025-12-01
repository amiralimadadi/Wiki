using Kms.Domain.Entities.QuestionAndAnswer;

namespace Kms.DataLayer.Contracts
{
    public interface IQuestionGoalRepository : IGenericRepository<QuestionGoal>
    {
	    Task<List<int>> GetGoalsForAQuestion(int questionId);
    }
}
