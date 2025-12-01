using Common.OperationResult;
using Kms.Application.ViewModels;
using Kms.Domain.Entities.General;

namespace Kms.Application.Services.Gamifications
{
	public interface IGamificationService
	{
		Task<OperationResult<List<UserScore>>> CalculateScores(
			CalculateScoreViewModel data,
			bool saveNow = true,
			bool sendNotification = true);
		OperationResult<List<Score>> GetQuestionTypes();
		OperationResult<List<Score>> GetAnswerTypes();
		Task<OperationResult<List<UserScoreDetailsViewModel>>> GetUserScoreDetails(int userId, string? searchText, int? pageNo = null);
		Task<OperationResult<List<UserScoreAggregate>>> GetUserScoreAggregate(List<int>? userIds, int? pageNo = null);
        Task<OperationResult<List<ScoreViewModel>>> GetAllScore();
        Task<OperationResult<List<UserScoreViewModel>>> GetAllUserScore();

    }
}
