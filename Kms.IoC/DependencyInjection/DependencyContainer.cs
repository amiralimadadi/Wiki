using Common.UserService;
using Kms.Application.Senders;
using Kms.Application.Services.Account;
using Kms.Application.Services.Documentation;
using Kms.Application.Services.Gamifications;
using Kms.Application.Services.General;
using Kms.Application.Services.KnowledgeContentGroups;
using Kms.Application.Services.ProjectAndProposal;
using Kms.Application.Services.QuestionAndAnswer;
using Kms.Application.Services.Units;
using Kms.DataLayer.Contracts;
using Kms.DataLayer.Repositories;
using Microsoft.Extensions.DependencyInjection;

namespace Kms.IoC.DependencyInjection
{
	public static class DependencyContainer
	{
		public static void RegisterRepositories(this IServiceCollection services)
		{
			services.AddScoped<IUserRepository, UserRepository>();
			services.AddScoped<IGoalRepository, GoalRepository>();
			services.AddScoped<ICodeDescriptionRepository, CodeDescriptionRepository>();
			services.AddScoped<IQuestionRepository, QuestionRepository>();
			services.AddScoped<IQuestionGoalRepository, QuestionGoalRepository>();
			services.AddScoped<IAnswerRepository, AnswerRepository>();
			services.AddScoped<ILikeRepository, LikeRepository>();
			services.AddScoped<ITagRepository, TagRepository>();
			services.AddScoped<IQuestionTagRepository, QuestionTagRepository>();
			services.AddScoped<IAttachmentRepository, AttachmentRepository>();
			services.AddScoped<IScoreRepository, ScoreRepository>();
			services.AddScoped<IUserScoreRepository, UserScoreRepository>();
			services.AddScoped<IKnowledgeContentRepository, KnowledgeContentRepository>();
			services.AddScoped<IKnowledgeContentTagRepository, KnowledgeContentTagRepository>();
			services.AddScoped<ICommentRepository, CommentRepository>();
			services.AddScoped<IProcessProfessionalRepository, ProcessProfessionalRepository>();
			services.AddScoped<IUnitRepository, UnitRepository>();
			services.AddScoped<IUnitResponsibleRepository, UnitResponsibleRepository>();
			services.AddScoped<IUnitDocumentationRepository, UnitDocumentationRepository>();
			services.AddScoped<IUnitAttachmentRepository, UnitAttachmentRepository>();
			services.AddScoped<IUnitDocumentationTagRepository, UnitDocumentationTagRepository>();
			services.AddScoped<IAdminRepository, AdminRepository>();
			services.AddScoped<IProjectAndProposalGeneratorRepository, ProjectAndProposalGeneratorRepository>();
			services.AddScoped<IViewersRepository, ViewersRepository>();
			services.AddScoped<IProposalRepository, ProposalRepository>();
			services.AddScoped<IProjectAndProposalAttachmentRepository, ProjectAndProposalAttachmentRepository>();
			services.AddScoped<IProjectAndProposalTagRepository, ProjectAndProposalTagRepository>();
			services.AddScoped<IProjectRepository, ProjectRepository>();
			services.AddScoped<IProposalCommentRepository, ProposalCommentRepository>();
			services.AddScoped<IProjectCommentRepository, ProjectCommentRepository>();
			services.AddScoped<IKnowledgeContentExpertConfirmRepository, KnowledgeContentExpertConfirmRepository>();
			services.AddScoped<IMedalRepository, MedalRepository>();
            services.AddScoped<IPositionRepository, PositionRepository>();
            services.AddScoped<IUnitSubstituteRepository, UnitSubstituteRepository>();
            services.AddScoped<IPageViewRepository, PageViewRepository>();
        }

		public static void RegisterServices(this IServiceCollection services)
		{
			services.AddScoped<IGeneralService, GeneralService>();
			services.AddScoped<IAccountService, AccountService>();
			services.AddScoped<IAuthenticateService, AuthenticateService>();
			services.AddScoped<IQuestionAndAnswerService, QuestionAndAnswerService>();
			services.AddScoped<IKnowledgeContentService, KnowledgeContentService>();
			services.AddScoped<IDocumentationService, DocumentationService>();
			services.AddScoped<IUnitService, UnitService>();
			services.AddScoped<IProjectAndProposalService, ProjectAndProposalService>();
			services.AddScoped<IGamificationService, GamificationService>();
			services.AddScoped<INotificationSender, IgtNotificationSender>();
		}
	}
}
