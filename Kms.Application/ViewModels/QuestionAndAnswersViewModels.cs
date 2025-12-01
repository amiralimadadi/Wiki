using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Kms.Domain.Entities.General;
using Kms.Domain.Entities.QuestionAndAnswer;
using Microsoft.AspNetCore.Http;
using static System.Collections.Specialized.BitVector32;

namespace Kms.Application.ViewModels
{
	public class CreateQuestionViewModel
	{
		#region Properties
		public List<int> GoalIds { get; set; }
		public string QuestionTitle { get; set; }
		public string QuestionText { get; set; }
		public List<string> Tags { get; set; }
		public List<int>? MentionUserId { get; set; }
		public List<IFormFile>? QuestionAttachments { get; set; }
		//public int QuestionPriority { get; set; }
		#endregion
	}

	public class QuestionViewModel
	{
		#region Properties
		public int Id { get; set; }
		public string? QuestionTitle { get; set; }
		public string? QuestionText { get; set; }
		//public int? QuestionPriority { get; set; }
		public string QuestionType { get; set; }
		public List<string?> GoalTile { get; set; }
		public List<AnswerViewModel>? QuestionAnswers { get; set; }
		public UserViewModel? User { get; set; }
        public List<AttachmentViewModel> Attachments { get; set; }
        //public List<string> Tags { get; set; }
        public List<TagsViewModel> Tags { get; set; }
        public List<MentionViewModel> Mentions { get; set; }
		public int? LikeCount { get; set; }
		public int? AnswerCount { get; set; }
		public bool? IsLiked { get; set; }
		public string? MentionUserIds { get; set; }
        public DateTime CreatedDate { get; set; }

        #endregion
    }

    public enum GetQuestionTypesEnum
	{
		AllQuestions,
		MyQuestions,
		MentionedQuestions
	}

	public class CreateAnswerViewModel
	{
		#region Properties
		public string AnswerText { get; set; }
		public int UserId { get; set; }
		public int QuestionId { get; set; }
        public List<int>? MentionUserId { get; set; }
        public List<string>? Tags { get; set; }
        public List<IFormFile>? AnswerAttachments { get; set; }

		#endregion

	}

	public class AnswerViewModel
	{
		#region Properties
		public int Id { get; set; }
		public string? AnswerText { get; set; }
		public int LikeCount { get; set; }
		public bool IsLiked { get; set; }
        public List<TagsViewModel> Tags { get; set; }
        public UserViewModel User { get; set; }
        public List<MentionViewModel> Mentions { get; set; }
        public List<AttachmentViewModel> Attachments { get; set; }
        public DateTime CreatedDate { get; set; }

        //public QuestionViewModel? Question { get; set; }
        public string? MentionUserIds { get; set; }

        #endregion
    }

    public class MentionViewModel
    {
        public int UserId { get; set; }
        public string? FullName  { get; set; }
    }

    public class QuestionsAdminConfirmViewModel
	{

		public int Id { get; set; }
		public List<string?> GoalTiles { get; set; }
		public string? QuestionTitle { get; set; }
		public string? QuestionText { get; set; }
		public List<QuestionTypeViewModel>? QuestionTypes { get; set; }
		public string? UserName { get; set; }
        public DateTime CreatedDate { get; set; }
        public bool IsDelete { get; set; }
		public bool IsActive { get; set; }


	}

    public class AnswersAdminConfirmViewModel
    {
        public int Id { get; set; }
        public int QuestionId { get; set; }
        public string? QuestionTitle { get; set; }
        public string? AnswerText { get; set; }
        public List<AnswerTypeViewModel>? AnswerTypes { get; set; }
        public string? UserName { get; set; }
        public bool IsDelete { get; set; }
        public bool IsActive { get; set; }
    }

    //public class AcceptQuestionViewModel
    //{
    //   public string? QuestionType { get; set; }
    //   public virtual bool IsActive { get; set; }
    //   public virtual bool IsDeleted { get; set; }


    //}


    public class LikeViewModel
	{
		public int EntityId { get; set; }
		public int UserId { get; set; }
		public LikeEntityEnum EntityType { get; set; }
	}

	public enum LikeEntityEnum
	{
		Question,
		Answer,
        KnowledgeContent,
		Comment,
        Proposal,
		ProposalComment,
		Project,
		ProjectComment
    }
}