
using Common.ResourceFiles;
using Kms.Domain.Core;
using System.ComponentModel.DataAnnotations;

namespace Kms.Domain.Entities.ProjectAndProposal
{
    public class ProjectAndProposalAttachment : BaseEntity<int>
    {
        #region Properties
        [Display(Name = "نام موجودیت")]
        [MaxLength(100,
            ErrorMessageResourceName = "GnMaxLengthErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public string EntityName { get; set; }

        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public int EntityId { get; set; }

        [Display(Name = "آدرس فایل")]
        [MaxLength(500,
            ErrorMessageResourceName = "GnMaxLengthErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string Address { get; set; }

        [Display(Name = "فایل")]
        [MaxLength(500,
            ErrorMessageResourceName = "GnMaxLengthErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string FileName { get; set; }

        [Display(Name = "نام فایل")]
        [MaxLength(500,
            ErrorMessageResourceName = "GnMaxLengthErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public string? Name { get; set; }


        #endregion Properties
    }
}
