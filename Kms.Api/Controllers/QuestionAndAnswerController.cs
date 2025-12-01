using Kms.Application.Services.QuestionAndAnswer;
using Kms.Application.ViewModels;
using Kms.Domain.Entities.General;
using Microsoft.AspNetCore.Mvc;

namespace Kms.Api.Controllers
{
	/// <summary>
	/// Questions and answers module.
	/// </summary>
	public class QuestionAndAnswerController : KmsAuthorizeController
	{

		#region Constructor
		private readonly IQuestionAndAnswerService _questionAndAnswerService;

		public QuestionAndAnswerController(IQuestionAndAnswerService questionAndAnswerService)
		{
			_questionAndAnswerService = questionAndAnswerService;
		}
		#endregion Constructor

		#region Question

		/// <summary>
		/// Returns all questions based on filter parameters.
		/// </summary>
		/// <param name="questionFilter"> Valid values : AllQuestions, MyQuestions, MentionedQuestions</param>
		/// <param name="goalId"> The goalId of questions.</param>
		/// <param name="pageNo"> The pageNo of questions to show.</param>
		/// <returns></returns>
		[HttpGet]
		public async Task<ActionResult> GetQuestions(GetQuestionTypesEnum questionFilter, string? searchText, int? goalId = null, int pageNo = 1)
		{
			var result = await _questionAndAnswerService.GetQuestions(questionFilter, searchText, goalId, pageNo);
			if (!result.IsSuccess)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, result);
			}
			return StatusCode(StatusCodes.Status200OK, result);
		}

		/// <summary>
		/// Returns specified question.
		/// </summary>
		/// <returns></returns>
		[HttpGet]
		public async Task<ActionResult> GetQuestionById(int questionId)
		{
			var result = await _questionAndAnswerService.GetQuestionById(questionId);
			if (!result.IsSuccess)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, result);
			}
			return StatusCode(StatusCodes.Status200OK, result);
		}

		/// <summary>
		/// Creates a question, Get action.
		/// </summary>
		/// <param name="goalIds"></param>
		/// <returns></returns>
		[HttpGet]
		public async Task<IActionResult> CreateQuestion(List<int> goalIds)
		{
			var result = await _questionAndAnswerService.GetDataForCreateQuestion(goalIds);

			if (!result.IsSuccess)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, result);
			}

			return StatusCode(StatusCodes.Status200OK, result);
		}

		/// <summary>
		/// Creates a question, Post action.
		/// </summary>
		/// <param name="vm"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<IActionResult> CreateQuestion([FromForm] CreateQuestionViewModel vm)
		{
			var result = await _questionAndAnswerService.CreateQuestion(vm);

			if (!result.IsSuccess)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, result);
			}

			return StatusCode(StatusCodes.Status200OK, result);
		}

        /// <summary>
        ///  all QuestionType.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetQuestionType()
        {
            var result = await _questionAndAnswerService.GetQuestionType();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Returns all unconfirmed questions For Admin action.
        /// </summary>

        /// <returns></returns>
        [HttpGet]
		public async Task<ActionResult> GetQuestionsForAdminConfirm()
		{
			var result = await _questionAndAnswerService.GetQuestionsForAdminConfirm();
			if (!result.IsSuccess)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, result);
			}
			return StatusCode(StatusCodes.Status200OK, result);
		}


        /// <summary>
        /// change QuestionType  a question For Admin action.
        /// </summary>
        /// <param name="index">send 0 to reject</param>
        /// <param name="questionId"></param>
        /// <param name="goalId">goal Id</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AcceptOrDeleteQuestionByAdmin(int questionId, string index, int? goalId)
        {
            var result = await _questionAndAnswerService.AcceptQuestion(questionId, index, goalId);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        #endregion Question

        #region Answer
        /// <summary>
        /// Returns all answers of a question.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
		public async Task<ActionResult> GetAnswersOfQuestion(int questionId, int? pageNo = null)
		{
			var result = await _questionAndAnswerService.GetAnswersOfQuestion(questionId,pageNo);
			if (!result.IsSuccess)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, result);
			}
			return StatusCode(StatusCodes.Status200OK, result);
		}


		/// <summary>
		/// Returns specified answer.
		/// </summary>
		/// <returns></returns>
		[HttpGet]
		public async Task<ActionResult> GetAnswerById(int answerId)
		{
			var result = await _questionAndAnswerService.GetAnswerById(answerId);
			if (!result.IsSuccess)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, result);
			}
			return StatusCode(StatusCodes.Status200OK, result);
		}

		/// <summary>
		/// Create Answer, Post action
		/// </summary>
		/// <param name="vm"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<IActionResult> CreateAnswer([FromForm] CreateAnswerViewModel vm)
		{
			var result = await _questionAndAnswerService.CreateAnswer(vm);

			if (!result.IsSuccess)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, result);
			}

			return StatusCode(StatusCodes.Status200OK, result);
		}

		/// <summary>
		/// Like a question or an answer. The type of model is in EntityType property.
		/// </summary>
		/// <param name="vm">EntityType = "Question" or "Answer"</param>
		/// <returns></returns>
		[HttpPost]
		public async Task<IActionResult> LikeQuestionAnswer([FromForm] LikeViewModel vm)
		{
			var result = await _questionAndAnswerService.LikeQuestionAnswer(vm);

			if (!result.IsSuccess)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, result);
			}

			return StatusCode(StatusCodes.Status200OK, result);
		}

		/// <summary>
		/// Removes like from question or answer.
		/// </summary>
		/// <param name="vm"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<IActionResult> UnlikeQuestionAnswer([FromForm] LikeViewModel vm)
		{
			var result = await _questionAndAnswerService.UnLikeQuestionAnswer(vm);

			if (!result.IsSuccess)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, result);
			}

			return StatusCode(StatusCodes.Status200OK, result);
		}


        /// <summary>
        /// Returns all unconfirmed answer For Admin action.
        /// </summary>

        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetAnswersForAdminConfirm()
        {
            var result = await _questionAndAnswerService.GetAnswersForAdminConfirm();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }
        #endregion


        /// <summary>
        /// change QuestionType  a question For Admin action.
        /// </summary>
        /// <param name="index">send 0 to reject</param>
        /// <param name="answerId"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AcceptOrDeleteAnswerByAdmin(int answerId, string index)
        {
            var result = await _questionAndAnswerService.AcceptAnswer(answerId, index);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }
    }
}
