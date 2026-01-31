using Kms.Api.Extensions;
using Kms.Application.Services.HomeLanding;
using Kms.Application.ViewModel.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Kms.Api.Controllers
{
    /// <summary>
    /// Account managements, like Login, Logout and ... 
    /// </summary>
    public class HomeLandingController : KmsBaseController
	{
		#region Constructor
        private readonly IHomeLandingService _homeLandingService;
		public HomeLandingController(
            
            IHomeLandingService homeLandingService
            )
		{
            _homeLandingService = homeLandingService;
		}
        #endregion Constructor


        [HttpGet]
        public async Task<ActionResult> GetTop50Contents()
        {
            var result = await _homeLandingService.GetTop50Contents();
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }


        [HttpGet]
		public async Task<IActionResult> GetmanualSearch(string search)
		{
            var result = await _homeLandingService.GetmanualSearch(search);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }
	
    }
}