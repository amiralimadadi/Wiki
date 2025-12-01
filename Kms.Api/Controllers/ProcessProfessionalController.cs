using Kms.Application.Services.General;
using Kms.Application.ViewModels;
using Microsoft.AspNetCore.Mvc;

namespace Kms.Api.Controllers
{
    /// <summary>
    /// Expert managements
    /// </summary>
    public class ProcessProfessionalController :KmsBaseController
    {
        #region Constructor

        private readonly IGeneralService _generalService;

        public ProcessProfessionalController(IGeneralService generalService)
        {
            _generalService = generalService;
        }

        #endregion


        /// <summary>
        /// Get All Experts
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetAllExperts()
        {
            var result = await _generalService.GetAllExperts();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Add User To Expert
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AddUserToExpert([FromForm] CreateExpertViewModel vm)
        {
            var result = await _generalService.AddUserToExpert(vm);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }



        /// <summary>
        /// Get All Owners
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public async Task<IActionResult> GetAllOwners()
        {
            var result = await _generalService.GetAllOwners();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

        /// <summary>
        /// Add User To Owner
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AddUserToOwner([FromForm] CreateExpertViewModel vm)
        {
            var result = await _generalService.AddUserToOwner(vm);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }

            return StatusCode(StatusCodes.Status200OK, result);
        }


        /// <summary>
        /// Delete Expert Or Owner 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost("{id}")]
        public async Task<ActionResult> DeleteExpertOrOwner(int id,int goalId)
        {
            var result = await _generalService.DeleteExpertOrOwner(id, goalId);
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
        /// Delete Admin
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpPost("{id}")]
        public async Task<ActionResult> DeleteAdminById(int id)
        {
            var result = await _generalService.DeleteAdminById(id);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }


            return StatusCode(StatusCodes.Status200OK, result);
        }

        #endregion


    }
}
