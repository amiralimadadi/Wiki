using Common.OperationResult;
using Kms.Application.ViewModels;

namespace Kms.Application.Services.ProjectAndProposal;

public interface IProjectAndProposalService
{
  
    Task<OperationResult<GeneratorViewModel>> AddUserToGenerator(CreateGeneratorViewModel model);
    Task<OperationResult<List<GeneratorViewModel>>> GetUsersGenerator();
    Task<OperationResult<GeneratorViewModel>> DeleteUsersGeneratorById(int id);
    Task<OperationResult<ViewerViewModel>> GetUsersViewer(int entityId);

    Task<OperationResult<ViewerViewModel>> ConfirmProposal(CreateViewerViewModel mode);
    Task<OperationResult<List<ProposalViewModel>>> GetProposalsForAdminConfirm();
    Task<OperationResult<ProposalViewModel>> CreateProposal(CreateProposalViewModel proposal);
    Task<OperationResult<List<ProposalViewModel>>> GetAllProposal(GetProposalTypesEnum proposalFilter, string? searchText = null, int? goalId = null, int? pageNo = null);
    Task<List<int>> GetAllowableEntityIdInViewer(int userId);
    Task<OperationResult<LikeViewModel>> LikeProposal(LikeViewModel qaLikeViewModel);
    Task<OperationResult<LikeViewModel>> UnLikeProposal(LikeViewModel qaLikeViewModel);
    Task<OperationResult<ProposalCommentViewModel>> CreateProposalComment(CreateProposalCommentViewModel comment);
    Task<OperationResult<List<ProposalCommentViewModel>>> GetCommentOfProposal(int proposalId, int? pageNo = null);
    Task<OperationResult<ProposalCommentViewModel>> GetProposalCommentById(int commentId);
    Task<OperationResult<LikeViewModel>> LikeProposalComment(LikeViewModel likeViewModel);
    Task<OperationResult<LikeViewModel>> UnlikeProposalComment(LikeViewModel likeViewModel);

    #region Project

    Task<OperationResult<ProjectViewModel>> CreateProject(CreateProjectViewModel project); 
    Task<OperationResult<List<ProjectViewModel>>> GetAllProject(GetProjectTypesEnum projectFilter, string? searchText = null, int? goalId = null, int? pageNo = null);
    Task<OperationResult<ViewerViewModel>> ConfirmProject(CreateViewerViewModel mode);
    Task<OperationResult<List<ProjectViewModel>>> GetProjectsForAdminConfirm();
    Task<OperationResult<LikeViewModel>> LikeProject(LikeViewModel qaLikeViewModel);
    Task<OperationResult<LikeViewModel>> UnLikeProject(LikeViewModel qaLikeViewModel);
    Task<OperationResult<ProjectCommentViewModel>> CreateProjectComment(CreateProjectCommentViewModel comment);
    Task<OperationResult<List<ProjectCommentViewModel>>> GetCommentOfProject(int projectId, int? pageNo = null);
    Task<OperationResult<ProjectCommentViewModel>> GetProjectCommentById(int commentId);
    Task<OperationResult<LikeViewModel>> LikeCommentProject(LikeViewModel likeViewModel);
    Task<OperationResult<LikeViewModel>> UnlikeCommentProject(LikeViewModel likeViewModel);

    #endregion

    Task<List<AttachmentViewModel>> GetAttachmentForProposalOrProject(string entityNAme, int entityId);



}