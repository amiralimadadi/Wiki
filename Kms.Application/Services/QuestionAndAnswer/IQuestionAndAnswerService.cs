using Kms.Application.ViewModels;
using Common.OperationResult;

namespace Kms.Application.Services.QuestionAndAnswer
{
    public interface IQuestionAndAnswerService
    {
	    Task<OperationResult<List<int>>> GetDataForCreateQuestion(List<int> goalId);
        Task<OperationResult<QuestionViewModel>> CreateQuestion(CreateQuestionViewModel question);
        Task<OperationResult<List<QuestionViewModel>>> GetQuestions(GetQuestionTypesEnum questionFilter, string? searchText, int? goalId = null, int? pageNo = null);
        Task<OperationResult<QuestionViewModel>> GetQuestionById(int questionId);

        Task<OperationResult<AnswerViewModel>> GetAnswerById(int answerId);
        Task<OperationResult<List<AnswerViewModel>>> GetAnswersOfQuestion(int questionId, int? pageNo = null);

        Task<OperationResult<AnswerViewModel>> CreateAnswer(CreateAnswerViewModel answer);
        
        Task<OperationResult<LikeViewModel>> LikeQuestionAnswer(LikeViewModel qaLikeViewModel);
        Task<OperationResult<LikeViewModel>> UnLikeQuestionAnswer(LikeViewModel qaLikeViewModel);

        Task<OperationResult<List<QuestionsAdminConfirmViewModel>>> GetQuestionsForAdminConfirm();

        Task<OperationResult<QuestionViewModel>> AcceptQuestion(int questionId, string index, int? goalId);

        Task<OperationResult<List<QuestionTypeViewModel>>> GetQuestionType();


        Task<OperationResult<List<AnswersAdminConfirmViewModel>>> GetAnswersForAdminConfirm();

        Task<OperationResult<AnswerViewModel>> AcceptAnswer(int answerId, string index);
    }
}