using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;

namespace Kms.Domain.Entities.KnowledgeContentGroup
{
	public class KnowledgeContentExpertConfirm : BaseEntity
	{
		#region Properties
		public int KnowledgeContentId { get; set; }
		public int ExpertUserId { get; set; }
		public bool IsConfirmed { get; set; }
        public bool IsExpert { get; set; }
        public bool IsOwner { get; set; }
		#endregion Properties

		#region Relationships

		[ForeignKey(nameof(KnowledgeContentId))]
		public KnowledgeContent KnowledgeContent { get; set; }
		
		[ForeignKey(nameof(ExpertUserId))]
		public User User { get; set; }
		#endregion Relationships
	}
}
