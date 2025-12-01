using Kms.Api.Extensions;
using Kms.Application.ViewModel.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Kms.Api.Controllers
{
    /// <summary>
    /// Account managements, like Login, Logout and ... 
    /// </summary>
    public class AccountController : KmsBaseController
	{
		#region Constructor
		private readonly JwtSetting _jwtSetting;
		public AccountController(IOptions<JwtSetting> jwtSetting)
		{
			_jwtSetting = jwtSetting.Value;
		}
		#endregion Constructor

		#region Login
		/// <summary>
		/// Generate a token for current logged in user. The user was authenticated by IGT before.
		/// </summary>
		/// <param name="userId"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<IActionResult> GetToken(string userId)
		{
			const string userName = "Mohsen";    // Get From IGT

			var token = new LoginService(_jwtSetting).LoginUserByJwt(userId, userName);

			return Ok(token);
		}

	
        #endregion Login
    }
}