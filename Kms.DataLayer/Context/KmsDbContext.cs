using Kms.Domain.Entities;
using Kms.Domain.Entities.Account;
using Kms.Domain.Entities.General;
using Kms.Domain.Entities.KnowledgeContentGroup;
using Kms.Domain.Entities.ProjectAndProposal;
using Kms.Domain.Entities.QuestionAndAnswer;
using Kms.Domain.Entities.UnitDocumentation;
using Microsoft.EntityFrameworkCore;

namespace Kms.DataLayer.Context
{
    public class KmsDbContext : DbContext
    {
        #region Constructor
        public KmsDbContext(DbContextOptions<KmsDbContext> options) : base(options)
        {

        }
        #endregion Constructor

        #region Other
        public DbSet<CodeDescription> CodeDescriptions { get; set; }
        #endregion

        #region Account Entities
        public DbSet<User> Users { get; set; }
        #endregion Account Entities

        #region General Entities
        public DbSet<Goal> Goals { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<Score> Scores { get; set; }
        public DbSet<UserScore> UserScores { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<ProcessProfessional> ProcessProfessionals { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<UnitResponsible> UnitResponsibles { get; set; }
        public DbSet<Medals> Medals { get; set; }

        public DbSet<PageView> PageViews { get; set; }
        #endregion General Entities

        #region QuestionAndAnswer Entities
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionGoal> QuestionGoals { get; set; }
        public DbSet<Answer> Answers { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<QuestionTag> QuestionTags { get; set; }


        #endregion

        #region KnowledgeContent Entities

        public DbSet<KnowledgeContent> KnowledgeContents { get; set; }
        public DbSet<KnowledgeContentTag> KnowledgeContentTags { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<KnowledgeContentExpertConfirm> KnowledgeContentExpertConfirms { get; set; }

        #endregion

        #region UnitDocumentation

        public DbSet<UnitDocumentationTag> UnitDocumentationTags { get; set; }
        public DbSet<UnitDocumentation> UnitDocumentations { get; set; }
        public DbSet<UnitAttachment> UnitAttachments { get; set; }
        public DbSet<Position> Positions { get; set; }
        public DbSet<UnitSubstitute> UnitSubstitutes { get; set; }

        #endregion

        #region Project And Proposal

        public DbSet<Admin> Admins { get; set; }
        public DbSet<ProjectAndProposalGenerator> ProjectAndProposalGenerators { get; set; }
        public DbSet<Viewers> Viewers { get; set; }
        public DbSet<Proposal> Proposals { get; set; }
        public DbSet<ProjectAndProposalTag> ProjectAndProposalTags { get; set; }
        public DbSet<ProjectAndProposalAttachment> ProjectAndProposalAttachments { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProposalComment> ProposalComments { get; set; }
        public DbSet<ProjectComment> ProjectComments { get; set; }

        #endregion

        #region Methods

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }

            // Apply Models Configuration
            //var assembly = Assembly.GetAssembly(typeof(QuestionConfiguration));
            //if (assembly != null)
            //	modelBuilder.ApplyConfigurationsFromAssembly(assembly);

            base.OnModelCreating(modelBuilder);
            SeedData(modelBuilder);

        }
        #endregion Methods

        #region SeedData

        private void SeedData(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 24527,
                    FirstName = @"محسن",
                    LastName = @"صمیعی",
                    FullName = @"محسن صمیعی",
                    UserName = @"samiee.m",
                    Guid = Guid.Parse("A4281024-36ED-41E9-BBA8-4EF94B2C8ECB"),
                    CreatedDate = new DateTime(2024, 4, 20),
                    IsActive = true,
                    IsDeleted = false,
                    IgtUserId = "24527",
                    LastModifiedDate = null,
                    Description = "Admin User"

                });

            modelBuilder.Entity<Goal>().HasData(
                new Goal
                {
                    Id = 1,
                    Guid = Guid.Parse("A4281024-36ED-41E9-BBA8-4EF94B2C8ECB"),
                    CreatedDate = new DateTime(2024, 4, 20),
                    IsActive = true,
                    IsDeleted = false,
                    LastModifiedDate = null,
                    Description = "Root Goal",
                    GoalType = 1,
                    ParentId = null,
                    GoalTitle = "ریشه",
                    GoalDescription = "ریشه درخت",
                    StartPersianDate = "1403/01/01",
                    EndPersianDate = "1430/12/29",
                    UserId = 24527

                });

            modelBuilder.Entity<Medals>().HasData(

                new Medals
                {
                    Id = 1,
                    MinScore = 100,
                    MaxScore = 300,
                    Guid = Guid.Parse("D2158303-8738-42A7-99C7-9935CD4C9586"),
                    CreatedDate = new DateTime(2024, 4, 20),
                    Description = "برنز",
                    IsActive = true,
                    IsDeleted = false,
                    Type = "Bronze"
                },
                new Medals
                {
                    Id = 2,
                    MinScore = 300,
                    MaxScore = 700,
                    Guid = Guid.Parse("3621EF7D-A0E9-4CBE-AFC6-916997E08F71"),
                    CreatedDate = new DateTime(2024, 4, 20),
                    Description = "نقره",
                    IsActive = true,
                    IsDeleted = false,
                    Type = "Silver"
                },
                new Medals
                {
                    Id = 3,
                    MinScore = 700,
                    MaxScore = 1000,
                    Guid = Guid.Parse("3621EF7D-A0E9-4CBE-AFC6-916997E08F71"),
                    CreatedDate = new DateTime(2024, 4, 20),
                    Description = "طلا",
                    IsActive = true,
                    IsDeleted = false,
                    Type = "Gold"
                },
                new Medals
                {
                    Id = 4,
                    MinScore = 1000,
                    MaxScore = 1000000000,
                    Guid = Guid.Parse("3621EF7D-A0E9-4CBE-AFC6-916997E08F71"),
                    CreatedDate = new DateTime(2024, 4, 20),
                    Description = "الماس",
                    IsActive = true,
                    IsDeleted = false,
                    Type = "Diamond"
                });

            modelBuilder.Entity<CodeDescription>().HasData(
                new CodeDescription
                {
                    Id = 1,
                    TypeCategory = "Goal Category Types",
                    TypeId = 1,
                    TypeDescription = @"کلان",
                    Guid = Guid.Parse("8E7A3466-2972-481D-83E7-BED5FB4A5D09"),
                    CreatedDate = new DateTime(2024, 4, 20),
                    IsActive = true,
                    IsDeleted = false,
                    Description = "Macro Goal Type Code"

                }
                , new CodeDescription
                {
                    Id = 2,
                    TypeCategory = "Goal Category Types",
                    TypeId = 2,
                    TypeDescription = @"خرد",
                    Guid = Guid.Parse("961D670E-BF5D-4D82-88CC-DAABF141B205"),

                    CreatedDate = new DateTime(2024, 4, 20),
                    IsActive = true,
                    IsDeleted = false,
                    Description = "Micro Goal Type Code"
                });

            modelBuilder.Entity<Score>().HasData(
                           new Score
                           {
                               Id = 1,
                               GroupName = "Question",
                               Index = 1,
                               ActionName = "Create",
                               Type = "QuestionType1",
                               Description = @"پرسش نوع اول",
                               AccountFor = "Owner",
                               ScoreAmount = 0,
                               Note = @"سؤال هایی که نوع آنها یک می باشد. این امتیاز برای پرسشگر در نظر گرفته شده است.",
                               CreatedDate = new DateTime(2024, 4, 20),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("2A061123-EB4E-4494-BCD9-C68534E4221B")
                           },
                           new Score
                           {
                               Id = 2,
                               GroupName = "Question",
                               Index = 2,
                               ActionName = "Create",
                               Type = "QuestionType2",
                               Description = @"پرسش نوع دوم",
                               AccountFor = "Owner",
                               ScoreAmount = 2,
                               Note = @"سؤال هایی که نوع آنها دو می باشد. این امتیاز برای پرسشگر در نظر گرفته شده است.",
                               CreatedDate = new DateTime(2024, 4, 20),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("B32CE2C4-6943-4432-8498-F35E3AB1E7E3")
                           },
                           new Score
                           {
                               Id = 3,
                               GroupName = "Question",
                               Index = 3,
                               ActionName = "Create",
                               Type = "QuestionType3",
                               Description = @"پرسش نوع سوم",
                               AccountFor = "Owner",
                               ScoreAmount = 3,
                               Note = @"سؤال هایی که نوع آنها سه می باشد. این امتیاز برای پرسشگر در نظر گرفته شده است.",
                               CreatedDate = new DateTime(2024, 4, 20),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("408D8862-BA24-4D10-8716-7102AEB61A8A")
                           },
                           new Score
                           {
                               Id = 4,
                               GroupName = "Answer",
                               Index = 1,
                               ActionName = "Create",
                               Type = "AnswerType1",
                               Description = @"پاسخ نوع اول",
                               AccountFor = "Owner",
                               ScoreAmount = 0,
                               Note = @"پاسخ هایی که نوع آنها یک می باشد. این امتیاز برای پاسخ دهنده در نظر گرفته شده است.",
                               CreatedDate = new DateTime(2024, 8, 4),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("EB8E0EBD-E1E4-4CD2-B7B9-39E5ADEB64FB")
                           },
                           new Score
                           {
                               Id = 5,
                               GroupName = "Answer",
                               Index = 2,
                               ActionName = "Create",
                               Type = "AnswerType2",
                               Description = @"پاسخ نوع دوم",
                               AccountFor = "Owner",
                               ScoreAmount = 2,
                               Note = @"پاسخ هایی که نوع آنها دو می باشد. این امتیاز برای پاسخ دهنده در نظر گرفته شده است.",
                               CreatedDate = new DateTime(2024, 8, 4),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("76A13B24-1706-4EBF-A53C-74030B7EC5E8")
                           },
                           new Score
                           {
                               Id = 6,
                               GroupName = "Answer",
                               Index = 3,
                               ActionName = "Create",
                               Type = "AnswerType3",
                               Description = @"پاسخ نوع سوم",
                               AccountFor = "Owner",
                               ScoreAmount = 3,
                               Note = @"پاسخ هایی که نوع آنها سه می باشد. این امتیاز برای پاسخ دهنده در نظر گرفته شده است.",
                               CreatedDate = new DateTime(2024, 8, 4),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("C063173D-1735-4605-B491-25A50C26B333")
                           },
                           new Score
                           {
                               Id = 7,
                               GroupName = "Question",
                               Index = 1,
                               ActionName = "Search",
                               Type = "-",
                               Description = @"جستجو در محتوای دانشی",
                               AccountFor = "Searcher",
                               ScoreAmount = (decimal)0.15,
                               Note = @"برای هر نوع جستجو در محتوای دانشی این امتیاز برای یوزری که جستجو را انجام میدهد در نظر گرفته می شود.",
                               CreatedDate = new DateTime(2024, 9, 15),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("3A6CD5AB-92D7-4954-9E55-5CC79130193C")
                           },
                           new Score
                           {
                               Id = 8,
                               GroupName = "Question",
                               Index = 1,
                               ActionName = "Like",
                               Type = "-",
                               Description = @"لایک پرسش",
                               AccountFor = "Liker",
                               ScoreAmount = 1,
                               Note = @"لایک پرسش که شخص لایک کننده امتیاز کسب میکند.",
                               CreatedDate = new DateTime(2024, 9, 15),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("ACA399DA-BD54-4C1D-81FF-502EF8D71755")
                           },
                           new Score
                           {
                               Id = 9,
                               GroupName = "Question",
                               Index = 2,
                               ActionName = "Like",
                               Type = "-",
                               Description = @"لایک پرسش",
                               AccountFor = "Liked",
                               ScoreAmount = 1,
                               Note = @"لایک پرسش که شخص لایک شونده امتیاز کسب میکند.",
                               CreatedDate = new DateTime(2024, 9, 15),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("70C21701-D920-4150-895C-6179F28930B6")
                           },
                           new Score
                           {
                               Id = 10,
                               GroupName = "Answer",
                               Index = 1,
                               ActionName = "Like",
                               Type = "-",
                               Description = @"لایک پاسخ",
                               AccountFor = "Liker",
                               ScoreAmount = 1,
                               Note = @"لایک پاسخ که شخص لایک کننده امتیاز کسب میکند.",
                               CreatedDate = new DateTime(2024, 9, 15),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("C28ECEC4-321F-4AC0-9E97-4E9708EE8258")
                           },
                           new Score
                           {
                               Id = 11,
                               GroupName = "Answer",
                               Index = 2,
                               ActionName = "Like",
                               Type = "-",
                               Description = @"لایک پاسخ",
                               AccountFor = "Liked",
                               ScoreAmount = 1,
                               Note = @"لایک پاسخ که شخص لایک شونده امتیاز کسب میکند.",
                               CreatedDate = new DateTime(2024, 9, 15),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("191C857B-EBB5-4B38-B71B-D0B7B3512895")
                           },
                           new Score
                           {
                               Id = 12,
                               GroupName = "KnowledgeContent",
                               SubGroupName = "NonStructuredKnowledgeContent",
                               Index = 1,
                               ActionName = "Create",
                               Type = "PhotoAndText",
                               Description = @"محتوای دانشی غیر ساختار یافته تصویر + متن",
                               AccountFor = "Owner",
                               ScoreAmount = 20,
                               Note = @"ایجاد محتوای دانشی غیر ساختار یافته که شامل متن و تصویر باشد",
                               CreatedDate = new DateTime(2024, 9, 28),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("4B2AC72D-CB68-4ECD-B539-0BE23F325D67"),
                               JsonCondition = @"{""UOM"":""File"",""Min"":0,""Max"":150}"
                           },
                           new Score
                           {
                               Id = 13,
                               GroupName = "KnowledgeContent",
                               SubGroupName = "NonStructuredKnowledgeContent",
                               Index = 1,
                               ActionName = "Create",
                               Type = "Photo",
                               Description = @"محتوای دانشی غیر ساختار یافته تصویر",
                               AccountFor = "Owner",
                               ScoreAmount = 2,
                               Note = @"ایجاد محتوای دانشی غیر ساختار یافته که شامل تصویر باشد",
                               CreatedDate = new DateTime(2024, 9, 28),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("4372CCA4-03CD-4217-B2E2-151DBA204C4E"),
                               JsonCondition = @"{""UOM"":null,""Min"":null,""Max"":null}"

                           },
                           new Score
                           {
                               Id = 14,
                               GroupName = "KnowledgeContent",
                               SubGroupName = "NonStructuredKnowledgeContent",
                               Index = 1,
                               ActionName = "Create",
                               Type = "VideoAndText",
                               Description = @"محتوای دانشی غیر ساختار یافته ویدئو + متن",
                               AccountFor = "Owner",
                               ScoreAmount = 20,
                               Note = @"ایجاد محتوای دانشی غیر ساختار یافته که شامل متن و ویدئو باشد",
                               CreatedDate = new DateTime(2024, 9, 28),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("D40CCAA5-93A7-4163-8C15-1CCE53FFB361"),
                               JsonCondition = @"{""UOM"":""File"",""Min"":30,""Max"":150}"

                           },
                           new Score
                           {
                               Id = 15,
                               GroupName = "KnowledgeContent",
                               SubGroupName = "NonStructuredKnowledgeContent",
                               Index = 1,
                               ActionName = "Create",
                               Type = "Video",
                               Description = @"محتوای دانشی غیر ساختار یافته ویدئو",
                               AccountFor = "Owner",
                               ScoreAmount = 2,
                               Note = @"ایجاد محتوای دانشی غیر ساختار یافته که شامل ویدئو باشد",
                               CreatedDate = new DateTime(2024, 9, 28),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("4BB7C6CD-8562-40CE-84DF-2AB5925DF05A"),
                               JsonCondition = @"{""UOM"":null,""Min"":null,""Max"":null}"

                           },
                           new Score
                           {
                               Id = 16,
                               GroupName = "KnowledgeContent",
                               SubGroupName = "NonStructuredKnowledgeContent",
                               Index = 1,
                               ActionName = "Create",
                               Type = "VoiceAndText",
                               Description = @"محتوای دانشی غیر ساختار یافته صوت + متن",
                               AccountFor = "Owner",
                               ScoreAmount = 20,
                               Note = @"ایجاد محتوای دانشی غیر ساختار یافته که شامل متن و صوت باشد",
                               CreatedDate = new DateTime(2024, 9, 28),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("132D279C-6501-44BE-9842-35D44FDE094B"),
                               JsonCondition = @"{""UOM"":""File"",""Min"":30,""Max"":150}"

                           },
                           new Score
                           {
                               Id = 17,
                               GroupName = "KnowledgeContent",
                               SubGroupName = "NonStructuredKnowledgeContent",
                               Index = 1,
                               ActionName = "Create",
                               Type = "Voice",
                               Description = @"محتوای دانشی غیر ساختار یافته صوت",
                               AccountFor = "Owner",
                               ScoreAmount = 5,
                               Note = @"ایجاد محتوای دانشی غیر ساختار یافته که شامل صوت باشد",
                               CreatedDate = new DateTime(2024, 9, 28),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("5C9953DD-A024-42D5-8BDD-443EE210DFEB"),
                               JsonCondition = @"{""UOM"":null,""Min"":null,""Max"":null}"

                           },
                           new Score
                           {
                               Id = 18,
                               GroupName = "KnowledgeContent",
                               SubGroupName = "NonStructuredKnowledgeContent",
                               Index = 1,
                               ActionName = "Create",
                               Type = "Text",
                               Description = @"محتوای دانشی غیر ساختار یافته متنی",
                               AccountFor = "Owner",
                               ScoreAmount = 0,
                               Note = @"ایجاد محتوای دانشی غیر ساختار یافته که شامل متن باشد",
                               CreatedDate = new DateTime(2024, 9, 28),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("E314B486-A307-47BC-B4DC-53D2900B4CBC"),
                               JsonCondition = @"{""UOM"":""Character"",""Min"":0,""Max"":29}"
                           },
                           new Score
                           {
                               Id = 19,
                               GroupName = "KnowledgeContent",
                               SubGroupName = "NonStructuredKnowledgeContent",
                               Index = 2,
                               ActionName = "Create",
                               Type = "Text",
                               Description = @"محتوای دانشی غیر ساختار یافته متنی",
                               AccountFor = "Owner",
                               ScoreAmount = 20,
                               Note = @"ایجاد محتوای دانشی غیر ساختار یافته که شامل متن باشد",
                               CreatedDate = new DateTime(2024, 9, 28),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("589CCAA4-080D-444F-86F6-5BFA8A1B6AD0"),
                               JsonCondition = @"{""UOM"":""Character"",""Min"":30,""Max"":149}"
                           },
                           new Score
                           {
                               Id = 20,
                               GroupName = "KnowledgeContent",
                               SubGroupName = "NonStructuredKnowledgeContent",
                               Index = 3,
                               ActionName = "Create",
                               Type = "Text",
                               Description = @"محتوای دانشی غیر ساختار یافته متنی",
                               AccountFor = "Owner",
                               ScoreAmount = 40,
                               Note = @"ایجاد محتوای دانشی غیر ساختار یافته که شامل متن باشد",
                               CreatedDate = new DateTime(2024, 9, 28),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("B2AEAD6A-0B2A-4FB9-BB2E-6DA75CAD1124"),
                               JsonCondition = @"{""UOM"":""Character"",""Min"":150,""Max"":null}"
                           },
                           new Score
                           {
                               Id = 21,
                               GroupName = "KnowledgeContent",
                               SubGroupName = "StructuredKnowledgeContent",
                               Index = 1,
                               ActionName = "Create",
                               Type = "Text",
                               Description = @"محتوای دانشی ساختار یافته متنی",
                               AccountFor = "Owner",
                               ScoreAmount = 0,
                               Note = @"ایجاد محتوای دانشی ساختار یافته که شامل متن باشد",
                               CreatedDate = new DateTime(2024, 9, 28),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("DE04E1C7-6ACF-4157-A1B3-6F2B7D9D237F"),
                               JsonCondition = @"{""UOM"":""Word"",""Min"":0,""Max"":29}"
                           },
                           new Score
                           {
                               Id = 22,
                               GroupName = "KnowledgeContent",
                               SubGroupName = "StructuredKnowledgeContent",
                               Index = 2,
                               ActionName = "Create",
                               Type = "Text",
                               Description = @"محتوای دانشی ساختار یافته متنی",
                               AccountFor = "Owner",
                               ScoreAmount = 40,
                               Note = @"ایجاد محتوای دانشی ساختار یافته که شامل متن باشد",
                               CreatedDate = new DateTime(2024, 9, 28),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("FA82A2E5-A278-444C-9F83-75132C974F60"),
                               JsonCondition = @"{""UOM"":""Word"",""Min"":30,""Max"":149}"
                           },
                           new Score
                           {
                               Id = 23,
                               GroupName = "KnowledgeContent",
                               SubGroupName = "StructuredKnowledgeContent",
                               Index = 3,
                               ActionName = "Create",
                               Type = "Text",
                               Description = @"محتوای دانشی ساختار یافته متنی",
                               AccountFor = "Owner",
                               ScoreAmount = 80,
                               Note = @"ایجاد محتوای دانشی ساختار یافته که شامل متن باشد",
                               CreatedDate = new DateTime(2024, 9, 28),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("8092CF15-7431-4039-B2AF-755ED301942B"),
                               JsonCondition = @"{""UOM"":""Word"",""Min"":150,""Max"":null}"
                           },
                           new Score
                           {
                               Id = 24,
                               GroupName = "Question",
                               Index = 3,
                               ActionName = "Like",
                               Type = "-",
                               Description = @"لایک پرسش توسط خبره",
                               AccountFor = "Liked",
                               ScoreAmount = 2,
                               Note = @"لایک پرسش توسط خبره که شخص لایک شونده امتیاز کسب میکند.",
                               CreatedDate = new DateTime(2024, 11, 9),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("A42DBDA7-465F-460C-91A1-D74CBCAE0AA9"),
                               SubGroupName = "LikeByExpert"
                           },
                           new Score
                           {
                               Id = 25,
                               GroupName = "Answer",
                               Index = 3,
                               ActionName = "Like",
                               Type = "-",
                               Description = @"لایک پاسخ توسط خبره",
                               AccountFor = "Liked",
                               ScoreAmount = 2,
                               Note = @"لایک پاسخ توسط خبره که شخص لایک شونده امتیاز کسب میکند.",
                               CreatedDate = new DateTime(2024, 11, 9),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("1C271438-F069-4E5A-95B9-9376B20B2A2D"),
                               SubGroupName = "LikeByExpert"
                           },
                           new Score
                           {
                               Id = 26,
                               GroupName = "Proposal",
                               Index = 1,
                               ActionName = "Confirm",
                               Type = "-",
                               Description = @"بارگذاری طرح",
                               AccountFor = "Uploader",
                               ScoreAmount = 30,
                               Note = @"آپلود مستندات طرح",
                               CreatedDate = new DateTime(2024, 11, 11),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("94DCF611-7686-40B9-A56A-8A3A5306A618"),
                               SubGroupName = null
                           },
                           new Score
                           {
                               Id = 27,
                               GroupName = "Proposal",
                               Index = 1,
                               ActionName = "Confirm",
                               Type = "-",
                               Description = @"تأیید مستندات طرح برای صاحب طرح",
                               AccountFor = "ProposalAdmin",
                               ScoreAmount = 10,
                               Note = @"تأیید مستندات طرح",
                               CreatedDate = new DateTime(2024, 11, 11),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("FA9B852E-BBD7-4480-9D1B-F6E8ED14AB6D"),
                               SubGroupName = null
                           },
                           new Score
                           {
                               Id = 28,
                               GroupName = "Project",
                               Index = 1,
                               ActionName = "Confirm",
                               Type = "-",
                               Description = @"پروژه طرح",
                               AccountFor = "Uploader",
                               ScoreAmount = 30,
                               Note = @"آپلود مستندات پروژه",
                               CreatedDate = new DateTime(2024, 11, 11),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("93582131-2703-4266-BA1D-FA1517685802"),
                               SubGroupName = null
                           },
                           new Score
                           {
                               Id = 29,
                               GroupName = "Project",
                               Index = 1,
                               ActionName = "Confirm",
                               Type = "-",
                               Description = @"تأیید پروژه برای صاحب پروژه",
                               AccountFor = "ProjectAdmin",
                               ScoreAmount = 10,
                               Note = @"تأیید مستندات پروژه",
                               CreatedDate = new DateTime(2024, 11, 11),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("82EE23B7-B398-4A1E-8B1C-B27271107904"),
                               SubGroupName = null
                           },
                           new Score
                           {
                               Id = 30,
                               GroupName = "Documentation",
                               Index = 1,
                               ActionName = "Confirm",
                               Type = "-",
                               Description = @"تایید مستندات واحدی",
                               AccountFor = "Owner",
                               ScoreAmount = 2,
                               Note = @"تایید مستندات واحدی توسط ادمین",
                               CreatedDate = new DateTime(2024, 11, 11),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("F2B8E8AF-05CA-48DB-8791-1F8C92871268")
                           },
                           new Score
                           {
                               Id = 31,
                               GroupName = "Proposal",
                               Index = 1,
                               ActionName = "Like",
                               Type = "-",
                               Description = @"لایک طرح",
                               AccountFor = "Liker",
                               ScoreAmount = 1,
                               Note = @"لایک طرح که شخص لایک کننده امتیاز کسب میکند.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("09B04F90-8034-4290-9838-0CF8823BE5F8")
                           },
                           new Score
                           {
                               Id = 32,
                               GroupName = "Proposal",
                               Index = 2,
                               ActionName = "Like",
                               Type = "-",
                               Description = @"لایک طرح",
                               AccountFor = "Liked",
                               ScoreAmount = 1,
                               Note = @"لایک طرح که شخص لایک شونده امتیاز کسب میکند.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("3170BD95-C827-4EE0-8587-DBAAE884E400")
                           },
                           new Score
                           {
                               Id = 33,
                               GroupName = "Proposal",
                               Index = 3,
                               ActionName = "Like",
                               Type = "-",
                               Description = @"لایک طرح توسط خبره",
                               AccountFor = "Liked",
                               ScoreAmount = 2,
                               Note = @"لایک طرح توسط خبره که شخص لایک شونده امتیاز کسب میکند.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("CE0280DF-621A-4883-A137-4AB7EA77B29B"),
                               SubGroupName = "LikeByExpert"
                           },
                           new Score
                           {
                               Id = 34,
                               GroupName = "Project",
                               Index = 1,
                               ActionName = "Like",
                               Type = "-",
                               Description = @"لایک پروژه",
                               AccountFor = "Liker",
                               ScoreAmount = 1,
                               Note = @"لایک پروژه که شخص لایک کننده امتیاز کسب میکند.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("BEAC098B-BA0A-4A6F-B53D-EAE326ED952D")
                           },
                           new Score
                           {
                               Id = 35,
                               GroupName = "Project",
                               Index = 2,
                               ActionName = "Like",
                               Type = "-",
                               Description = @"لایک پروژه",
                               AccountFor = "Liked",
                               ScoreAmount = 1,
                               Note = @"لایک پروژه که شخص لایک شونده امتیاز کسب میکند.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("CA15D9AC-3A1A-48F1-867A-875C8DA6616D")
                           },
                           new Score
                           {
                               Id = 36,
                               GroupName = "Project",
                               Index = 3,
                               ActionName = "Like",
                               Type = "-",
                               Description = @"لایک پروژه توسط خبره",
                               AccountFor = "Liked",
                               ScoreAmount = 2,
                               Note = @"لایک پروژه توسط خبره که شخص لایک شونده امتیاز کسب میکند.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("DB23A936-BBBA-41BA-88B2-2E97705C3026"),
                               SubGroupName = "LikeByExpert"
                           },
                           new Score
                           {
                               Id = 37,
                               GroupName = "Proposal",
                               Index = 1,
                               ActionName = "Search",
                               Type = "-",
                               Description = @"جستجو در طرح",
                               AccountFor = "Searcher",
                               ScoreAmount = (decimal)0.15,
                               Note = @"برای هر نوع جستجو در طرح این امتیاز برای یوزری که جستجو را انجام میدهد در نظر گرفته می شود.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("2D7C2BF3-BF4B-4AD1-9C28-C11FD528A6CC")
                           },
                           new Score
                           {
                               Id = 38,
                               GroupName = "Project",
                               Index = 1,
                               ActionName = "Search",
                               Type = "-",
                               Description = @"جستجو در پروژه",
                               AccountFor = "Searcher",
                               ScoreAmount = (decimal)0.15,
                               Note = @"برای هر نوع جستجو در پروژه ها این امتیاز برای کاربری که جستجو را انجام می دهد در نظر گرفته می شود.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("7FD9BA39-F775-48C6-9B23-406D5F875478")
                           },
                           new Score
                           {
                               Id = 39,
                               GroupName = "KnowledgeContent",
                               Index = 1,
                               ActionName = "Search",
                               Type = "-",
                               Description = @"جستجو در محتوی دانشی",
                               AccountFor = "Searcher",
                               ScoreAmount = (decimal)0.15,
                               Note = @"برای هر نوع جستجو در محتوای دانشی این امتیاز برای کاربری که جستجو را انجام می دهد در نظر گرفته می شود.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("9FA955F2-C278-4022-BA30-623DE834D8E5")
                           },
                           new Score
                           {
                               Id = 40,
                               GroupName = "Documentation",
                               Index = 1,
                               ActionName = "Search",
                               Type = "-",
                               Description = @"جستجو در مستندات دانشی",
                               AccountFor = "Searcher",
                               ScoreAmount = (decimal)0.15,
                               Note = @"برای هر نوع جستجو در مستندات دانشی این امتیاز برای کاربری که جستجو را انجام می دهد در نظر گرفته می شود.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("B4D8CBA3-610A-4271-8881-B0B19B619A8B")
                           },

                            new Score
                            {
                                Id = 41,
                                GroupName = "KnowledgeContent",
                                Index = 1,
                                ActionName = "Like",
                                Type = "-",
                                Description = @"لایک محتوای دانشی",
                                AccountFor = "Liker",
                                ScoreAmount = 1,
                                Note = @"لایک محتوای دانشی که شخص لایک کننده امتیاز کسب میکند.",
                                CreatedDate = new DateTime(2024, 11, 12),
                                IsActive = true,
                                IsDeleted = false,
                                Guid = Guid.Parse("EA86CAE8-AF78-4C79-A088-1F2A4E960420")
                            },
                            new Score
                            {
                                Id = 42,
                                GroupName = "KnowledgeContent",
                                Index = 2,
                                ActionName = "Like",
                                Type = "-",
                                Description = @"لایک محتوای دانشی",
                                AccountFor = "Liked",
                                ScoreAmount = 1,
                                Note = @"لایک محتوای دانشی که شخص لایک شونده امتیاز کسب میکند.",
                                CreatedDate = new DateTime(2024, 11, 12),
                                IsActive = true,
                                IsDeleted = false,
                                Guid = Guid.Parse("555C1B22-C243-4D69-A828-46DC74AA486D")
                            },
                            new Score
                            {
                                Id = 43,
                                GroupName = "KnowledgeContent",
                                Index = 3,
                                ActionName = "Like",
                                Type = "-",
                                Description = @"لایک محتوای دانشی",
                                AccountFor = "Liked",
                                ScoreAmount = 2,
                                Note = @"لایک محتوای دانشی توسط خبره که شخص لایک شونده امتیاز کسب میکند.",
                                CreatedDate = new DateTime(2024, 11, 12),
                                IsActive = true,
                                IsDeleted = false,
                                Guid = Guid.Parse("32A466BD-8ECB-4B74-AED0-21544680A08D"),
                                SubGroupName = "LikeByExpert"
                            },
                            new Score
                                {
                                    Id = 44,
                                    GroupName = "Comment",
                                    Index = 1,
                                    ActionName = "Create",
                                    Type = "-",
                                    Description = @"پاسخ محتوای دانشی",
                                    AccountFor = "Owner",
                                    ScoreAmount = 2,
                                    Note = @"پاسخ به محتوای دانشی.",
                                    CreatedDate = new DateTime(2024, 8, 4),
                                    IsActive = true,
                                    IsDeleted = false,
                                    Guid = Guid.Parse("7CD71955-564F-4173-BE37-FAFCAD4C4444")
                                },
                           new Score
                           {
                               Id=45,
                               GroupName = "KnowledgeContent",
                               Index = 1,
                               ActionName = "Official",
                               Type = "-",
                               Description = @"درس آموخته محتوای دانشی",
                               AccountFor = "Owner",
                               ScoreAmount = 100,
                               Note = @"تبدیل محتوای دانشی به درس آموخته که ثبت کننده دریافت میکند.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("6A30AEE9-610F-42DF-A510-E6FD6B4B745B"),
                               SubGroupName = "OfficialKnowledgeContent"
                           },
                           new Score
                           {
                               Id = 46,
                               GroupName = "KnowledgeContent",
                               Index = 1,
                               ActionName = "Change",
                               Type = "-",
                               Description = @"تبدیل محتوای دانشی",
                               AccountFor = "Owner",
                               ScoreAmount = 30,
                               Note = @"تبدیل محتوای دانشی به ساختار یافته که ثبت کننده دریافت میکند.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("6F45587F-084A-46D5-8827-16B224B50BCE"),
                               SubGroupName = "ChangeKnowledgeContent"
                           },
                           new Score
                           {
                               Id = 47,
                               GroupName = "KnowledgeContent",
                               Index = 1,
                               ActionName = "UnLike",
                               Type = "-",
                               Description = @"برداشتن لایک محتوای دانشی",
                               AccountFor = "UnLiker",
                               ScoreAmount = -1,
                               Note = @"برداشتن لایک توسط لایک کننده.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("6F45587F-084A-46D5-8827-16B224B50BCE")
                               
                           },
                           new Score
                           {
                               Id = 48,
                               GroupName = "Proposal",
                               Index = 1,
                               ActionName = "UnLike",
                               Type = "-",
                               Description = @"برداشتن لایک طرح",
                               AccountFor = "UnLiker",
                               ScoreAmount = -1,
                               Note = @"برداشتن لایک توسط لایک کننده.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("0627BFCD-E98A-436D-9A1D-9E36B1E3C7A1")
                           },
                           new Score
                           {
                               Id = 49,
                               GroupName = "Project",
                               Index = 1,
                               ActionName = "UnLike",
                               Type = "-",
                               Description = @"برداشتن لایک پروژه",
                               AccountFor = "UnLiker",
                               ScoreAmount = -1,
                               Note = @"برداشتن لایک توسط لایک کننده.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("0DE67BA7-E6DD-406F-A2B2-1C5172504EEB")
                           },
                           new Score
                           {
                               Id = 50,
                               GroupName = "KnowledgeContent",
                               Index = 1,
                               ActionName = "Deactivate",
                               Type = "-",
                               Description = @"غیر فعال کردن محتوای دانشی",
                               AccountFor = "Owner",
                               ScoreAmount = -30,
                               Note = @"غیر فعال کردن محتوای دانشی.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("3BEFA59A-0005-442C-B526-D9298B92228A"),
                               SubGroupName = "DeactivateKnowledgeContent"
                           },
                           new Score
                           {
                               Id = 51,
                               GroupName = "Project",
                               Index = 1,
                               ActionName = "Admin",
                               Type = "-",
                               Description = @"ثبت پروژه توسط ادمین",
                               AccountFor = "Owner",
                               ScoreAmount = 20,
                               Note = @"ثبت پروژه توسط ادمین.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("289A0BBC-72E7-4247-B6EB-E30409E0F214")
                           },
                           new Score
                           {
                               Id = 52,
                               GroupName = "Proposal",
                               Index = 1,
                               ActionName = "Admin",
                               Type = "-",
                               Description = @"ثبت طرح توسط ادمین",
                               AccountFor = "Owner",
                               ScoreAmount = 20,
                               Note = @"ثبت طرح توسط ادمین.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("807F46A5-5862-4FD2-AD3D-53B28A13782B")
                           },
                           new Score
                           {
                               Id = 53,
                               GroupName = "KnowledgeContent",
                               Index = 1,
                               ActionName = "ChangeAttach",
                               Type = "-",
                               Description = @"تبدیل محتوای دانشی",
                               AccountFor = "Owner",
                               ScoreAmount = 40,
                               Note = @"تبدیل محتوای دانشی به ساختار یافته که ثبت کننده دریافت میکند.",
                               CreatedDate = new DateTime(2024, 11, 12),
                               IsActive = true,
                               IsDeleted = false,
                               Guid = Guid.Parse("9EAAFB0E-C5F9-4982-95FE-9B94BF7C4623"),
                               SubGroupName = "ChangeKnowledgeContent"
                           }

                           );
        }
        #endregion SeedData
    }
}