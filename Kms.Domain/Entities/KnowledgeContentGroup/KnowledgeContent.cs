using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;
using Kms.Domain.Entities.General;

namespace Kms.Domain.Entities.KnowledgeContentGroup
{
    public class KnowledgeContent : BaseEntity<int>
    {
        #region Properties
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string KnowledgeContentType { get; set; }

        [MaxLength(300, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
		public string? Title { get; set; }

        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage",ErrorMessageResourceType = typeof(Resource))]
        public string Text { get; set; }

        [MaxLength(300, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string? Abstract { get; set; }

        public int UserId { get; set; }
        public int GoalId { get; set; }

        public string? References { get; set; }
        public string? MentionUserIds { get; set; }

        public bool IsGeneral { get; set; }
        public bool IsOfficial { get; set; }

        #endregion

        #region Relationships

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        [ForeignKey(nameof(GoalId))]
        public Goal Goal { get; set; }

        public List<Comment>? Comments { get; set; }
        public List<KnowledgeContentExpertConfirm>? KnowledgeContentExpertConfirms { get; set; }

        #endregion Relationships
    }
}