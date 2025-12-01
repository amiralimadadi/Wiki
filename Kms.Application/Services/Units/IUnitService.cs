using Kms.Domain.Entities.General;

namespace Kms.Application.Services.Units;

public interface IUnitService
{
    string GetUserToken();
    Task<string> GetToken();
    Task<Unit> InsertNewUnit(int userId);
    Task<bool> CheckIsManager(int userId);
    Task<int> GetIgtUnitIdByUserId(int userId);
}