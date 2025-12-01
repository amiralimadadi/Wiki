using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.General;

namespace Kms.Domain.Entities.UnitDocumentation
{
    public class Position : BaseEntity<int>
    {
        [MaxLength(150,
            ErrorMessageResourceName = "GnMaxLengthErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public string PositionName { get; set; }

        public int UnitId { get; set; }


        #region Relations

        [ForeignKey(nameof(UnitId))]
        public Unit Unit { get; set; }
        public List<UnitDocumentation>? UnitDocumentations { get; set; }

        #endregion

    }
}
