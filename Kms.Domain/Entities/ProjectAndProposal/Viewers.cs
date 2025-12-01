using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;
using Kms.Domain.Entities.General;

namespace Kms.Domain.Entities.ProjectAndProposal
{
    public class Viewers : BaseEntity<int>
    {
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public int EntityId { get; set; }

       
        public int? UserId { get; set; }

        public int? UnitId { get; set; }


        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public required string Kind { get; set; }

        public User? User { get; set; }

        
        public Unit? Unit { get; set; }
    }
}
