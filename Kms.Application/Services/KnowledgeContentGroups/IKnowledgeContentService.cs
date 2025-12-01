using Kms.Application.ViewModels;
using Common.OperationResult;
namespace Kms.Application.Services.KnowledgeContentGroups

{
    public interface IKnowledgeContentService
    {
        Task<OperationResult<List<KnowledgeContentViewModel>>> GetNonStructuredKnowledgeContent(int? goalId = null,
            int? pageNo = null);
        Task<OperationResult<KnowledgeContentViewModel>> CreateKnowledgeContentStructured(CreateKnowledgeContentViewModel knowledgeContent);
	    Task<OperationResult<KnowledgeContentViewModel>> CreateKnowledgeContentNonStructured(CreateKnowledgeContentViewModel knowledgeContent);
        Task<OperationResult<List<KnowledgeContentViewModel>>> GetKnowledgeContent(KnowledgeContentTypeEnum knowledgeContentFilter, string? searchText = null, int? goalId = null, int? pageNo = null);
        Task<OperationResult<List<KnowledgeContentViewModel>>> GetAllKnowledgeContentForAdmin(string? searchText = null, int? goalId = null, int? pageNo = null);
        Task<OperationResult<List<KnowledgeContentViewModel>>> GetAwaitingConfirmationKnowledgeContent(int? pageNo = null);
        Task<OperationResult<KnowledgeContentViewModel>> GetKnowledgeContentById(int knowledgeContentId);
        Task<OperationResult<PrintKnowledgeContentViewModel>> PrintStructuredKnowledgeContent(int knowledgeContentId);
        Task<OperationResult<LikeViewModel>> LikeKnowledgeContent(LikeViewModel qaLikeViewModel);
        Task<OperationResult<LikeViewModel>> UnLikeKnowledgeContent(LikeViewModel qaLikeViewModel);
        Task<OperationResult<List<CommentViewModel>>> GetCommentOfKnowledgeContent(int knowledgeContentId, int? pageNo = null);
        Task<OperationResult<List<CommentViewModel>>> GetCommentOfKnowledgeContentWithoutPagination(int knowledgeContentId);
        Task<OperationResult<CommentViewModel>> GetCommentById(int commentId);
        Task<OperationResult<CommentViewModel>> CreateComment(CreateCommentViewModel comment);
        Task<OperationResult<KnowledgeContentViewModel>> ChangeKnowledgeContentType(ChangeKnowledgeContentTypeViewModel model);
        Task<OperationResult<ViewerViewModel>> ConfirmKnowledgeContent(ConfirmKnowledgeContentViewModel model);
        Task<OperationResult<LikeViewModel>> LikeComment(LikeViewModel likeViewModel);
        Task<OperationResult<LikeViewModel>> UnlikeComment(LikeViewModel likeViewModel);
        Task<OperationResult<KnowledgeContentViewModel>> DeleteKnowledgeContent(int knowledgeContentId);
        Task<OperationResult<List<UserViewModel>>> GetUsersViewerKnowledgeContent(int id);
        Task<OperationResult<List<UnitViewModel>>> GetUnitsViewerKnowledgeContent(int id);
        Task<OperationResult<KnowledgeContentViewModel>> DeactivateKnowledgeContent(int knowledgeContentId);
        Task<OperationResult<KnowledgeContentExpertConfirmsViewModel>> ConfirmOrNotConfirmKnowledgeContent(int knowledgeContentId);

    }
}