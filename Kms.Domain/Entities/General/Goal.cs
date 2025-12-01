using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;
using Kms.Domain.Entities.KnowledgeContentGroup;
using Kms.Domain.Entities.ProjectAndProposal;
using Kms.Domain.Entities.QuestionAndAnswer;

namespace Kms.Domain.Entities.General
{
	public class Goal : BaseEntity<int>
	{
		#region Properties
		[Display(Name = "نوع هدف")]
		[Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
			ErrorMessageResourceType = typeof(Resource))]
		public int GoalType { get; set; }


		public int? ParentId { get; set; }


		[Display(Name = "عنوان هدف")]
		[MaxLength(500,
			ErrorMessageResourceName = "GnMaxLengthErrorMessage",
			ErrorMessageResourceType = typeof(Resource))]
		[Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
			ErrorMessageResourceType = typeof(Resource))]
		public string? GoalTitle { get; set; }


		public string GoalDescription { get; set; }


		public DateTime StartDate { get; set; }


		[Display(Name = "تاریخ شروع")]
		[MaxLength(10,
			ErrorMessageResourceName = "GnPersianDateFormatErrorMessage",
			ErrorMessageResourceType = typeof(Resource))]
		[Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
			ErrorMessageResourceType = typeof(Resource))]
        [RegularExpression(@"^[1-4]\d{3}/(0[1-6]/(0[1-9]|[12]\d|3[01])|0[7-9]/(0[1-9]|[12]\d|30)|(1[0-1]/(0[1-9]|[12]\d|30)|12/(0[1-9]|[12]\d)))",
            ErrorMessageResourceName = "GnPersianDateFormatErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public string StartPersianDate { get; set; }


		public DateTime EndDate { get; set; }


		[Display(Name = "تاریخ پایان")]
		[MaxLength(10,
			ErrorMessageResourceName = "GnPersianDateFormatErrorMessage",
			ErrorMessageResourceType = typeof(Resource))]
		[Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
			ErrorMessageResourceType = typeof(Resource))]
        [RegularExpression(@"^[1-4]\d{3}/(0[1-6]/(0[1-9]|[12]\d|3[01])|0[7-9]/(0[1-9]|[12]\d|30)|(1[0-1]/(0[1-9]|[12]\d|30)|12/(0[1-9]|[12]\d)))",
            ErrorMessageResourceName = "GnPersianDateFormatErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public string EndPersianDate { get; set; }


        public int UserId { get; set; }
		#endregion Properties

		#region Relationships
		[ForeignKey(nameof(UserId))]
        public User User { get; set; }


		public List<QuestionGoal>? QuestionGoals { get; set; }
        public List<KnowledgeContent>? KnowledgeContents { get; set; }
        public List<Proposal>? Proposals { get; set; }
        public List<Project>? Projects { get; set; }
        #endregion Relationships
    }
}