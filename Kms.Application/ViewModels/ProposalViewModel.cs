

using Microsoft.AspNetCore.Http;

namespace Kms.Application.ViewModels
{
    public class ProposalViewModel
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Abstract { get; set; }
        public string? GoalTitle { get; set; }
        public int GoalId { get; set; }
        public string? Code { get; set; }
        public DateTime CreatedDate { get; set; }
        public int? LikeCount { get; set; }
        public int? CommentCount { get; set; }
        public bool IsLiked { get; set; }
        public int? PageViewCount { get; set; }
        public string? IdeaCode { get; set; }
        public UserViewModel? User { get; set; }
        public List<TagsViewModel> Tags { get; set; }
        public List<AttachmentViewModel> Attachments { get; set; }
        public bool IsCreator { get; set; }
    }

    public class CreateProposalViewModel
    {
        public int GoalId { get; set; }
        public string? Title { get; set; }
        public string? Abstract { get; set; }
        public string? IdeaCode { get; set; }
        public List<string> Tags { get; set; }
        public List<IFormFile>? ProposalAttachments { get; set; }
    }
    public class ProposalCommentViewModel
    {
        #region Properties
        public int Id { get; set; }
        public string? CommentText { get; set; }
        public int LikeCount { get; set; }
        public bool IsLiked { get; set; }
        public List<TagsViewModel> Tags { get; set; }
        public UserViewModel User { get; set; }
        public List<AttachmentViewModel> Attachments { get; set; }
        
        #endregion
    }

    public class CreateCommentViewModel
    {
        public string CommentText { get; set; }
        public int UserId { get; set; }
        public int KnowledgeContentId { get; set; }
        public List<int>? MentionUserId { get; set; }
        public List<string> Tags { get; set; }
        public List<IFormFile>? CommentAttachments { get; set; }
    }

    public class ProjectCommentViewModel
    {
        #region Properties
        public int Id { get; set; }
        public string? CommentText { get; set; }
        public int LikeCount { get; set; }
        public bool IsLiked { get; set; }
        public List<TagsViewModel> Tags { get; set; }
        public UserViewModel User { get; set; }
        public List<AttachmentViewModel> Attachments { get; set; }

        #endregion
    }

  

    public enum GetProposalTypesEnum
    {
        AllProposal,
        MyProposal,
        Approved
    }
    public enum GetProjectTypesEnum
    {
        AllProject,
        MyProject,
        Approved
    }
}
