
using Microsoft.AspNetCore.Http;

namespace Kms.Application.ViewModels
{
    public class UnitDocumentationViewModel
    {
        public int Id { get; set; }
        public string? UnitName { get; set; }
        public string? Position { get; set; }
        public int? PositionId { get; set; }
        public bool IsActive { get; set; }
        public string? Title { get; set; }
        public DateTime CreatedDate { get; set; }

        public string? Text { get; set; }
        public UserViewModel? User { get; set; }
        public List<AttachmentViewModel> Attachments { get; set; }
        public List<TagsViewModel> Tags { get; set; }

    }

    public class AcceptDocumentationViewModel
    {
        public int DocumentationId { get; set; }
        public string? Title { get; set; }
        public string? Text { get; set; }

    }

    public class CreateUnitDocumentationViewModel
    {
       
        public int? UnitId { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }

        public string? Position { get; set; }
        public int PositionId { get; set; }
        public List<string> Tags { get; set; }
        public List<IFormFile>? DocumentationAttachments { get; set; }
        
       
    }

    public class PositionViewModel
    {
        public int PositionId { get; set; }
        public string PositionName { get; set; }

        public UnitViewModel? Unit { get; set; }
    }

    public class CreatePositionViewModel
    {
        public string PositionName { get; set; }
        public int UnitId { get; set; }
    }

    public class SubstituteViewModel
    {
        public int Id { get; set; }
        public UnitViewModel? Unit { get; set; }
        public UserViewModel? User { get; set; }

    }

    public class CreateSubstituteViewModel
    {
        public List<int> UserIds { get; set; } = new List<int>();
    }

    public enum GetDocumentationTypesEnum
    {
        UnitDocumentation,
        MyDocumentation,
        AwaitingConfirmation,
        AllDocumentation
        
    }
}
