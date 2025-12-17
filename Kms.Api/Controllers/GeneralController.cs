using Kms.Application.Services.General;
using Kms.Application.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Kms.Api.Controllers
{
    /// <summary>
    /// General entities like Goal are here.
    /// </summary>
	public class GeneralController : KmsAuthorizeController
	{
		private readonly IGeneralService _generalService;

		#region Constructor

		public GeneralController(IGeneralService generalService)
		{
			_generalService = generalService;
		}
        #endregion Constructor

        

        /// <summary>
        /// Returns all active Goals in goals tree.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetTotalGoalTree()
        {
            var result = await _generalService.GetTotalGoalTree();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


      
        [HttpGet]
        public async Task<ActionResult> GetGoalsTreeBeyondSecondLevel()
        {
            var result = await _generalService.GetGoalsTreeBeyondSecondLevel();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Returns all direct subset of nodes based on parameter in goals tree.
        /// </summary>
        /// <param name="rootId"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetGoalSubTree(int rootId)
        {
            var result = await _generalService.GetGoalSubTree(rootId);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Returns details of goal.
        /// </summary>
        /// <param name="goalId"></param>
        /// <returns></returns>
        [HttpGet("{goalId}")]
        public async Task<ActionResult> GetGoalById(int goalId)
        {

            var result = await _generalService.GetGoalById(goalId);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }


            return StatusCode(StatusCodes.Status200OK, result);

        }


        /// <summary>
        /// Returns all rows of CodeDescription table.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetCodeDescription()
        {
            var result = await _generalService.GetCodeDescription();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Creates one goal in the goals tree.
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> CreateGoal(CreateGoalViewModel vm)
        {
            var result = await _generalService.CreateGoal(vm);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Updates goal data.
        /// </summary>
        /// <param name="goalId"></param>
        /// <param name="editGoal"></param>
        /// <returns></returns>
        //[HttpPut("{goalId}")]        
        [HttpPost("{goalId}")]
        public async Task<ActionResult> UpdateGoal(int goalId, EditGoalViewModel editGoal)
        {

            var result = await _generalService.UpdateGoal(goalId, editGoal);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Removes a goal.
        /// </summary>
        /// <param name="goalId"></param>
        /// <returns></returns>
        //[HttpDelete("{goalId}")]
        [HttpPost("{goalId}")]
        public async Task<ActionResult> DeleteGoal(int goalId)
        {
            var result = await _generalService.DeleteGoal(goalId);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }


            return StatusCode(StatusCodes.Status200OK, result);
        }


        //[HttpPost("{parentId}")]
        //public async Task<IActionResult> AddGoalByParentId(int parentId, AddGoalViewModel goal)
        //{
        //    var result = await _generalService.AddGoalByParentId(parentId, goal);
        //    if (!result.IsSuccess)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError, result);
        //    }


        //    return StatusCode(StatusCodes.Status200OK, result);
        //}

        /// <summary>
        /// Expires all goals in goals tree.
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> ExpireAll()
        {
            var result = await _generalService.ExpireAll();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Get All Tags
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetAllTags()
        {
            var result = await _generalService.GetAllTags();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Add a view to the selected page.
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AddVisitPageView([FromForm] AddVisitPageViewModel vm)
        {
            var result = await _generalService.AddVisitPageView(vm);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }



        [HttpGet]
        public async Task<ActionResult> GetTop50Contents()
        {
            var result = await _generalService.GetTop50Contents();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        #region Admin

        /// <summary>
        /// Add User To Admin
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AddUserToAdmins([FromForm] CreateAdminViewModel vm)
        {
            var result = await _generalService.AddUserToAdmins(vm);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Get all people who are admins
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetAllAdmins()
        {
            var result = await _generalService.GetAllAdmins();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Get profile information for the Current user
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetProfileDataForCurrentUser()
        {
            var result = await _generalService.GetProfileDataForCurrentUser();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Get profile information for the user By UserId
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetProfileDataByUserId(int userId)
        {
            var result = await _generalService.GetProfileDataByUserId(userId);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Get profile information for All users
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetProfileDataForAllUsers()
        {
            var result = await _generalService.GetProfileDataForAllUsers();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Get Top Three Users By Score
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetTopThreeUsersByScore()
        {
            var result = await _generalService.GetTopThreeUsersByScore();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }



        /// <summary>
        /// Retrieving the access list by userID
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<ActionResult> GetAdminListByUserId(int userId)
        {
            var result = await _generalService.GetAccessListByUserId(userId);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        #endregion



    }
}
