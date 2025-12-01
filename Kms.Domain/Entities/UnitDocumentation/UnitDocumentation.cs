
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;
using Kms.Domain.Entities.General;
using Kms.Domain.Entities.QuestionAndAnswer;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kms.Domain.Entities.UnitDocumentation
{
    public class UnitDocumentation : BaseEntity<int>
    {
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public int UnitId { get; set; }
        public string Title { get; set; }
        public string Position { get; set; }
        public string Text { get; set; }
        public int UserId { get; set; }
        public int PositionId { get; set; }

        #region Relationships

        [ForeignKey(nameof(UnitId))]
        public Unit Unit { get; set; }

        [ForeignKey(nameof(PositionId))]
        public Position UnitPosition { get; set; }
        
        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        #endregion
    }
}
