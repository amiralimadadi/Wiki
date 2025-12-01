using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;

namespace Kms.Application.ViewModels
{
    public class AdminViewModel
    {
        public int Id { get; set; }
        public int UserId { get; set; }

        // public string Kind { get; set; }
        public string? Kind { get; set; }

        public string? FullName { get; set; }
    }

    public class GeneratorViewModel
    {
        public int Id { get; set; }
        public List<UserViewerViewModel> UserViewer { get; set; }

        // public string Kind { get; set; }
        public string? Kind { get; set; }

       // public string? FullName { get; set; }
    }



    public class CreateAdminViewModel
    {
        public int UserId { get; set; }

        public AdminKind Kind { get; set; }
    }


    public class CreateGeneratorViewModel
    {
        public List<int>? UserId { get; set; }
        public AdminKind Kind { get; set; }
    }
    public class ViewerViewModel
    {
        public List<UserViewerViewModel> UserViewer { get; set; }
        public List<UnitViewModel> UnitViewer { get; set; }
        
        public string? Kind { get; set; }
        
        //public int? UnitId { get; set; }
    }

    public class UserViewerViewModel
    {
        public int UserId { get; set; }
        public string? FullName { get; set; }
    }
    public class CreateViewerViewModel
    {
        [SwaggerSchema(Description = "انتخاب کاربرانی که امکان مشاهده را دارند")]
        public List<int>? UserId { get; set; }
        public int EntityId { get; set; }
        public int? GoalId { get; set; }
        [SwaggerSchema(Description = "انتخاب واحدهایی که امکان مشاهده  را دارند")]
        public List<int>? UnitId { get; set; }
        public string? Title { get; set; }
        public string? Abstract { get; set; }
        public string? IdeaCode { get; set; }
        public string? ProposalCode { get; set; }
    }

    public enum AdminKind
    {
        [Display(Name = "ویکی")]
        Wiki,
        [Display(Name = "پروژه")]
        Project,
        [Display(Name = "طرح")]
        Proposal,
        [Display(Name = "ایده")]
        Idea,
        [Display(Name = "محتوای دانشی")]
        KnowledgeContent,
        [Display(Name = "پرسش و پاسخ")]
        QuestionAndAnswer,

    }
}
