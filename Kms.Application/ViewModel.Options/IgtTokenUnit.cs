

namespace Kms.Application.ViewModel.Options
{
    public class IgtTokenUnit
    {
        public string BaseURL { get; set; }
        public string WhoAmIApi { get; set; }
        public string userName { get; set; }
        public string password { get; set; }
    }
    public class TokenData
    {
        public string access_token { get; set; }
        public string token_type { get; set; }
        public int expires_in { get; set; }
    }

    public class TokenResponse
    {
        public TokenData Data { get; set; }
        public bool IsSuccess { get; set; }
        public string StatusCode { get; set; }
        public string Message { get; set; }
    }
    public class TokenRequest
    {
        public string grant_type { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
    }
}
