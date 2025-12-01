using Kms.Application.Services.Gamifications;
using Kms.Domain.Core;
using Kms.Domain.Entities.General;

namespace Kms.Application.ViewModels
{
	public class UserScoreDetailsViewModel
	{
		public int UserId { get; set; }
		public string? UserName { get; set; }
		public string? FullName { get; set; }
		public DateTime Date { get; set; }
		public decimal ScoreAmount { get; set; }
		//public string? EntityName { get; set; }
		public string? ActionName { get; set; }
		public string? GroupName { get; set; }
		public string? Description { get; set; }

	}

	public class UserScoreAggregate
	{
		public int UserId { get; set; }
		public string FullName { get; set; }
		public string UserName { get; set; }
		public decimal TotalScoreAmount { get; set; }

	}

	public class CalculateScoreViewModel
	{
		public GroupNameGamificationEnum? GroupName { get; set; }
		public SubGroupNameGamificationEnum? SubGroupName { get; set; }
		public ActionNameGamificationEnum ActionName { get; set; }
		public IEntity? Entity { get; set; }
		public string? SearchText { get; set; }
	}

	public class GamificationCondition
	{
		public string? UOM { get; set; }
		public int? Min { get; set; }
		public int? Max { get; set; }
	}
	public class DeserializedGamification:Score
	{
		public GamificationCondition? Condition { get; set; }
	}

	public class ScoreViewModel{
        public string GroupName { get; set; }
        public string SubGroupName { get; set; }
        public string ActionName { get; set; }
        public string Type { get; set; }
        public string AccountFor { get; set; }
        public string ScoreAmount { get; set; }
        public string Note { get; set; }
		}

	public class UserScoreViewModel {
        public long Id { get; set; }
        public UserViewerViewModel? User { get; set; }
        public string? EntityName { get; set; }
        public string? Description { get; set; }
        public DateTime CreateDate { get; set; }
        public decimal ScoreAmount { get; set; }

		}
}