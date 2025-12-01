
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;
using System.ComponentModel.DataAnnotations.Schema;
using Kms.Domain.Entities.General;

namespace Kms.Domain.Entities.UnitDocumentation
{
    public class UnitSubstitute : BaseEntity<int>
    {
        public int UserId { get; set; }
        public int UnitId { get; set; }


        #region Realations

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        [ForeignKey(nameof(UnitId))]
        public Unit Unit { get; set; }

        #endregion
    }
}
