namespace Kms.Api.Igt
{
    public class IgtAuthenticationReponse
    {
        public IgtAuthenticationData data { get; set; }
        public bool isSuccess { get; set; }
        public string statusCode { get; set; }
        public string message { get; set; }
    }

    public class IgtAuthenticationData
    {
        public bool isActive { get; set; }
        public int creatorId { get; set; }
        public int modifierId { get; set; }
        public object jetId { get; set; } // null, assuming it can be different types
        public string jetUserName { get; set; }
        public bool isPasswordUpdated { get; set; }
        public string fullName { get; set; }
        public int userType { get; set; }
        public int id { get; set; }
        public string userName { get; set; }
        public string email { get; set; }
        public string mobileNumber { get; set; }
        public string persianLastLoginDate { get; set; }
        public string persianCreationDate { get; set; }
        public string persianModificationDate { get; set; }
        public long personId { get; set; }
        public string nationalId { get; set; }
        public string userTypeTitle { get; set; }
        public int serviceChannelId { get; set; }
        public string serviceChannelTitle { get; set; }
        public List<object> userBranches { get; set; } // Define specific class if structure is known
        public List<object> organizationPositionings { get; set; } // Define specific class if structure is known
    }
}
