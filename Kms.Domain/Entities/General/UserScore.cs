using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;

namespace Kms.Domain.Entities.General
{
	public class UserScore : BaseEntity<long>
	{
		#region Properties
		public int UserId { get; set; }
		public string GamificationDetail { get; set; }
		public int ScoreId { get; set; }


		public string EntityName { get; set; }
		public string EntityId { get; set; }

		[Display(Name = "امتیاز")]
		[Column(TypeName = "decimal(18, 2)")]
		public decimal ScoreAmount { get; set; }

		public string NotificationMessage { get; set; }
		#endregion Properties

		#region Relationships
		[ForeignKey(nameof(UserId))]
		public User User { get; set; }

		[ForeignKey(nameof(ScoreId))]
		public Score Score { get; set; }
		#endregion Relationships
	}
}
