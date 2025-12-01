

using Microsoft.AspNetCore.Http;

namespace Kms.Application.ViewModels
{
    public class CommentViewModel
    {
        #region Properties
        public int Id { get; set; }
        public string? CommentText { get; set; }
        public int LikeCount { get; set; }
        public bool IsLiked { get; set; }
        public List<TagsViewModel> Tags { get; set; }
        public UserViewModel User { get; set; }
        public List<MentionViewModel> Mentions { get; set; }
        public List<AttachmentViewModel> Attachments { get; set; }
        public string? MentionUserIds { get; set; }

        #endregion
    }

    public class CreateProposalCommentViewModel
    {
        public string CommentText { get; set; }
        public int UserId { get; set; }
        public int ProposalId { get; set; }
        public List<string> Tags { get; set; }
        public List<IFormFile>? ProposalCommentAttachments { get; set; }
    }
    public class CreateProjectCommentViewModel
    {
        public string CommentText { get; set; }
        public int UserId { get; set; }
        public int ProjectId { get; set; }
        public List<string> Tags { get; set; }
        public List<IFormFile>? ProposalCommentAttachments { get; set; }
    }
}
