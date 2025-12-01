using Microsoft.AspNetCore.Http;

namespace Common.UserService;

public class AuthenticateService:IAuthenticateService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuthenticateService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }
    public string? GetUserId()
    {
        var userId = _httpContextAccessor.HttpContext?.Request.Headers["UserId"].FirstOrDefault();
        return userId;
    }
}