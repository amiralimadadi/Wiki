using Kms.Application.Services.Gamifications;
using Microsoft.AspNetCore.Mvc;

namespace Kms.Api.Controllers
{
	public class GamificationController : KmsBaseController
	{
		private readonly IGamificationService _gamificationService;

		/// <summary>
		/// 
		/// </summary>
		/// <param name="gamificationService"></param>
		public GamificationController(IGamificationService gamificationService)
		{
			_gamificationService = gamificationService;
		}

        [HttpGet]
        public async Task<IActionResult> GetAllScore()
        {
            {
                var result = await _gamificationService.GetAllScore();
                if (!result.IsSuccess)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, result);
                }

                return StatusCode(StatusCodes.Status200OK, result);
            }

        }

        [HttpGet]
        public async Task<IActionResult> GetAllUserScore()
        {
            {
                var result = await _gamificationService.GetAllUserScore();
                if (!result.IsSuccess)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, result);
                }

                return StatusCode(StatusCodes.Status200OK, result);
            }

        }

        [HttpGet]
		public async Task<IActionResult> GetUserScoreDetails(int userId, string? searchText, int pageNo = 1)
		{
			var result = await _gamificationService.GetUserScoreDetails(userId,searchText,pageNo);

			if (!result.IsSuccess)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, result);
			}

			return StatusCode(StatusCodes.Status200OK, result);
		}

		[HttpGet]
		public async Task<IActionResult> GetUserScoreAggregate(List<int>? userIds, int? pageNo = 1)
		{
			var result = await _gamificationService.GetUserScoreAggregate(userIds, pageNo);

			if (!result.IsSuccess)
			{
				return StatusCode(StatusCodes.Status500InternalServerError, result);
			}
			return StatusCode(StatusCodes.Status200OK, result);
		}
	}
}
