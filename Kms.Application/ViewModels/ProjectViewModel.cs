
using Microsoft.AspNetCore.Http;

namespace Kms.Application.ViewModels
{
    public class ProjectViewModel
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Abstract { get; set; }
        public string? GoalTitle { get; set; }
        public string? ProposalCode { get; set; }
        public int GoalId { get; set; }
        public string Code { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? LikeCount { get; set; }
        public int? CommentCount { get; set; }
        public string? IdeaCode { get; set; }
        public bool IsLiked { get; set; }
        public UserViewModel? User { get; set; }
        public List<TagsViewModel> Tags { get; set; }
        public List<AttachmentViewModel> Attachments { get; set; }
    }

    public class CreateProjectViewModel
    {
        public int GoalId { get; set; }
        public string? Title { get; set; }
        public string? Abstract { get; set; }
        public string? IdeaCode { get; set; }
        public string? ProposalCode { get; set; }
        public List<string> Tags { get; set; }
        public List<IFormFile>? ProjectAttachments { get; set; }
    }
}
