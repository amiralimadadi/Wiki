using System.ComponentModel.DataAnnotations.Schema;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;

namespace Kms.Domain.Entities.General;

public class PageView : BaseEntity<int>
{
    public string EntityType { get; set; }
    public int EntityId { get; set; }
    public int UserId { get; set; }

    #region Relationships
    [ForeignKey(nameof(UserId))]
    public User User { get; set; }

    #endregion Relationships

}