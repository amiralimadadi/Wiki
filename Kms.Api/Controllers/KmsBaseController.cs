using Microsoft.AspNetCore.Mvc;

namespace Kms.Api.Controllers
{
	[Route("api/[controller]/[action]")]
	[ApiController]
	public class KmsBaseController : ControllerBase
	{
	
	}
	//[Authorize]
	public class KmsAuthorizeController : KmsBaseController
	{
	}

}
