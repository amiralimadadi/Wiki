using Common.OperationResult;
using Kms.Application.ViewModels;
using Kms.Domain.Entities.General;

namespace Kms.Application.Services.General
{
	public interface IGeneralService
	{
        Task<OperationResult<List<GoalViewModel>>> GetTotalGoalTree();
        Task<OperationResult<List<GoalViewModel>>> GetGoalsTreeBeyondSecondLevel();

        Task<OperationResult<List<GoalViewModel>>> GetGoalSubTree(int rootId);

        Task<OperationResult<GoalViewModel>> GetGoalById(int goalId);

        Task<OperationResult<List<CodeDescriptionViewModel>>> GetCodeDescription();

        Task<OperationResult<GoalViewModel>> CreateGoal(CreateGoalViewModel goal);
        Task<OperationResult<AddVisitPageViewModel?>> AddVisitPageView(AddVisitPageViewModel? vm);


        Task<OperationResult<GoalViewModel>> UpdateGoal(int goalId, EditGoalViewModel editGoal);

        Task<OperationResult<GoalViewModel>> DeleteGoal(int goalId);

        //Task<OperationResult<GoalViewModel>> AddGoalByParentId(int parentId, AddGoalViewModel goal);

        Task<OperationResult<bool>> ExpireAll();

        Task<OperationResult<List<TagsViewModel>>> GetAllTags();

        Task<OperationResult<List<ProcessprofessionalViewModel>>> GetAllExperts();
        Task<OperationResult<ProcessprofessionalViewModel>> AddUserToExpert(CreateExpertViewModel model);

        Task<OperationResult<List<ProcessprofessionalViewModel>>> GetAllOwners();
        Task<OperationResult<ProcessprofessionalViewModel>> AddUserToOwner(CreateExpertViewModel model);
        Task<OperationResult<ProcessprofessionalViewModel>> DeleteExpertOrOwner(int id,int goalId);
        Task<OperationResult<AdminViewModel>> DeleteAdminById(int id);
        Task<OperationResult<List<UnitViewModel>>> GetAllUnits();
        Task<OperationResult<UnitViewModel>> AddUnit(UnitViewModel model);


        Task<OperationResult<List<AdminViewModel>>> GetAllAdmins();

        Task<OperationResult<AdminViewModel>> AddUserToAdmins(CreateAdminViewModel model);

        Task<OperationResult<UserProfileViewModel>> GetProfileDataForCurrentUser();
        Task<OperationResult<UserProfileViewModel>> GetProfileDataByUserId(int userId);

        Task<OperationResult<List<string>>> GetAccessListByUserId(int userId);

        Task<OperationResult<List<UserProfileViewModel>>> GetProfileDataForAllUsers();

        Task<OperationResult<List<UserProfileViewModel>>> GetTopThreeUsersByScore();
        Medals? GetMedalForScore(decimal score);


        Task<OperationResult<List<Top50ContentsViewModel>>> GetTop50Contents();




    }
}
