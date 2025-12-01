
using Kms.Application.Services.KnowledgeContentGroups;
using Kms.Application.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Kms.Api.Controllers
{
    /// <summary>
    /// Knowledge Content module.
    /// </summary>
    public class KnowledgeContentController : KmsAuthorizeController
    {
        private readonly IKnowledgeContentService _knowledgeContentService;
        #region Constructor

        #endregion Constructor
        /// <summary>
        /// 
        /// </summary>
        /// <param name="knowledgeContentService"></param>
        public KnowledgeContentController(IKnowledgeContentService knowledgeContentService)
        {
            _knowledgeContentService = knowledgeContentService;
        }

        
        #region Knowledge Content
        /// <summary>
        /// 
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateKnowledgeContentStructured([FromForm] CreateKnowledgeContentViewModel vm)
        {
            var result = await _knowledgeContentService.CreateKnowledgeContentStructured(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateKnowledgeContentNonStructured([FromForm] CreateKnowledgeContentViewModel vm)
        {
            var result = await _knowledgeContentService.CreateKnowledgeContentNonStructured(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> ChangeKnowledgeContentType([FromForm] ChangeKnowledgeContentTypeViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _knowledgeContentService.ChangeKnowledgeContentType(model);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status400BadRequest, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Confirm Knowledge Content
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> ConfirmKnowledgeContent([FromForm] ConfirmKnowledgeContentViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _knowledgeContentService.ConfirmKnowledgeContent(model);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status400BadRequest, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Returns all Knowledge Content based on filter parameters.
        /// </summary>
        /// <param name="knowledgeContentFilter"> Valid values : AllKnowledgeContent, Structured, NonStructured</param>
        /// <param name="goalId"> The goalId of Knowledge Content.</param>
        /// <param name="pageNo"> The pageNo of Knowledge Content to show.</param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetKnowledgeContent(KnowledgeContentTypeEnum knowledgeContentFilter, string? searchText = null, int? goalId = null, int pageNo = 1)
        {
            var result = await _knowledgeContentService.GetKnowledgeContent(knowledgeContentFilter, searchText, goalId, pageNo);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Print Structured Knowledge Content
        /// </summary>
        /// <param name="knowledgeContentId">Id</param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> PrintStructuredKnowledgeContent(int knowledgeContentId)
        {
            var result = await _knowledgeContentService.PrintStructuredKnowledgeContent(knowledgeContentId);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Returns specified KnowledgeContent.
        /// </summary>
        /// <param name="knowledgeContentId">knowledgeContentId</param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetKnowledgeContentById(int knowledgeContentId)
        {
            var result = await _knowledgeContentService.GetKnowledgeContentById(knowledgeContentId);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Like a nowledgeContent. The type of model is in EntityType property.
        /// </summary>
        /// <param name="vm">EntityType = "Question" or "Answer or nowledgeContent"</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> LikeKnowledgeContent([FromForm] LikeViewModel vm)
        {
            var result = await _knowledgeContentService.LikeKnowledgeContent(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Removes like from question or answer or KnowledgeContent.
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> UnlikeQuestionAnswer([FromForm] LikeViewModel vm)
        {
            var result = await _knowledgeContentService.UnLikeKnowledgeContent(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }
   
 
        /// <summary>
        /// 
        /// </summary>
        /// <param name="knowledgeContentId"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> DeleteKnowledgeContent(int knowledgeContentId)
        {
            var result = await _knowledgeContentService.DeleteKnowledgeContent(knowledgeContentId);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        [HttpGet]
        public async Task<IActionResult> GetUsersViewerKnowledgeContent(int id)
        {
            var result = await _knowledgeContentService.GetUsersViewerKnowledgeContent(id);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }
        [HttpGet]
        public async Task<IActionResult> GetUnitsViewerKnowledgeContent(int id)
        {
            var result = await _knowledgeContentService.GetUnitsViewerKnowledgeContent(id);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Returns all NonStructured Knowledge Content based on filter parameters.
        /// </summary>
        /// <param name="goalId">  goalId </param>
        /// <param name="pageNo">  pageNo </param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetNonStructuredKnowledgeContent(int? goalId = null, int pageNo = 1)
        {
            var result = await _knowledgeContentService.GetNonStructuredKnowledgeContent(goalId, pageNo);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        [HttpPost]
        public async Task<IActionResult> DeactivateKnowledgeContent(int knowledgeContentId)
        {
            var result = await _knowledgeContentService.DeactivateKnowledgeContent(knowledgeContentId);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        [HttpGet]
        public async Task<IActionResult> GetAwaitingConfirmationKnowledgeContent(int pageNo = 1)
        {
            var result = await _knowledgeContentService.GetAwaitingConfirmationKnowledgeContent(pageNo);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        [HttpPost]
        public async Task<IActionResult> ConfirmOrNotConfirmKnowledgeContent(int knowledgeContentId)
        {
            var result = await _knowledgeContentService.ConfirmOrNotConfirmKnowledgeContent(knowledgeContentId);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        //[HttpPost]
        //public async Task<IActionResult> DeactivateKnowledgeContent(int knowledgeContentId)
        //{
        //    var result = await _knowledgeContentService.DeactivateKnowledgeContent(knowledgeContentId);

        //    if (!result.IsSuccess)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError, result);
        //    }

        //    return StatusCode(StatusCodes.Status200OK, result);
        //}


        [HttpGet]
        public async Task<IActionResult> GetAllKnowledgeContentForAdmin(string? searchText = null, int? goalId = null, int pageNo = 1)
        {
            var result = await _knowledgeContentService.GetAllKnowledgeContentForAdmin(searchText, goalId, pageNo);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        #endregion Knowledge Content


        #region Comment

        /// <summary>
        /// Create Comment, Post action
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateComment([FromForm] CreateCommentViewModel vm)
        {
            var result = await _knowledgeContentService.CreateComment(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Returns all comment of a KnowledgeContent.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetCommentOfKnowledgeContent(int knowledgeContentId, int? pageNo = 1)
        {
            var result = await _knowledgeContentService.GetCommentOfKnowledgeContent(knowledgeContentId, pageNo);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Returns all comment of a KnowledgeContent Without Pagination.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetCommentOfKnowledgeContentWithoutPagination(int knowledgeContentId)
        {
            var result = await _knowledgeContentService.GetCommentOfKnowledgeContentWithoutPagination(knowledgeContentId);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Returns specified Comment.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetCommentById(int commentId)
        {
            var result = await _knowledgeContentService.GetCommentById(commentId);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Like a nowledgeContent. The type of model is in EntityType property.
        /// </summary>
        /// <param name="vm">EntityType = "Question" or "Answer or nowledgeContent"</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> LikeComment([FromForm] LikeViewModel vm)
        {
            var result = await _knowledgeContentService.LikeComment(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Removes like from question or answer or KnowledgeContent.
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> UnlikeComment([FromForm] LikeViewModel vm)
        {
            var result = await _knowledgeContentService.UnlikeComment(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        #endregion
    }
}
