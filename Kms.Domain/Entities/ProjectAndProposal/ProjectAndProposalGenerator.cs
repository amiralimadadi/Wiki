

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;

namespace Kms.Domain.Entities.ProjectAndProposal
{
    public class ProjectAndProposalGenerator : BaseEntity<int>
    {
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public int UserId { get; set; }

        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public required string Kind { get; set; }

        #region relations

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }
        #endregion
    }
}
