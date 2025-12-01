using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.QuestionAndAnswer;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Kms.Domain.Entities.UnitDocumentation;

public class UnitDocumentationTag : BaseEntity<int>
{
    #region Properties


    [Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
    public int EntityId { get; set; }

    public int TagId { get; set; }
    
    #endregion Properties

    #region Relationships

    [ForeignKey(nameof(TagId))]
    public Tag Tag { get; set; }

    #endregion Relationships
}