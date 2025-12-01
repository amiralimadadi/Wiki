using System.ComponentModel.DataAnnotations;
using Common.ResourceFiles;
using Kms.Domain.Core;

namespace Kms.Domain.Entities
{
    public class CodeDescription : BaseEntity<int>
    {
        #region Properties
        [Display(Name = "گروه")]
		[MaxLength(500,ErrorMessageResourceName = "GnMaxLengthErrorMessage",ErrorMessageResourceType = typeof(Resource))]
		public string? TypeCategory { get; set; }
        public int? TypeId { get; set; }
        public string? TypeDescription { get; set; }
        #endregion
    }
}