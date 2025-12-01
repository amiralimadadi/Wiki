
using Kms.Application.ViewModel.Options;
using Kms.Domain.Entities.General;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using AutoMapper;
using Kms.DataLayer.Contracts;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Kms.Application.Services.Units
{
    public class UnitService : IUnitService
    {

        private readonly IUnitRepository _unitRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IgtSetting _igtSettings;
        //private readonly HttpClient _client;
        private readonly IgtTokenUnit _igtTokenUnit;


        public UnitService(
            IUnitRepository unitRepository,
            IHttpContextAccessor httpContextAccessor,
           IOptions<IgtSetting> igtSettings,
            IOptions<IgtTokenUnit> igtTokenUnit
            //HttpClient client
            )
        {

            _unitRepository = unitRepository;
            _httpContextAccessor = httpContextAccessor;
            _igtSettings = igtSettings.Value;
            //_client = client;
           _igtTokenUnit=igtTokenUnit.Value;
        }

        public string GetUserToken()
        {
            var token = "";
            if (_httpContextAccessor.HttpContext?.Request.Headers.ContainsKey("Authorization") == true)
            {
                token = _httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString().Split(" ")[1];
            }
            else
            {
                //Development mode
                token = _igtSettings.IgtToken;
            }
            return token ?? "";
        }
        public async Task<string> GetToken()
        {
            //var uri = $"{_baseUrl}/api/v1/Users/GetToken";  
            var client = new HttpClient();
            var uri = $"{_igtTokenUnit.BaseURL}{_igtTokenUnit.WhoAmIApi}";
            

            var tokenRequest = new TokenRequest
            {
                grant_type = "password",
                UserName = _igtTokenUnit.userName,
                Password = _igtTokenUnit.password
            };
            
            var jsonContent = JsonSerializer.Serialize(tokenRequest);
           
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
            var response = await client.PostAsync(uri, content);
            
            if (!response.IsSuccessStatusCode)
            {

                //throw new Exception("دریافت توکن با خطا مواجه شد.");
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var tokenResponse = JsonSerializer.Deserialize<TokenResponse>(responseBody, options);

            if (tokenResponse == null || !tokenResponse.IsSuccess || tokenResponse.Data == null || string.IsNullOrEmpty(tokenResponse.Data.access_token))
            {
                throw new Exception("توکن یافت نشد.");
            }
            return tokenResponse.Data.access_token;
        }
        public async Task<Unit> InsertNewUnit(int userId)
        {
            var client = new HttpClient();


            var uri = $"{_igtSettings.ApiUrlUnit}{_igtSettings.SearchUnit}";


            var authToken = GetUserToken();
            if (string.IsNullOrEmpty(authToken))
            {
                throw new Exception("در عملیات ثبت ارجاعات خطا روی داده است. توکن احراز هویت یافت نشد");
            }


            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", authToken);

            var requestBody = new
            {
                igtUserId = $"{userId.ToString()}"
            };


            var jsonContent = JsonSerializer.Serialize(requestBody);

            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(uri, content);

            response.EnsureSuccessStatusCode();


            var responseBody = await response.Content.ReadAsStringAsync();

            var igtResponse = JsonSerializer.Deserialize<IgtSearchUnitResponse>(responseBody);

            if (igtResponse == null || igtResponse.isSuccess == false || igtResponse.data == null || !igtResponse.data.Any())
            {
                throw new Exception("خطا در دریافت داده‌های واحد. لطفاً دوباره تلاش کنید.");
            }
            var newUnit = new Unit()
            {
                IgtDepartmentId = igtResponse.data[0].departmentId,
                UnitName = igtResponse.data[0].departmentTitle ?? "واحد نامعتیر"
            };
            await _unitRepository.AddAsync(newUnit, true);

            return newUnit;
        }
        public async Task<bool> CheckIsManager(int userId)
        {
            // return true;

            //if (userId == 1208)
            //{
            //    return true;
            //}
            var client = new HttpClient();

            var uri = $"{_igtSettings.ApiUrlUnit}{_igtSettings.SearchUnit}";

            //var authToken = GetUserToken();
             var authToken =await GetToken();
            if (string.IsNullOrEmpty(authToken))
            {
                throw new Exception("در عملیات ثبت ارجاعات خطا روی داده است. توکن احراز هویت یافت نشد");
            }

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", authToken);

            var requestBody = new
            {
                igtUserId = $"{userId.ToString()}"
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);

            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(uri, content);

            response.EnsureSuccessStatusCode();


            var responseBody = await response.Content.ReadAsStringAsync();

            var igtResponse = JsonSerializer.Deserialize<IgtSearchUnitResponse>(responseBody);

            if (igtResponse == null || igtResponse.isSuccess == false || igtResponse.data == null || !igtResponse.data.Any())
            {
                throw new Exception("خطا در دریافت داده‌های واحد. لطفاً دوباره تلاش کنید.");
            }
            var firstItem = igtResponse.data.FirstOrDefault();
            if (firstItem != null && firstItem.levelCode == 6)
            {
                return true;
            }
            return false;
        }
        public async Task<int> GetIgtUnitIdByUserId(int userId)
        {
            //if (userId == 24983 || userId == 1884 || userId == 54398 || userId == 1208)
            //{
            //    return 12;
            //}
            var client = new HttpClient();

            var uri = $"{_igtSettings.ApiUrlUnit}{_igtSettings.SearchUnit}";

            var authToken =await GetToken();
           // var authToken =await GetToken();
            if (string.IsNullOrEmpty(authToken))
            {
                throw new Exception("در عملیات ثبت ارجاعات خطا روی داده است. توکن احراز هویت یافت نشد");
            }

            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", authToken);

            var requestBody = new
            {
                igtUserId = $"{userId.ToString()}"
            };

            var jsonContent = JsonSerializer.Serialize(requestBody);

            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(uri, content);

            if (!response.IsSuccessStatusCode) return -1;

            response.EnsureSuccessStatusCode();


            var responseBody = await response.Content.ReadAsStringAsync();

            var igtResponse = JsonSerializer.Deserialize<IgtSearchUnitResponse>(responseBody);

            if (igtResponse == null || igtResponse.isSuccess == false || igtResponse.data == null || !igtResponse.data.Any())
            {
                return -1;
            }
            var firstItem = igtResponse.data.FirstOrDefault();
            if (firstItem != null)
            {
                return firstItem.departmentId;
            }

            return -1;
        }
    }
}
