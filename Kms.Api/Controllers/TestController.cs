using Kms.Api.Extensions;
using Kms.Application.ViewModel.Options;
using Microsoft.AspNetCore.Mvc;

namespace Kms.Api.Controllers
{
    public class TestController : KmsAuthorizeController
    {
        [HttpPost]
        public async Task<IActionResult> GetTest()
        {
            throw new NotImplementedException();
        }
    }
}
