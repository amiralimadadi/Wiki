
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kms.Domain.Entities.General
{
    public class UnitResponsible : BaseEntity<int>
    {
        [Display(Name = "کاربر")]
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public int UserId { get; set; }


        [Display(Name = "واحد")]
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public int UnitId { get; set; }


        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        [ForeignKey(nameof(UnitId))]
        public Unit Unit { get; set; }

    }
}
