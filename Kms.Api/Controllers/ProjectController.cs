using Kms.Application.Services.ProjectAndProposal;
using Kms.Application.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Kms.Api.Controllers
{
    public class ProjectController : KmsAuthorizeController
    {
        #region Constructor

        private readonly IProjectAndProposalService _projectAndProposalService;

        public ProjectController(IProjectAndProposalService projectAndProposalService)
        {
            _projectAndProposalService = projectAndProposalService;
        }

        #endregion

        #region Project

        /// <summary>
        /// Handles the creation of a new project.
        /// </summary>
        /// <param name="vm">The view model containing project details provided by the user.</param>
        /// <returns> </returns>
        [HttpPost]
        public async Task<IActionResult> CreateProject([FromForm] CreateProjectViewModel vm)
        {
            var result = await _projectAndProposalService.CreateProject(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Download File
        /// </summary>
        /// <returns></returns>

        [HttpGet]
        public IActionResult DownloadSampleProjectFile()
        {

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/files", "ثبت پروژه.rar");

            if (!System.IO.File.Exists(filePath))
                return NotFound();


            return PhysicalFile(filePath, "application/msword", "ثبت پروژه.rar");
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="projectFilter"></param>
        /// <param name="searchText"></param>
        /// <param name="goalId"></param>
        /// <param name="pageNo"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetAllProject(GetProjectTypesEnum projectFilter, string? searchText = null, int? goalId = null, int pageNo = 1)
        {
            var result = await _projectAndProposalService.GetAllProject(projectFilter, searchText, goalId, pageNo);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }



        /// <summary>
        /// Returns all unconfirmed project For Admin action.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetProjectsForAdminConfirm()
        {
            var result = await _projectAndProposalService.GetProjectsForAdminConfirm();
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
        public async Task<IActionResult> ConfirmProject([FromForm] CreateViewerViewModel vm)
        {
            var result = await _projectAndProposalService.ConfirmProject(vm);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        #region Like Project

        /// <summary>
        /// Like a Project. The type of model is in EntityType property.
        /// </summary>
        /// <param name="vm">EntityType = "Project" </param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> LikeProject([FromForm] LikeViewModel vm)
        {
            var result = await _projectAndProposalService.LikeProject(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Removes like from Project .
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> UnlikeProject([FromForm] LikeViewModel vm)
        {
            var result = await _projectAndProposalService.UnLikeProject(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Create Comment Project 
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateProjectComment([FromForm] CreateProjectCommentViewModel vm)
        {
            var result = await _projectAndProposalService.CreateProjectComment(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Returns all comment of a Project.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetCommentOfProject(int projectId, int? pageNo = 1)
        {
            var result = await _projectAndProposalService.GetCommentOfProject(projectId, pageNo);
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
        public async Task<ActionResult> GetProjectCommentById(int commentId)
        {
            var result = await _projectAndProposalService.GetProjectCommentById(commentId);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Like a project. The type of model is in EntityType property.
        /// </summary>
        /// <param name="vm">EntityType = "ProjectComment"</param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> LikeProjectComment([FromForm] LikeViewModel vm)
        {
            var result = await _projectAndProposalService.LikeCommentProject(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Removes like from project Comment .
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> UnlikeProjectComment([FromForm] LikeViewModel vm)
        {
            var result = await _projectAndProposalService.UnlikeCommentProject(vm);

            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }



        #endregion

        #endregion


    }
}
