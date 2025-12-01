using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Kms.Domain.Core;
using Kms.Domain.Entities.General;
using Common.ResourceFiles;

namespace Kms.Domain.Entities.QuestionAndAnswer
{
    public class QuestionGoal : BaseEntity<int>
    {
        #region Properties
        [Display(Name = "پرسش")]
		[Required(ErrorMessageResourceName = "GnRequiredErrorMessage",ErrorMessageResourceType = typeof(Resource))]
		public int QuestionId { get; set; }


		[Display(Name = "هدف")]
		[Required(ErrorMessageResourceName = "GnRequiredErrorMessage",ErrorMessageResourceType = typeof(Resource))]
		public int GoalId { get; set; }
        #endregion

        #region Relations
        [ForeignKey(nameof(QuestionId))]
        public Question Question { get; set; }

        [ForeignKey(nameof(GoalId))]
		public Goal Goal { get; set; }
        #endregion
    }
}