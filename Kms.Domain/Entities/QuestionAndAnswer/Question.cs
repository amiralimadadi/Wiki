using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;
using Kms.Domain.Entities.General;

namespace Kms.Domain.Entities.QuestionAndAnswer
{
    public class Question : BaseEntity<int>
    {
		#region Properties
		[Display(Name = "عنوان پرسش")]
		[MaxLength(200,ErrorMessageResourceName = "GnMaxLengthErrorMessage",ErrorMessageResourceType = typeof(Resource))]
		[Required(ErrorMessageResourceName = "GnRequiredErrorMessage",ErrorMessageResourceType = typeof(Resource))]
		public string QuestionTitle { get; set; } = "";
        public string QuestionText { get; set; } = "";
        //public int QuestionPriority { get; set; } = 1;
        public string? QuestionType { get; set; }
        public int UserId { get; set; }
        public string? MentionUserIds { get; set; } 
        #endregion

        #region Relationships
        public List<QuestionGoal> QuestionGoals{ get; set; }
        public List<Answer>? QuestionAnswers { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        #endregion Relationships
    }
}