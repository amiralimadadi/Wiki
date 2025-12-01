

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;

namespace Kms.Domain.Entities.General
{
    public class Medals : BaseEntity<int>
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        public new int Id { get; set; }

        [Display(Name = "نوع هدف")]
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public string Type { get; set; }

        public int MinScore { get; set; }

        public int MaxScore { get; set; }

        public List<User>? Users { get; set; }
    }
}
