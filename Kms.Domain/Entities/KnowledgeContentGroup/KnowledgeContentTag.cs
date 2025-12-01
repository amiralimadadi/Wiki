using Kms.Domain.Entities.QuestionAndAnswer;
using System.ComponentModel.DataAnnotations.Schema;
using Kms.Domain.Core;
using Common.ResourceFiles;
using System.ComponentModel.DataAnnotations;

namespace Kms.Domain.Entities.KnowledgeContentGroup
{
	public class KnowledgeContentTag : BaseEntity<int>
	{
        #region Properties

        [Display(Name = "نام موجودیت")]
        [MaxLength(100,
            ErrorMessageResourceName = "GnMaxLengthErrorMessage",
            ErrorMessageResourceType = typeof(Resource))]
        public string EntityName { get; set; }

        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public int EntityId { get; set; }

        public int TagId { get; set; }


        #endregion Properties

        #region Relationships

        [ForeignKey(nameof(TagId))]
        public Tag Tag { get; set; }

        #endregion Relationships
    }
}
