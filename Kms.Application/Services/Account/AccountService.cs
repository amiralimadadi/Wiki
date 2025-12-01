using AutoMapper;
using Common.OperationResult;
using Kms.Application.ViewModel.Options;
using Kms.Application.ViewModels;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.Account;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Kms.Application.Services.Account
{
    public class AccountService : IAccountService
    {

        private readonly IUserRepository _userRepository;
        private readonly IUnitRepository _unitRepository;
        private readonly IUnitResponsibleRepository _unitResponsibleRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IMapper _mapper;
        private readonly IgtSetting _igtSettings;

        public AccountService(IUserRepository userRepository,
                              IUnitRepository unitRepository,
                              IUnitResponsibleRepository unitResponsibleRepository,
                              IMapper mapper,
                              IHttpContextAccessor httpContextAccessor,
                              IOptions<IgtSetting> igtSettings)
        {
            _userRepository = userRepository;
            _unitRepository = unitRepository;
            _unitResponsibleRepository = unitResponsibleRepository;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _igtSettings = igtSettings.Value;
        }

        public async Task<OperationResult<UserViewModel>> SignUpSignIn(IgtUserViewModel igtUserViewModel)
        {
            var retUser = new UserViewModel();

            igtUserViewModel.IgtUserId = igtUserViewModel?.IgtUserId ?? 0;
            var tempUser = _userRepository.GetEntity(a => a.UserName == igtUserViewModel.IgtUserName
                && a.IgtUserId == igtUserViewModel.IgtUserId.ToString()).FirstOrDefault();

            if (tempUser == null)
            {
                var addingUser = new User()
                {
                    IgtUserId = igtUserViewModel.IgtUserId.ToString(),
                    Id = igtUserViewModel.IgtUserId,
                    UserName = igtUserViewModel.IgtUserName,
                    FirstName = igtUserViewModel.IgtFullName,
                    LastName = igtUserViewModel.IgtFullName,
                    FullName = igtUserViewModel.IgtFullName,
                };

                await _userRepository.AddAsync(addingUser, true);

                _mapper.Map(addingUser, retUser);
            }
            else
            {
                _mapper.Map(tempUser, retUser);
            }
            return new OperationResult<UserViewModel>(true, retUser, nameof(User));
        }
        public int GetUserId()
        {
            var userId = _httpContextAccessor.HttpContext?.Request.Headers["UserId"].FirstOrDefault();
            int tempId = int.Parse(userId!);
            return tempId;
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
        public async Task InsertNewUsers(List<int>? userIds)
        {
            var newUsers = new List<User>();

            if (userIds != null)
                foreach (var item in userIds)
                {
                    #region Search Igt Users

                    var client = new HttpClient();

                    var uri = $"{_igtSettings.ApiUrl}{_igtSettings.SearchApi}";

                    var authToken = GetUserToken();
                    if (string.IsNullOrEmpty(authToken))
                    {
                        throw new Exception("در عملیات ثبت ارجاعات خطا روی داده است. توکن احراز هویت یافت نشد");
                    }
                   
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", authToken);

                    var requestBody = new
                    {
                        id = $"{item.ToString()}"
                    };
                
                    var jsonContent = JsonSerializer.Serialize(requestBody);
                    
                    var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                    var response = await client.PostAsync(uri, content);

                    response.EnsureSuccessStatusCode();

                  
                    var responseBody = await response.Content.ReadAsStringAsync();

                    var igtResponse = JsonSerializer.Deserialize<IgtSearchUserResponse>(responseBody);

                    #endregion

                    if (igtResponse != null && igtResponse.isSuccess == true
                                            && igtResponse.data != null && igtResponse.data.Count > 0)
                    {
                        var newUser = new User()
                        {
                            Id = igtResponse.data[0].id ?? item,
                            IgtUserId = igtResponse.data[0].id?.ToString() ?? item.ToString(),
                            UserName = igtResponse.data[0].userName ?? "NoUserName.N",
                            FirstName = igtResponse.data[0].fullName ?? "No Name",
                            LastName = igtResponse.data[0].fullName ?? "No Name",
                            FullName = igtResponse.data[0].fullName ?? "No Name",
                            NationalId = igtResponse.data[0].nationalId ?? "No National Code"
                        };
                        newUsers.Add(newUser);
                        //var tt = await _userRepository.AddAsync(newUser);
                    }
                }

            if (newUsers.Any())
            {
                await _userRepository.AddRangeAsync(newUsers, true);
            }
        }
        public async Task InsertNewUser(int userId)
        {
            var client = new HttpClient();

            var uri = $"{_igtSettings.ApiUrl}{_igtSettings.SearchApi}";


            var authToken = GetUserToken();
            if (string.IsNullOrEmpty(authToken))
            {
                throw new Exception("در عملیات ثبت ارجاعات خطا روی داده است. توکن احراز هویت یافت نشد");
            }


            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", authToken);

            var requestBody = new
            {
                id = $"{userId.ToString()}"
            };


            var jsonContent = JsonSerializer.Serialize(requestBody);

            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var response = await client.PostAsync(uri, content);

            response.EnsureSuccessStatusCode();


            var responseBody = await response.Content.ReadAsStringAsync();

            var igtResponse = JsonSerializer.Deserialize<IgtSearchUserResponse>(responseBody);

            if (igtResponse != null && igtResponse.isSuccess == true
                                    && igtResponse.data != null && igtResponse.data.Count > 0)
            {
                var newUser = new User()
                {
                    Id = igtResponse.data[0].id ?? userId,
                    IgtUserId = igtResponse.data[0].id?.ToString() ?? userId.ToString(),
                    UserName = igtResponse.data[0].userName ?? "NoUserName.N",
                    FirstName = igtResponse.data[0].fullName ?? "No Name",
                    LastName = igtResponse.data[0].fullName ?? "No Name",
                    FullName = igtResponse.data[0].fullName ?? "No Name",
                    NationalId = igtResponse.data[0].nationalId ?? "No National Code"
                };
                await _userRepository.AddAsync(newUser, true);
            }

            return;
        }
    }
}
