namespace Kms.Application.ViewModel.Options
{
    public class AttachmentSetting
    {
        public string Address { get; set; }
        public string FileName { get; set; }
        public int MaxSize { get; set; } 
        public List<string> AllowedExtensions { get; set; }
    }
}