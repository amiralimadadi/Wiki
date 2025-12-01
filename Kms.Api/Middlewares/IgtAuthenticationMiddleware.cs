using Kms.Application.ViewModel.Options;
using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Net.Http.Headers;
using System.Text;
using Kms.Api.Igt;
using Kms.Application.Services.Account;
using Kms.Application.ViewModels;

namespace Kms.Api.Middlewares
{
    public class IgtAuthenticationMiddleware : IMiddleware
    {
        private readonly IAccountService _accountService;
        private readonly IgtSetting _igtSettings;


        public IgtAuthenticationMiddleware(IAccountService accountService
            , IOptions<IgtSetting> igtSettings)
        {
            _accountService = accountService;
            _igtSettings = igtSettings.Value;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            var token = "";
            if (context.Request.Headers.ContainsKey("Authorization"))
            {
                token = context.Request.Headers["Authorization"].ToString().Split(" ")[1];
            }
            else
            {
                //Development mode
                token = _igtSettings.IgtToken;
                //token = "eyJhbGciOiJBMTI4S1ciLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwidHlwIjoiSldUIn0.uTaoYAr0lIAzwnmCuoluitt1a7unorlK_UeBgQPVfv7pNL_3_zv19Q.KJ5OhrUKOHcYsrO7qziAsQ.eHeEMG-qEkEax4Oop2VL66znS_qxu8n3kYKAPljxEAhRwZftoyGYkAsgfG_wPVXSg0-Tf-imw__QF-4o6ZOhQ0zeC8Bv1JIeHTmYEU7SOJhWiezkFpkeY-FaxkbX-rkVCChoQri2HjD0pihhopppFxez0cAQraR9VKzln1XwaOutiAq3rAkjOWIGHEMLzqOUUuAnIJAeKB6HDZvyhqVV_cgLhuiDsreh0nA7nG3-ZlQtFf8neLrAWSDQRRx-BodOLIvm3hVc-gluS7za8gBPBh8_38wPqiT0g1LtqwsEAas8ss_GCB8Pk38NWtTLHrLvwodUq-1eKDW8yg_XIiLOmk7p-gEgqPq7djXglN1VM-M7brOFXr_q9KQPyOcBx9gBYENsB39kElBOt_DLu8Untd5vQrzPa76rd1oJhu33QkvgW-njDpHRnf4K8VnnrpCtzqLCTe9WQVoIGfYcsVpOcQMPCjsGAhE3AyymkP7qXwGVE8iRboVhKUntJ4IEJ1RijgjXV018D6TFsXTZlj6-An4SP1K2ABpJUCXMPeFwNKl92Ep17KpZSLE8sN1J2E1E4xiGmEPZttPGM6hwtPro2QwYVp7hVPYyADq1ZJGRpXonSnPH8aBlut1dso7Xqm2CF2ZM3pYoL85rc9uTkjxxrxJmh5ImWXab_XBBbDn5uokxzwWiu9hiEmQEiFlX-ujoeYZTg0gpn8YKcueewklhYx2YBj_gWu4j9jWmb8pJ7BeSVuLfbwI1mJLojfxAs2Pe_gddQCFAXSEDb7MCVYzI0C8YKtpr5Ucc_AsuyE-DP_N5oQjTjJHJaqoA0MQxeQoXdvsYUrtp_x9jF3nKAWKQ_aJGs7e1-EMRBPwpbhQ__VewJ0C1w4fCLUa2skFRMwN4txRoprS4YDTpfnXNZTeknmAssuYMQCBjmu7WimhWEADRh_4AgBBfoBHQFSH5a-PaMAedANm48XHjH--ff5VjcTXKyjhFsrWwDkkomYclum2ljH1wL84ExkjGJ5uoIA7-ewX2srJZV5tBIG_Y3_dDbdB0-IpUCwG4nz5uJVoM2j_gAid1A9F1SitzmG1EHKBanU6GDpQZfeuaNiUL8aUxpW4UeU8h4Q2BwN3cxb22q86T-W7xmEP0b03I8M3MuDB8ieiWXLed-j6h3qR5VjsEQw.3fPs3TboaLuWi8un5u0bFQ";
            }


            #region Who am I
            HttpClient client = new HttpClient();


            // Set the URI of the API
            string uri = $"{_igtSettings.ApiUrl}{_igtSettings.WhoAmIApi}";

            // Authentication token (usually obtained through a previous login or authorization process)
            string authToken = $"{token}";

            // Add the authorization header with the bearer token
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", authToken);

            string json = "";

            // Prepare the content to send
            StringContent content = new StringContent(json, Encoding.UTF8, "application/json");

            // Send a POST request to the specified URI with the JSON content
            HttpResponseMessage response = await client.PostAsync(uri, content);

            // Ensure the request was successful
            response.EnsureSuccessStatusCode();

            // Read the response body as a string
            string responseBody = await response.Content.ReadAsStringAsync();

            var igtResponse = JsonSerializer.Deserialize<IgtAuthenticationReponse>(responseBody);

            var igtUser = new IgtUserViewModel()
            {
                IgtFullName = igtResponse.data.fullName,
                IgtUserId = igtResponse.data.id,
                IgtUserName = igtResponse.data.userName,
            };

            var res = await _accountService.SignUpSignIn(igtUser);

            context.Request.Headers.Add("UserName", res.Data?.UserName);
            context.Request.Headers.Add("UserId", res.Data?.Id.ToString());
            context.Request.Headers.Add("IgtUserId", res.Data?.IgtUserId.ToString());

            #endregion

            await next(context);
        }
    }
}
