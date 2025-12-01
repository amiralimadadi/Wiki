using System.ComponentModel.DataAnnotations;
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.ProjectAndProposal;
using Kms.Domain.Entities.UnitDocumentation;

namespace Kms.Domain.Entities.QuestionAndAnswer
{
	public class Tag : BaseEntity<int>
	{
		#region Properties
		[Display(Name = "کلید واژه")]
		[Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
		[MaxLength(50, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
		public string TagTitle { get; set; }
		#endregion Properties

		#region Relationships

		public List<QuestionTag>? QuestionTags { get; set; }
        public List<UnitDocumentationTag>? UnitDocumentationTags { get; set; }
        public List<ProjectAndProposalTag>? ProjectAndProposalTags { get; set; }


        #endregion Relationships
    }
}
