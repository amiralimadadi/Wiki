using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;
using Kms.Domain.Entities.General;

namespace Kms.Domain.Entities.QuestionAndAnswer
{
    public class Answer : BaseEntity<int>
    {
        #region Properties
        public string AnswerText { get; set; } = "";
		public string? AnswerType { get; set; }

		[Display(Name = "پرسش")]
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",ErrorMessageResourceType = typeof(Resource))]
        public int QuestionId { get; set; }
		public int UserId { get; set; }
        public string? MentionUserIds { get; set; }
        #endregion

        #region Relationships
        [ForeignKey(nameof(QuestionId))]
        public Question Question { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

      

        #endregion Relationships
    }
}