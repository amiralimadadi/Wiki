

namespace Kms.Application.ViewModels
{
    public class ProcessprofessionalViewModel
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? FullName { get; set; }
        public string Kind { get; set; }
        public List<GoalExpertViewModel> Goals { get; set; } = new();
    }
    public class GoalExpertViewModel
    {
        public int GoalId { get; set; }
        public string? GoalName { get; set; }
    }

    public class CreateExpertViewModel
    {
        public int UserId { get; set; }
        public int GoalId { get; set; }
    }
}
