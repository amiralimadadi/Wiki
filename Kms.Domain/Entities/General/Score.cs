using Kms.Domain.Core;
using System.ComponentModel.DataAnnotations.Schema;

namespace Kms.Domain.Entities.General
{
	public class Score : BaseEntity<int>
	{
		#region Properties
		public string GroupName { get; set; }
		public string? SubGroupName { get; set; }

		public int Index { get; set; }
		public string ActionName { get; set; }
		public string Type { get; set; }
		public string AccountFor { get; set; }

		[Column(TypeName = "decimal(18, 2)")]
		public decimal ScoreAmount { get; set; }
		public string? Note { get; set; }
		public string? JsonCondition { get; set; }
		#endregion Properties

		#region Relationships
		public List<UserScore>? UserScores { get; set; }
		#endregion Relationships
	}
}