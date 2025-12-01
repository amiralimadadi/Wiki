
using Common.ResourceFiles;
using Kms.Domain.Core;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Kms.Domain.Entities.Account;

namespace Kms.Domain.Entities.KnowledgeContentGroup
{
    public class Comment : BaseEntity<int>
    {
        #region Properties

        public string CommentText { get; set; }
        
        [Required(ErrorMessageResourceName = "GnRequiredErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public int KnowledgeContentId { get; set; }

        public int UserId { get; set; }
        public string? MentionUserIds { get; set; }


        #endregion

        #region RelationShips

        [ForeignKey(nameof(KnowledgeContentId))]
        public KnowledgeContent KnowledgeContent { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }

        #endregion
    }
}
