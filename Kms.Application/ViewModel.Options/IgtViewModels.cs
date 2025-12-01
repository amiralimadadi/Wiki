namespace Kms.Application.ViewModel.Options
{
    public class IgtSetting
    {
        public string IgtToken { get; set; }
        public string ApiUrl { get; set; }
        public string ApiUrlUnit { get; set; }
        public string WhoAmIApi { get; set; }
        public string SearchApi { get; set; }
        public string SearchUnit { get; set; }
        public string NotificationApi { get; set; }

    }

    public class IgtSearchUserResponse
    {
        public List<IgtSearchUserData>? data { get; set; }
        public bool? isSuccess { get; set; }
        public string? statusCode { get; set; }
        public string? message { get; set; }
        public int? totalItemCount { get; set; }
        public int? pageNumber { get; set; }
        public int? pageSize { get; set; }
    }
    public class IgtSearchUserData
    {
        public bool? isActive { get; set; }
        public string? jetId { get; set; }
        public string? jetUserName { get; set; }
        public string? fullName { get; set; }
        public int? id { get; set; }
        public string? userName { get; set; }

        public int? creatorId { get; set; }
        public int? modifierId { get; set; }
        public bool? isPasswordUpdated { get; set; }
        public int? userType { get; set; }
        public string? email { get; set; }
        public string? mobileNumber { get; set; }
        public string? persianLastLoginDate { get; set; }
        public string? persianCreationDate { get; set; }
        public string? persianModificationDate { get; set; }
        public int? personId { get; set; }
        public string? nationalId { get; set; }
        public string? userTypeTitle { get; set; }
        public int? serviceChannelId { get; set; }
        public string? serviceChannelTitle { get; set; }
        public string? userBranches { get; set; }
        public List<object>? organizationPositionings { get; set; }
        //"organizationPositionings": []
    }
    public class IgtSearchUnitResponse
    {
        public List<IgtSearchUnitData>? data { get; set; }
        public bool? isSuccess { get; set; }
        public int statusCode { get; set; }
        public string? message { get; set; }
        public int? totalItemCount { get; set; }
        public int? pageNumber { get; set; }
        public int? pageSize { get; set; }
    }
    public class IgtSearchUnitData
    {
        public int? personId { get; set; }
        public int? igtPersonId { get; set; }
        public int igtUserId { get; set; }
        public int departmentId { get; set; }
        public int? organizationalStructureId { get; set; }
        public int? parentRef { get; set; }
        public string? departmentTitle { get; set; }
        public int? postId { get; set; }
        public string? postTitle { get; set; }
        public int? postStatus { get; set; }
        public int? capacity { get; set; }
        public int? levelCode { get; set; }
        public string? levelTitle { get; set; }
        public int? employeeId { get; set; }
        public string? nationalId { get; set; }
        public string? employeeName { get; set; }
        public string? code { get; set; }
        public int? gender { get; set; }
        public string? fatherName { get; set; }
        public string? idNumber { get; set; }
        public string? idSerial { get; set; }
        public string? email { get; set; }
        public string? workLocation { get; set; }
        public string? employmentDate { get; set; }
        public int employmentStatus { get; set; }
        public string birthDate { get; set; }
        public int? maritalStatus { get; set; }
        public string internalNumber { get; set; }
        public string mobile { get; set; }


    }

  
}
