using Common.OperationResult;
using Kms.Application.ViewModels;
using Kms.Domain.Entities.General;

namespace Kms.Application.Services.Account
{
    public interface IAccountService 
    {
        Task<OperationResult<UserViewModel>> SignUpSignIn(IgtUserViewModel igtUserViewModel);
        int GetUserId();
        string GetUserToken();
        Task InsertNewUsers(List<int>? userIds);
        Task InsertNewUser(int userId);
      

    }
}
