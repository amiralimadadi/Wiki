using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;


namespace Kms.Domain.Entities.ProjectAndProposal
{
    public class Admin : BaseEntity<int>
    {
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public int UserId { get; set; }

        public string Kind { get; set; }


        #region relations

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }
        #endregion
    }
}
