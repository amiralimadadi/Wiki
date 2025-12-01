using Common.OperationResult;
using Kms.Application.Services.ProjectAndProposal;
using Kms.Application.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Kms.Api.Controllers
{
    /// <summary>
    /// Project And Proposal Management
    /// </summary>
    public class ProjectAndProposalController : KmsAuthorizeController
    {

        #region Constructor

        private readonly IProjectAndProposalService _projectAndProposalService;

        public ProjectAndProposalController(IProjectAndProposalService projectAndProposalService)
        {
            _projectAndProposalService = projectAndProposalService;
        }

        #endregion

        
        #region Generator And Viewer

        /// <summary>
        /// Add User To project and proposal Generator
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AddUserToGenerator([FromForm] CreateGeneratorViewModel vm)
        {
            var result = await _projectAndProposalService.AddUserToGenerator(vm);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetUsersGenerator()
        {
            var result = await _projectAndProposalService.GetUsersGenerator();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetUsersViewer(int entityId)
        {
            var result = await _projectAndProposalService.GetUsersViewer(entityId);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        [HttpPost("{id}")]
        public async Task<ActionResult> DeleteUsersGeneratorById(int id)
        {
            OperationResult<GeneratorViewModel> val = await _projectAndProposalService.DeleteUsersGeneratorById(id);
            if (!val.IsSuccess)
            {
                return (ActionResult)(object)((ControllerBase)this).StatusCode(500, (object)val);
            }

            return (ActionResult)(object)((ControllerBase)this).StatusCode(200, (object)val);
        }

        #endregion


        #region Proposal

        /// <summary>
        /// 
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateProposal([FromForm] CreateProposalViewModel vm)
        {
            var result = await _projectAndProposalService.CreateProposal(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Get All Proposal
        /// </summary>
        /// <param name="proposalFilter"></param>
        /// <param name="searchText"></param>
        /// <param name="goalId"></param>
        /// <param name="pageNo"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetAllProposal(GetProposalTypesEnum proposalFilter, string? searchText = null, int? goalId = null, int pageNo = 1)
        {
            var result = await _projectAndProposalService.GetAllProposal(proposalFilter,searchText, goalId, pageNo);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }



        /// <summary>
        /// Returns all unconfirmed proposal For Admin action.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetProposalsForAdminConfirm()
        {
            var result = await _projectAndProposalService.GetProposalsForAdminConfirm();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }



        /// <summary>
        /// Add User To project and proposal Generator
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        [SwaggerOperation(Summary = "Add a user to the Viewer", Description = "This action adds a user to the project and proposal Viewer with specific details.")]
        public async Task<IActionResult> ConfirmProposal([FromForm] CreateViewerViewModel vm)
        {
            var result = await _projectAndProposalService.ConfirmProposal(vm);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }
       
        #endregion

        /// <summary>
        /// Download File
        /// </summary>
        /// <returns></returns>
      
       
        [HttpGet]
        public IActionResult DownloadSampleProposalFile()
        {
           var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/files", "فرم ثبت طرح.rar");
           
            if (!System.IO.File.Exists(filePath))
                return NotFound();

            return PhysicalFile(filePath, "application/x-rar-compressed", "فرم ثبت طرح.rar");
        }



        #region Like Proposal

        /// <summary>
        /// Like a Proposal. The type of model is in EntityType property.
        /// </summary>
        /// <param name="vm">EntityType = "Proposal" </param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> LikeProposal([FromForm] LikeViewModel vm)
        {
            var result = await _projectAndProposalService.LikeProposal(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Removes like from proposal .
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> UnlikeProposal([FromForm] LikeViewModel vm)
        {
            var result = await _projectAndProposalService.UnLikeProposal(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        #endregion

        #region Comment

        /// <summary>
        /// Create Comment, Post action
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateCommentProposal([FromForm] CreateProposalCommentViewModel vm)
        {
            var result = await _projectAndProposalService.CreateProposalComment(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Returns all comment of a Proposal.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetCommentOfProposal(int proposalId, int? pageNo = 1)
        {
            var result = await _projectAndProposalService.GetCommentOfProposal(proposalId, pageNo);
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
        public async Task<ActionResult> GetProposalCommentById(int commentId)
        {
            var result = await _projectAndProposalService.GetProposalCommentById(commentId);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Like a proposal. The type of model is in EntityType property.
        /// </summary>
        /// <param name="vm">EntityType = "Question" or "Answer or nowledgeContent"</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> LikeProposalComment([FromForm] LikeViewModel vm)
        {
            var result = await _projectAndProposalService.LikeProposalComment(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Removes like from proposal Comment .
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> UnlikeProposalComment([FromForm] LikeViewModel vm)
        {
            var result = await _projectAndProposalService.UnlikeProposalComment(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        #endregion








    }
}
