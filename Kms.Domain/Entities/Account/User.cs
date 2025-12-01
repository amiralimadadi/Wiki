using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Common.ResourceFiles;
using Kms.Domain.Core;
using Kms.Domain.Entities.General;
using Kms.Domain.Entities.KnowledgeContentGroup;
using Kms.Domain.Entities.QuestionAndAnswer;
using Kms.Domain.Entities.ProjectAndProposal;
using Kms.Domain.Entities.UnitDocumentation;

namespace Kms.Domain.Entities.Account
{
    public class User : BaseEntity<int>
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public new int Id { get; set; }

        public string IgtUserId { get; set; }

        [Display(Name = "نام کاربری")]
        [MaxLength(200, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string? UserName { get; set; }

        [Display(Name = "نام")]
        [MaxLength(200, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string? FirstName { get; set; }

        [Display(Name = "نام خانوادگی")]
        [MaxLength(200, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string? LastName { get; set; }

        [Display(Name = "نام و نام خانوادگی")]
        [MaxLength(500, ErrorMessageResourceName = "GnMaxLengthErrorMessage", ErrorMessageResourceType = typeof(Resource))]
        public string? FullName { get; set; }

        [Display(Name = "کد ملی")]
        public string? NationalId { get; set; }

        public int? MedalId { get; set; }

        public bool IsBranchEmploye { get; set; }

        [ForeignKey("MedalId")]
        public Medals? Medal { get; set; }

        public List<Goal>? Goals { get; set; }

        public List<Admin>? Admins { get; set; }

        public List<Answer>? Answers { get; set; }

        public List<Question>? Questions { get; set; }

        public List<UserScore>? UserScores { get; set; }

        public List<KnowledgeContent>? KnowledgeContents { get; set; }

        public List<UnitSubstitute> UnitSubstitutes { get; set; }

        public List<Proposal>? Proposals { get; set; }

        public List<Project>? Projects { get; set; }

        public List<UnitDocumentation.UnitDocumentation> UnitDocumentations { get; set; }

        public List<KnowledgeContentExpertConfirm>? KnowledgeContentExpertConfirms { get; set; }

        public List<ProcessProfessional> ProcessProfessionals { get; set; }
    }
}