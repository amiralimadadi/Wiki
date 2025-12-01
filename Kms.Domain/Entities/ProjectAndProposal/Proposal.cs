

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;
using Kms.Domain.Entities.General;

namespace Kms.Domain.Entities.ProjectAndProposal
{
    public class Proposal : BaseEntity<int>
    {
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        [MaxLength(300, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string Title { get; set; }

        [MaxLength(300, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string? Abstract { get; set; }

        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        [MaxLength(300, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string IdeaCode { get; set; }

        public string Code { get; set; }

        public int UserId { get; set; }
        public int GoalId { get; set; }


        #region Relationships

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        [ForeignKey(nameof(GoalId))]
        public Goal Goal { get; set; }

        public List<ProposalComment>? ProposalComments { get; set; }

        #endregion
    }
}
