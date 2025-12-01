
using Common.ResourceFiles;
using Kms.Domain.Core;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Kms.Domain.Entities.UnitDocumentation;

namespace Kms.Domain.Entities.General
{
    public class Unit : BaseEntity<int>
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.None)]
        public new int Id { get; set; }

        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public int IgtDepartmentId { get; set; }

        [MaxLength(150,
            ErrorMessageResourceName = "GnMaxLengthErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public string UnitName { get; set; }


        public List<Position>? Positions { get; set; }
        public List<UnitSubstitute> UnitSubstitutes { get; set; }
       
    }
}
