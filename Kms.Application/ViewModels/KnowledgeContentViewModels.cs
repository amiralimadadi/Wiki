using Common.ResourceFiles;
using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.Annotations;
using System.ComponentModel.DataAnnotations;

namespace Kms.Application.ViewModels
{
    public class KnowledgeContentViewModel
    {
        public int Id { get; set; }
        public string KnowledgeContentType { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
        public string? Abstract { get; set; }
        public string? GoalTitle { get; set; }
        public DateTime CreatedDate { get; set; }
        public int GoalId { get; set; }
        public int? LikeCount { get; set; }
        public int? PageViewCount { get; set; }
        public int? CommentCount { get; set; }
        public bool? IsLiked { get; set; }
        public bool? IsConfirm { get; set; }
        public bool IsActive  { get; set; }
        public UserViewModel? User { get; set; }
        public List<AttachmentViewModel> Attachments { get; set; }
        public List<TagsViewModel> Tags { get; set; }

        public List<MentionViewModel> Mentions { get; set; }
        public string? MentionUserIds { get; set; }

        public string? References { get; set; }
    }

    public class KnowledgeContentExpertConfirmsViewModel
    {
        public int KnowledgeContentId { get; set; }
        public int ExpertUserId { get; set; }
        public bool IsConfirmed { get; set; }
    }
    public class CreateKnowledgeContentViewModel
    {
        public int GoalId { get; set; }
        public string? Title { get; set; }
        public string? Abstract { get; set; }
        public string Text { get; set; }
        public List<string> Tags { get; set; }
        public List<int>? MentionUserId { get; set; }
        public List<string>? References { get; set; }
        public List<IFormFile>? KnowledgeContentAttachments { get; set; }
     
        [SwaggerSchema(Description = "انتخاب کاربرانی که امکان مشاهده را دارند")]
        public List<int>? Users { get; set; }
       
        [SwaggerSchema(Description = "انتخاب واحدهایی که امکان مشاهده  را دارند")]
        public List<int>? Units { get; set; }
    }

    public class ChangeKnowledgeContentTypeViewModel
    {
        public int KnowledgeContentId { get; set; }

        [Required(ErrorMessage = "عنوان اجباری است.")]
        [MaxLength(300, ErrorMessage = "عنوان نمی‌تواند بیشتر از 300 کاراکتر باشد.")]
        public string Title { get; set; }

        [Required(ErrorMessage = "چکیده اجباری است.")]
        public string Abstract { get; set; }

        [Required(ErrorMessage = "متن اجباری است.")]
        public string Text { get; set; }

        public List<string> Tags { get; set; }
        public List<int>? MentionUserId { get; set; }
        public List<string>? References { get; set; }
        public List<IFormFile>? KnowledgeContentAttachments { get; set; }
    }

    public class PrintKnowledgeContentViewModel
    {
        public int Id { get; set; }
        public string KnowledgeContentType { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
        public string? Abstract { get; set; }
        public string? GoalTitle { get; set; }
        public DateTime CreatedDate { get; set; }
        public int GoalId { get; set; }

        public UserViewModel? User { get; set; }
        public List<AttachmentViewModel> Attachments { get; set; }
        public List<TagsViewModel> Tags { get; set; }

        public string? References { get; set; }
    }

    public class ConfirmKnowledgeContentViewModel
    {
        [SwaggerSchema(Description = "انتخاب کاربرانی که امکان مشاهده را دارند")]
        public List<int>? UserId { get; set; }
        public int EntityId { get; set; }
        public int? GoalId { get; set; }
        [SwaggerSchema(Description = "انتخاب واحدهایی که امکان مشاهده  را دارند")]
        public List<int>? UnitId { get; set; }
        public string? Title { get; set; }
        public string? Abstract { get; set; }
        public string? Text { get; set; }
    }


    public enum KnowledgeContentTypeEnum
    {
        All,
        Structured,
        NonStructured,
        MyKnowledgeContent,
        MentionedKnowledgeContent,
        ExpertConfirm
    }


}
