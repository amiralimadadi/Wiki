namespace Kms.Application.ViewModels
{
	public class CreateGoalViewModel
	{
		public string GoalTitle { get; set; }
		public string GoalDescription{ get; set; }
		public string? StartPersianDate { get; set; }
		public string? EndPersianDate { get; set; }
		public int GoalType { get; set; }
		public int? ParentId { get; set; }
		public int UserId { get; set; }
	}

    public class AddVisitPageViewModel
    {
        public int EntityId { get; set; }
        public int UserId { get; set; }
        public VisitPageEntityEnum EntityType { get; set; }

    }

    public class EditGoalViewModel
    {
        public string GoalTitle { get; set; }
        public string GoalDescription { get; set; }
        public string? StartPersianDate { get; set; }
        public string? EndPersianDate { get; set; }
        public int GoalType { get; set; }
        public int? ParentId { get; set; }
        public int UserId { get; set; }
    }


    public class GoalViewModel
    {
        public int Id { get; set; }
        public string? GoalTitle { get; set; }
        public string? GoalDescription { get; set; }
        public string? StartPersianDate { get; set; }
        public string? EndPersianDate { get; set; }
        public int? GoalType { get; set; }
        public string? GoalTypeDescription { get; set; }
        public int ParentId { get; set; }
        public string? ParentTitle { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; }
    }

  public class AddGoalViewModel
    {
        public string GoalTitle { get; set; }
        public string? StartPersianDate { get; set; }
        public string? EndPersianDate { get; set; }
        public int GoalType { get; set; }
        public int UserId { get; set; }
    }

    public enum VisitPageEntityEnum
    {
        Question,
        Answer,
        KnowledgeContent,
        Comment,
        Proposal,
        ProposalComment,
        Project,
        ProjectComment
    }
}