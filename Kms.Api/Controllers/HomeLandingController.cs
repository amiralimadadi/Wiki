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
		private readonly JwtSetting _jwtSetting;
        private readonly IHomeLanding _IHomeLanding;
		public HomeLandingController(
            IOptions<JwtSetting> jwtSetting,
            IHomeLanding homeLanding
            )
		{
			_jwtSetting = jwtSetting.Value;
            _IHomeLanding = homeLanding;
		}
		#endregion Constructor

		#region Login

		[HttpGet]
		public async Task<IActionResult> GetmanualSearch(string search)
		{
            var result = await _IHomeLanding.GetmanualSearch(search);
            if (!result.IsSuccess)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, result);
            }
            return StatusCode(StatusCodes.Status200OK, result);
        }

	
        #endregion Login
    }
}