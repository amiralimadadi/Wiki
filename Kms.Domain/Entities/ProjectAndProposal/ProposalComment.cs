using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Kms.Domain.Entities.ProjectAndProposal
{
    public class ProposalComment : BaseEntity<int>
    {
        #region Properties

        public string CommentText { get; set; }

        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public int ProposalId { get; set; }

        public int UserId { get; set; }
        

        #endregion

        #region RelationShips

        [ForeignKey(nameof(ProposalId))]
        public Proposal Proposal { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        #endregion
    }
}
