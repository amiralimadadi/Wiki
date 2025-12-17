namespace Kms.Application.ViewModels
{
    public class IgtUserViewModel
    {
        public string? IgtFullName { get; set; }
        public int IgtUserId { get; set; }
        public string? IgtUserName { get; set; }
    }

    public class UserViewModel
    {
        public int IgtUserId { get; set; }
        public int Id { get; set; }
        public string? FullName { get; set; }
        public string? UserName { get; set; }
    }

    public class UserProfileViewModel
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string FullName { get; set; }
        public string UserName { get; set; }
        public decimal TotalScoreAmount { get; set; }
        public string RemainingScoreText { get; set; }
        public string CurrentMedal { get; set; }
    }



}
