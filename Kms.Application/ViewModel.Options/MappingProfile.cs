using AutoMapper;
using Common.File;
using Kms.Application.ViewModels;
using Kms.Domain.Entities;
using Kms.Domain.Entities.Account;
using Kms.Domain.Entities.General;
using Kms.Domain.Entities.KnowledgeContentGroup;
using Kms.Domain.Entities.ProjectAndProposal;
using Kms.Domain.Entities.QuestionAndAnswer;
using Kms.Domain.Entities.UnitDocumentation;

namespace Kms.Application.ViewModel.Options
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AttachmentSetting, FileSettings>().ReverseMap();
            
            CreateMap<User, UserViewModel>().ReverseMap();
            
            
            CreateMap<Goal, GoalViewModel>().ReverseMap();
            CreateMap<Goal, CreateGoalViewModel>().ReverseMap();
            CreateMap<Goal, AddGoalViewModel>().ReverseMap();
            CreateMap<GoalViewModel, AddGoalViewModel>().ReverseMap();
            CreateMap<GoalViewModel, CreateGoalViewModel>().ReverseMap();
            CreateMap<Goal, EditGoalViewModel>().ReverseMap();
            CreateMap<GoalViewModel, EditGoalViewModel>().ReverseMap();

            CreateMap<Score, ScoreViewModel>().ReverseMap();


            CreateMap<Question, QuestionViewModel>().ReverseMap();
            CreateMap<Question, CreateQuestionViewModel>().ReverseMap();
            //CreateMap<Question, AcceptQuestionViewModel>().ReverseMap();
            //CreateMap<QuestionViewModel, AcceptQuestionViewModel>().ReverseMap();


            CreateMap<Answer, CreateAnswerViewModel>().ReverseMap();
            CreateMap<Answer, AnswerViewModel>().ReverseMap();

            CreateMap<CodeDescription, CodeDescriptionViewModel>().ReverseMap();

            CreateMap<Like, LikeViewModel>().ReverseMap();

            CreateMap<PageView, AddVisitPageViewModel>().ReverseMap();

            CreateMap<Score, QuestionTypeViewModel>().ReverseMap();
            CreateMap<Score, AnswerTypeViewModel>().ReverseMap();


            CreateMap<KnowledgeContent, KnowledgeContentViewModel>().ReverseMap();
            CreateMap<KnowledgeContentExpertConfirm, KnowledgeContentExpertConfirmsViewModel>().ReverseMap();
            CreateMap<KnowledgeContent, CreateKnowledgeContentViewModel>()
                .ForMember(d => d.Users, opt => opt.Ignore())
                .ForMember(d => d.Units, opt => opt.Ignore())
                .ReverseMap();


            CreateMap<KnowledgeContent, PrintKnowledgeContentViewModel>().ReverseMap();

            CreateMap<Comment, CommentViewModel>().ReverseMap();
            CreateMap<Comment, CreateCommentViewModel>().ReverseMap();

            CreateMap<ProcessProfessional,ProcessprofessionalViewModel>().ReverseMap();
            CreateMap<Unit,UnitViewModel>().ReverseMap();
            CreateMap<Position, PositionViewModel>().ReverseMap();
            CreateMap<Position, CreatePositionViewModel>().ReverseMap();
            CreateMap<UnitDocumentation,UnitDocumentationViewModel>().ReverseMap();
            CreateMap<UnitDocumentation,CreateUnitDocumentationViewModel>().ReverseMap();


            CreateMap<Tag, TagsViewModel>().ReverseMap();
            CreateMap<Admin, AdminViewModel>().ReverseMap();
            CreateMap<ProjectAndProposalGenerator, GeneratorViewModel>().ReverseMap();
            CreateMap<Proposal, ProposalViewModel>().ReverseMap();
            CreateMap<Proposal, CreateProposalViewModel>().ReverseMap();
            CreateMap<ProposalComment, ProposalCommentViewModel>().ReverseMap();
            CreateMap<ProposalComment, CreateProposalCommentViewModel>().ReverseMap();
            CreateMap<Project, ProjectViewModel>().ReverseMap();
            CreateMap<Project, CreateProjectViewModel>().ReverseMap();

            CreateMap<ProjectComment, ProjectCommentViewModel>().ReverseMap();
            CreateMap<ProjectComment, CreateProjectCommentViewModel>().ReverseMap();


        }
    }
}