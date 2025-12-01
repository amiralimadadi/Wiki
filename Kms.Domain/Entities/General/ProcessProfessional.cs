
using System.ComponentModel.DataAnnotations.Schema;
using Kms.Domain.Core;
using Kms.Domain.Entities.Account;

namespace Kms.Domain.Entities.General
{
    public class ProcessProfessional : BaseEntity<int>
    {
        public int UserId { get; set; }
        public int GoalId { get; set; }
        public string Kind { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; }
    }
}
