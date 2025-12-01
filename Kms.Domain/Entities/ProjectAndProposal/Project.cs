using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;
using Kms.Domain.Entities.General;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Kms.Domain.Entities.ProjectAndProposal
{
    public class Project : BaseEntity<int>
    {
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        [MaxLength(300, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string Title { get; set; }

        [MaxLength(500, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string? Abstract { get; set; }

        [MaxLength(300, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string? IdeaCode { get; set; }
        
        [MaxLength(300, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string? ProposalCode { get; set; }
        public string Code { get; set; }

        public int UserId { get; set; }
        public int GoalId { get; set; }


        #region Relationships

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        [ForeignKey(nameof(GoalId))]
        public Goal Goal { get; set; }

        public List<ProjectComment>? ProjectComments { get; set; }

        #endregion
    }
}
