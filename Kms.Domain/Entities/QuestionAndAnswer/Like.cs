using Kms.Domain.Core;

namespace Kms.Domain.Entities.QuestionAndAnswer
{
    public class Like : BaseEntity<int>
    {
        #region Properties
        public string EntityType { get; set; }
        public int EntityId { get; set; }
        public int UserId { get; set; }
        public bool IsExpert { get; set; }
        public bool IsProcessOwner { get; set; }

		#endregion

		#region Relationships
		#endregion Relationships
	}
}