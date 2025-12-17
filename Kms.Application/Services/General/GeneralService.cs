using AutoMapper;
using Common.Date;
using Common.Extensions;
using Common.OperationResult;
using Common.Paging;
using Kms.Application.Senders;
using Kms.Application.Services.Account;
using Kms.Application.Services.Gamifications;
using Kms.Application.ViewModels;
using Kms.DataLayer.Contracts;
using System.Linq;
using Kms.DataLayer.Repositories;
using Kms.Domain.Entities.General;
using Kms.Domain.Entities.KnowledgeContentGroup;
using Kms.Domain.Entities.ProjectAndProposal;
using Kms.Domain.Entities.QuestionAndAnswer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Common.SqlDto;
using Kms.DataLayer.Context;
using Microsoft.Data.SqlClient;

namespace Kms.Application.Services.General
{
    public class GeneralService : IGeneralService
    {
        private readonly KmsDbContext _dbContext;
        private readonly IGoalRepository _goalRepository;
        private readonly IAdminRepository _adminRepository;
        private readonly IPageViewRepository _pageViewRepository;
        private readonly IKnowledgeContentRepository _knowledgeContentRepository;
        private readonly ITagRepository _tagRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILikeRepository _likeRepository;

        private readonly IProjectCommentRepository _projectCommentRepository;
        private readonly IProposalCommentRepository _proposalCommentRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly IAnswerRepository _answerRepository;
        private readonly IQuestionRepository _questionRepository;

        private readonly ICommentRepository _commentRepository;
        private readonly IAccountService _accountService;
        private readonly IProposalRepository _proposalRepository;
        private readonly IMedalRepository _medalRepository;
        private readonly IUnitRepository _unitRepository;
        private readonly PagingOptions _pagingOptions;
        private readonly IUserScoreRepository _userScoreRepository;
        private readonly IProcessProfessionalRepository _processProfessionalRepository;
        private readonly ICodeDescriptionRepository _codeDescriptionRepository;
        private readonly IMapper _mapper;

        #region Constructor

        public GeneralService(IGoalRepository goalRepository,
            KmsDbContext dbContext,
            ITagRepository tagRepository,
            IUserRepository userRepository,
            IAdminRepository adminRepository,
            IPageViewRepository pageViewRepository,
            
            IProjectCommentRepository projectCommentRepository,
            IProposalCommentRepository proposalCommentRepository,
            IProjectRepository projectRepository,
            IAnswerRepository answerRepository,
            IQuestionRepository questionRepository,

            IProposalRepository proposalRepository,
            ILikeRepository likeRepository,
            ICommentRepository commentRepository,
            IKnowledgeContentRepository knowledgeContentRepository,
            IMedalRepository medalRepository,
            IUserScoreRepository userScoreRepository,
            ICodeDescriptionRepository codeDescriptionRepository,
            IUnitRepository unitRepository,
            IMapper mapper,
            IOptions<PagingOptions> pagingOptions,
            IProcessProfessionalRepository processProfessionalRepository,
            IAccountService accountService)
        {
            _dbContext = dbContext;
            _goalRepository = goalRepository;
            _userRepository = userRepository;
            _medalRepository = medalRepository;
            _pageViewRepository = pageViewRepository;
            _knowledgeContentRepository = knowledgeContentRepository;

            _projectCommentRepository = projectCommentRepository;
            _proposalCommentRepository = proposalCommentRepository;
            _projectRepository = projectRepository;
            _answerRepository = answerRepository;
            _questionRepository = questionRepository;

            _proposalRepository = proposalRepository;
            _commentRepository = commentRepository;
            _likeRepository = likeRepository;
            _userScoreRepository = userScoreRepository;
            _adminRepository = adminRepository;
            _tagRepository = tagRepository;
            _accountService = accountService;
            _unitRepository = unitRepository;
            _codeDescriptionRepository = codeDescriptionRepository;
            _mapper = mapper;
            _pagingOptions = pagingOptions.Value;
            _processProfessionalRepository = processProfessionalRepository;
        }
        #endregion Constructor

        #region Private Methods
        private bool ValidateGoal(Goal goal, out Goal finalGoal, out List<ModelError> modelErrors)
        {
            modelErrors = new List<ModelError>();
            finalGoal = goal;

            var entityErrors = _goalRepository.EntityValidation(finalGoal, out List<ModelError> errors);
            var propertyErrors = errors.Select(a => a.ModelPropertyName).ToList();

            //برای اینکه برای اشتباه بودن تاریخ 2 بار پیام خطا ندهد شرط گذاشته شده است
            var tryRes = PersianDate.TryMiladiParse(finalGoal.StartPersianDate, out var startDate);
            if (!tryRes && !propertyErrors.Contains("StartPersianDate"))
            {
                errors.Add(new ModelError("StartPersianDate", "تاریخ شروع در فرمت درست نیست"));
            }
            else
            {
                finalGoal.StartDate = startDate;
            }

            tryRes = PersianDate.TryMiladiParse(goal.EndPersianDate, out var endDate);
            if (!tryRes && !propertyErrors.Contains("EndPersianDate"))
            {
                errors.Add(new ModelError("EndPersianDate", "تاریخ پایان در فرمت درست نیست"));
            }
            else
            {
                finalGoal.EndDate = endDate;
            }

            var dscRes = _codeDescriptionRepository.GetDescriptions("Goal Category Types", finalGoal.GoalType);
            if (!dscRes.Any())
            {
                errors.Add(new ModelError("GoalType", "نوع هدف به درستی تعیین نشده است"));

            }

            var user = _userRepository.GetById(finalGoal.UserId);
            if (user == null)
            {
                errors.Add(new ModelError("UserId", "کاربر ثبت کننده یافت نشد"));
            }
            var parent = _goalRepository.GetById(finalGoal.ParentId);
            if (parent == null)
            {
                errors.Add(new ModelError("UserId", "نود والد یافت نشد"));
            }

            if (errors.Any())
            {
                modelErrors = errors;
                return false;
            }
            return true;
        }
        #endregion

        #region Services

        public async Task<OperationResult<List<GoalViewModel>>> GetTotalGoalTree()
        {
            var goals = _goalRepository.GetEntity(null, true, false)
                .OrderBy(a => a.ParentId)
                .ToList();
            var result = _mapper.Map<List<GoalViewModel>>(goals);

            // به‌روزرسانی نام کاربر، عنوان والد و توضیحات نوع هدف برای هر هدف
            foreach (var goal in result)
            {
                if (goal.UserId != null)
                {
                    var user = _userRepository.GetById(goal.UserId);
                    goal.UserName = user?.UserName;
                }

                if (goal.ParentId != null)
                {
                    var parentGoal = _goalRepository.GetById(goal.ParentId);
                    goal.ParentTitle = parentGoal?.GoalTitle;
                }

                goal.GoalTypeDescription = _codeDescriptionRepository
                    .GetDescriptions("Goal Category Types", goal.GoalType ?? 0)
                    .FirstOrDefault()?.TypeDescription ?? "";
            }

            // مرتب‌سازی نتایج بر اساس Id
            var sortedResult = result.OrderBy(a => a.Id).ToList();

            return new OperationResult<List<GoalViewModel>>(true, sortedResult, "Goal tree is here");
        }


        public async Task<OperationResult<List<GoalViewModel>>> GetGoalsTreeBeyondSecondLevel()
        {
            var goals = _goalRepository.GetEntity(null, true, false)
                .OrderBy(a => a.ParentId)
                .ToList();

            var result = _mapper.Map<List<GoalViewModel>>(goals);

            var filteredResult = result.Where(goal => goal.ParentId != null &&
                                                      GetParentLevel(goal.ParentId) >= 2).ToList();

            foreach (var goal in filteredResult)
            {
                if (goal.UserId != null)
                {
                    var user = _userRepository.GetById(goal.UserId);
                    goal.UserName = user?.UserName;
                }

                if (goal.ParentId != null)
                {
                    var parentGoal = _goalRepository.GetById(goal.ParentId);
                    goal.ParentTitle = parentGoal?.GoalTitle;
                }

                goal.GoalTypeDescription = _codeDescriptionRepository
                    .GetDescriptions("Goal Category Types", goal.GoalType ?? 0)
                    .FirstOrDefault()?.TypeDescription ?? "";
            }


            var sortedResult = filteredResult.OrderBy(a => a.Id).ToList();

            return new OperationResult<List<GoalViewModel>>(true, sortedResult, "Filtered goal tree is here");
        }

        // تابعی برای بدست آوردن سطح والد از parentId
        private int GetParentLevel(int parentId)
        {
            var parentGoal = _goalRepository.GetById(parentId);
            if (parentGoal == null || parentGoal.ParentId == null)
                return 1;  // ریشه یا والد اصلی
            return GetParentLevel((int)parentGoal.ParentId) + 1;
        }




        public async Task<OperationResult<List<GoalViewModel>>> GetGoalSubTree(int rootId)
        {
            var goals = _goalRepository.GetEntity(a => a.ParentId == rootId, true, true).OrderBy(a => a.Id).ToList();
            var result = new List<GoalViewModel>();

            result = _mapper.Map<List<GoalViewModel>>(goals);

            result.ForEach(a => a.UserName = _userRepository.GetById(a.UserId!)?.UserName);
            result.ForEach(a => a.ParentTitle = _goalRepository.GetById(a.ParentId!)?.GoalTitle);
            result.ForEach(a => a.GoalTypeDescription = _codeDescriptionRepository.GetDescriptions("Goal Category Types", a.GoalType ?? 0).FirstOrDefault()?.TypeDescription ?? "");

            return new OperationResult<List<GoalViewModel>>(true, result, "Goal tree is here");
        }

        public async Task<OperationResult<GoalViewModel>> GetGoalById(int goalId)
        {
            var goal = _goalRepository.GetById(goalId);
            if (goal == null)
                return new OperationResult<GoalViewModel>(false, null!, "هدفی یافت نشد");
            var result = _mapper.Map<GoalViewModel>(goal);

            return new OperationResult<GoalViewModel>(true, result, nameof(Goal) + $" رکورد {goalId} ");


        }

        public async Task<OperationResult<List<CodeDescriptionViewModel>>> GetCodeDescription()
        {
            var codeDescription = _codeDescriptionRepository.GetEntity(null, true, true).ToList();

            var result = _mapper.Map<List<CodeDescriptionViewModel>>(codeDescription);
            return new OperationResult<List<CodeDescriptionViewModel>>(true, result, "Get All CodeDescription");
        }

        public async Task<OperationResult<GoalViewModel>> CreateGoal(CreateGoalViewModel goal)
        {
            var tempGoal = _mapper.Map<Goal>(goal);
            //var errors = new List<ModelError>();

            var res = ValidateGoal(tempGoal, out Goal finalGoal, out List<ModelError> errors);
            if (!res)
            {
                return new OperationResult<GoalViewModel>(false, null, nameof(Goal) + " did not created.", errors);

            }

            await _goalRepository.AddAsync(tempGoal, true);

            var result = _mapper.Map<GoalViewModel>(tempGoal);
            result.GoalTypeDescription = _codeDescriptionRepository.GetDescriptions("Goal Category Types", tempGoal.GoalType).FirstOrDefault()?.TypeDescription ?? "";
            result.UserName = _userRepository.GetById(tempGoal.UserId)?.UserName ?? "";
            result.ParentTitle = _goalRepository.GetById(tempGoal.ParentId)?.GoalTitle ?? "";

            return new OperationResult<GoalViewModel>(true, result, nameof(Goal) + " Successfully Created ");
        }

        public async Task<OperationResult<GoalViewModel>> UpdateGoal(int goalId, EditGoalViewModel editGoal)
        {
            //var goal = _goalRepository.GetById(goalId);

            var tempGoal = new Goal();
            tempGoal = _mapper.Map<Goal>(editGoal);
            tempGoal.Id = goalId;

            //goal.GoalTitle = editGoal.GoalTitle;
            //goal.StartPersianDate = editGoal.StartPersianDate;
            //goal.EndPersianDate = editGoal.EndPersianDate;
            //goal.GoalType = editGoal.GoalType;
            //var tempGoal = _mapper.Map<Goal>(goal);

            var res = ValidateGoal(tempGoal, out Goal finalGoal, out List<ModelError> errors);
            if (!res)
            {
                return new OperationResult<GoalViewModel>(false, null, nameof(Goal) + " did not created.", errors);
            }
            await _goalRepository.UpdateAsync(tempGoal, true);
            var result = _mapper.Map<GoalViewModel>(tempGoal);
            return new OperationResult<GoalViewModel>(true, result, nameof(Goal) + $" رکورد {goalId} با موفقیت ویرایش شد");
        }

        public async Task<OperationResult<GoalViewModel>> DeleteGoal(int goalId)
        {
            var goal = _goalRepository.GetById(goalId);
            if (goal == null)
                return new OperationResult<GoalViewModel>(false, null!, "رکوردی یافت نشد");
            await _goalRepository.DeleteAsync(goal, false, true);
            var result = _mapper.Map<GoalViewModel>(goal);

            return new OperationResult<GoalViewModel>(true, result, nameof(Goal) + $" رکورد {goalId} با موفقیت حذف شد");
        }

        //public async Task<OperationResult<GoalViewModel>> AddGoalByParentId(int parentId, AddGoalViewModel goal)
        //{
        //    var newGoal = new Goal
        //    {
        //        GoalTitle = goal.GoalTitle,
        //        GoalDescription = "null",
        //        StartPersianDate = goal.StartPersianDate,
        //        EndPersianDate = goal.EndPersianDate,
        //        ParentId = parentId,
        //        GoalType = goal.GoalType,
        //        UserId = goal.UserId,
        //    };
        //    var tempGoal = _mapper.Map<Goal>(newGoal);
        //    var res = ValidateGoal(tempGoal, out Goal finalGoal, out List<ModelError> errors);
        //    if (!res)
        //    {
        //        return new OperationResult<GoalViewModel>(false, null, nameof(Goal) + " did not created.", errors);
        //    }
        //    await _goalRepository.AddAsync(newGoal, true);
        //    var result = _mapper.Map<GoalViewModel>(newGoal);
        //    return new OperationResult<GoalViewModel>(true, result, nameof(Goal) + " Successfully Created ");
        //}

        public async Task<OperationResult<bool>> ExpireAll()
        {
            var allGoalCopyWithoutRoot = _goalRepository.GetEntity(r => r.Description != "Root Goal", true, true).ToList();

            var newGoal = new List<Goal>();

            foreach (var item in allGoalCopyWithoutRoot)
            {
                newGoal.Add(new Goal
                {
                    EndPersianDate = DateTime.Now.AddYears(1).ToPersianDate(),
                    EndDate = DateTime.Now.AddYears(1),
                    StartPersianDate = DateTime.Now.ToPersianDate(),
                    StartDate = DateTime.Now,
                    GoalType = item.GoalType,
                    ParentId = item.ParentId,
                    GoalTitle = item.GoalTitle,
                    GoalDescription = item.GoalDescription,
                    UserId = item.UserId,
                    LastModifiedDate = DateTime.Now
                });
            }
            await _goalRepository.AddRangeAsync(newGoal, true);

            var allGoalEditWithoutRoot = _goalRepository.GetEntity(r => r.Description != "Root Goal" && r.StartDate < DateTime.Now, true, true).ToList();
            foreach (var item in allGoalEditWithoutRoot)
            {
                item.IsActive = false;
                await _goalRepository.UpdateAsync(item, true);
            }

            return new OperationResult<bool>(true, true, "Success");
        }

        public async Task<OperationResult<List<TagsViewModel>>> GetAllTags()
        {
            var tags = _tagRepository.GetEntity(null, true, true).ToList();

            var result = _mapper.Map<List<TagsViewModel>>(tags);
            return new OperationResult<List<TagsViewModel>>(true, result, "Get All CodeDescription");

        }

        public async Task<OperationResult<AddVisitPageViewModel?>> AddVisitPageView(AddVisitPageViewModel? vm)
        {

            var errors = new List<ModelError>();
            var tempPageView = _mapper.Map<PageView>(vm);

            if (vm == null)
            {
                return new OperationResult<AddVisitPageViewModel?>(false, null, nameof(PageView) + " did not added.", errors);
            }

            if (_userRepository.GetById(tempPageView.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempPageView.UserId), "مشاهده کننده به درستی انتخاب نشده است"));
            }
            if (errors.Any())
            {
                return new OperationResult<AddVisitPageViewModel?>(false, null!, "خطایی رخ داده است", errors);
            }

            await _pageViewRepository.AddAsync(tempPageView, true);



            return new OperationResult<AddVisitPageViewModel?>(true, vm, nameof(PageView) + "ویو جدید");
        }

        #endregion

        public async Task<OperationResult<List<ProcessprofessionalViewModel>>> GetAllExperts()
        {
            var experts = await _processProfessionalRepository
                .GetEntityAsNoTracking().Where(e => e.IsActive && !e.IsDeleted && e.Kind == "Expert")
                .ToListAsync();
            var users = _userRepository.GetEntity(null, true, true).ToList();
            var goals = _goalRepository.GetEntity(null, true, true).ToList();
            var groupedData = experts.GroupBy(e => e.UserId).ToList();

            var expertViewModels = groupedData.Select(g => new ProcessprofessionalViewModel
            {
                Id = g.First().Id,
                Kind = g.First().Kind,
                UserId = g.Key,
                FullName = users.FirstOrDefault(u => u.Id == g.Key)?.FullName,
                Goals = g.Select(e => new GoalExpertViewModel
                {
                    GoalId = e.GoalId,
                    GoalName = goals.FirstOrDefault(goal => goal.Id == e.GoalId)?.GoalTitle // پیدا کردن GoalName بر اساس GoalId
                }).ToList()
            }).ToList();

            var result = _mapper.Map<List<ProcessprofessionalViewModel>>(expertViewModels);

            return new OperationResult<List<ProcessprofessionalViewModel>>(true, result, "Get All Experts");
        }

        public async Task<OperationResult<ProcessprofessionalViewModel>> AddUserToExpert(CreateExpertViewModel model)
        {
            var errors = new List<ModelError>();

            var dbGoals = await _goalRepository.GetEntityAsNoTracking()
                .FirstOrDefaultAsync(g => g.Id == model.GoalId);

            if (dbGoals == null)
            {
                return new OperationResult<ProcessprofessionalViewModel>(false, null, "Goal not correctly selected.", errors);
            }

            var dbUser = await _userRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(u => u.Id == model.UserId);
            if (dbUser == null)
            {
                await _accountService.InsertNewUser(model.UserId);
            }

            var newExpert = new ProcessProfessional
            {
                UserId = model.UserId,
                GoalId = model.GoalId,
                Kind = "Expert"
            };

            await _processProfessionalRepository.AddAsync(newExpert, true);

            var user = _userRepository.GetEntityAsNoTracking().FirstOrDefault(u => u.Id == newExpert.UserId);
            var goal = _goalRepository.GetEntityAsNoTracking().FirstOrDefault(g => g.Id == newExpert.GoalId);

            var expertViewModel = new ProcessprofessionalViewModel
            {
                Id = newExpert.UserId,
                FullName = user?.FullName,
                Kind = "خبره",
                Goals = new List<GoalExpertViewModel>
                    {
                        new()
                        {
                            GoalId = newExpert.GoalId,
                            GoalName = goal?.GoalDescription
                        }
                    }
            };
            return new OperationResult<ProcessprofessionalViewModel>(true, expertViewModel, "User added to Expert successfully.");

        }

        public async Task<OperationResult<List<ProcessprofessionalViewModel>>> GetAllOwners()
        {
            var owner = await _processProfessionalRepository
                .GetEntityAsNoTracking().Where(e => e.IsActive && !e.IsDeleted && e.Kind == "Owner")
                .ToListAsync();
            var users = _userRepository.GetEntity(null, true, true).ToList();
            var goals = _goalRepository.GetEntity(null, true, true).ToList();
            var groupedData = owner.GroupBy(e => e.UserId).ToList();

            var expertViewModels = groupedData.Select(g => new ProcessprofessionalViewModel
            {
                Id = g.First().Id,
                Kind = g.First().Kind,
                UserId = g.Key,
                FullName = users.FirstOrDefault(u => u.Id == g.Key)?.FullName,
                Goals = g.Select(e => new GoalExpertViewModel
                {
                    GoalId = e.GoalId,
                    GoalName = goals.FirstOrDefault(goal => goal.Id == e.GoalId)?.GoalTitle // پیدا کردن GoalName بر اساس GoalId
                }).ToList()
            }).ToList();

            var result = _mapper.Map<List<ProcessprofessionalViewModel>>(expertViewModels);

            return new OperationResult<List<ProcessprofessionalViewModel>>(true, result, "Get All Owner");
        }

        public async Task<OperationResult<ProcessprofessionalViewModel>> AddUserToOwner(CreateExpertViewModel model)
        {
            var errors = new List<ModelError>();

            var dbGoals = await _goalRepository.GetEntityAsNoTracking()
                .FirstOrDefaultAsync(g => g.Id == model.GoalId);

            if (dbGoals == null)
            {
                return new OperationResult<ProcessprofessionalViewModel>(false, null, "Goal not correctly selected.", errors);
            }

            var dbUser = await _userRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(u => u.Id == model.UserId);
            if (dbUser == null)
            {
                await _accountService.InsertNewUser(model.UserId);
            }

            var newExpert = new ProcessProfessional
            {
                UserId = model.UserId,
                GoalId = model.GoalId,
                Kind = "Owner"
            };

            await _processProfessionalRepository.AddAsync(newExpert, true);

            var user = _userRepository.GetEntityAsNoTracking().FirstOrDefault(u => u.Id == newExpert.UserId);
            var goal = _goalRepository.GetEntityAsNoTracking().FirstOrDefault(g => g.Id == newExpert.GoalId);

            var expertViewModel = new ProcessprofessionalViewModel
            {
                Id = newExpert.UserId,
                FullName = user?.FullName,
                Kind = "مالک",
                Goals = new List<GoalExpertViewModel>
                    {
                        new()
                        {
                            GoalId = newExpert.GoalId,
                            GoalName = goal?.GoalDescription
                        }
                    }
            };
            return new OperationResult<ProcessprofessionalViewModel>(true, expertViewModel, "User added to Expert successfully.");

        }
        
        public async Task<OperationResult<ProcessprofessionalViewModel>> DeleteExpertOrOwner(int id, int goalId)
        {
            //var processProfessional = _processProfessionalRepository.GetById(id);


            var processProfessional = await _processProfessionalRepository.GetEntityAsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id && u.GoalId == goalId);


            if (processProfessional == null)
                return new OperationResult<ProcessprofessionalViewModel>(false, null!, "رکوردی یافت نشد");
            await _processProfessionalRepository.DeleteAsync(processProfessional, true, true);
            var result = _mapper.Map<ProcessprofessionalViewModel>(processProfessional);

            return new OperationResult<ProcessprofessionalViewModel>(true, result, " با موفقیت حذف شد");
        }

        public async Task<OperationResult<List<UnitViewModel>>> GetAllUnits()
        {

            var units = await _unitRepository
                .GetEntityAsNoTracking()
                .Where(e => e.IsActive && !e.IsDeleted)
                .ToListAsync();

            var unitViewModels = units.Select(u => new UnitViewModel
            {
                ID = u.Id,
                UnitName = u.UnitName
            }).ToList();

            var result = _mapper.Map<List<UnitViewModel>>(unitViewModels);

            return new OperationResult<List<UnitViewModel>>(true, result, "لیست واحد های ثبت شده");

        }

        public async Task<OperationResult<UnitViewModel>> AddUnit(UnitViewModel model)
        {
            var errors = new List<ModelError>();

            var existingUnit = await _unitRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(u => u.UnitName == model.UnitName);
            if (existingUnit != null)
            {
                return new OperationResult<UnitViewModel>(false, null, "واحدی با این نام قبلا ثبت شده است.");
            }

            //TODO insert from Igt 

            var newUnit = new Unit
            {
                UnitName = model.UnitName
            };

            await _unitRepository.AddAsync(newUnit, true);



            var unitViewModel = new UnitViewModel
            {
                UnitName = model.UnitName,
            };
            return new OperationResult<UnitViewModel>(true, unitViewModel, "واحد مودر نظر با موفقیت ثبت شد");

        }


        #region Admin

        public async Task<OperationResult<AdminViewModel>> AddUserToAdmins(CreateAdminViewModel model)
        {
            var errors = new List<ModelError>();
            var kindString = model.Kind.ToString();
            var existingAdmin = await _adminRepository.GetEntityAsNoTracking()
                .FirstOrDefaultAsync(a => a.UserId == model.UserId && a.Kind == kindString);
            if (existingAdmin != null)
            {
                errors.Add(new ModelError("Duplicate", "کاربری با این نوع قبلاً به عنوان مدیر ثبت شده است."));
                return new OperationResult<AdminViewModel>(false, null, "کاربر با این نوع قبلاً ثبت شده است.", errors);
            }
            var dbUser = await _userRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(u => u.Id == model.UserId);
            if (dbUser == null)
            {
                await _accountService.InsertNewUser(model.UserId);
            }

            var newAdmin = new Admin()
            {
                UserId = model.UserId,
                Kind = kindString,
            };

            await _adminRepository.AddAsync(newAdmin, true);

            var user = _userRepository.GetEntityAsNoTracking().FirstOrDefault(u => u.Id == newAdmin.UserId);

            if (Enum.TryParse<AdminKind>(newAdmin.Kind, out var adminKind))
            {

                var adminViewModel = new AdminViewModel()
                {
                    UserId = newAdmin.UserId,
                    FullName = user?.FullName,
                    Kind = adminKind.GetDisplayName()
                };

                return new OperationResult<AdminViewModel>(true, adminViewModel, "کاربر با موفقیت به عنوان مدیر اضافه شد.");
            }

            errors.Add(new ModelError("Kind", "مقدار وارد شده برای نوع نامعتبر است."));
            return new OperationResult<AdminViewModel>(false, null, "افزودن کاربر به مدیر با شکست مواجه شد.", errors);
        }

        public async Task<OperationResult<List<AdminViewModel>>> GetAllAdmins()
        {
            var admins = await _adminRepository.GetEntityAsNoTracking()
                .Where(a => a.IsActive && !a.IsDeleted).Include(a => a.User).ToListAsync();

            var result = admins.Select(g => new AdminViewModel()
            {
                Id = g.Id,
                UserId = g.UserId,
                FullName = g.User?.FullName,
                Kind = Enum.TryParse<AdminKind>(g.Kind, true, out var kind) ? kind.GetDisplayName() : AdminKind.Project.GetDisplayName()
            }).ToList();


            //var result = _mapper.Map<List<AdminViewModel>>(admins);

            return new OperationResult<List<AdminViewModel>>(true, result, "Get All Admins");
        }

        public async Task<OperationResult<AdminViewModel>> DeleteAdminById(int id)
        {
            var admin = _adminRepository.GetById(id);
            if (admin == null)
                return new OperationResult<AdminViewModel>(false, null!, "رکوردی یافت نشد");
            await _adminRepository.DeleteAsync(admin, true, true);
            var result = _mapper.Map<AdminViewModel>(admin);

            return new OperationResult<AdminViewModel>(true, result, " با موفقیت حذف شد");
        }

        #endregion

        #region Medals

        public async Task<OperationResult<UserProfileViewModel>> GetProfileDataForCurrentUser()
        {
            var userId = _accountService.GetUserId();

            var userScore = await _userScoreRepository.GetEntityAsNoTracking()
                .Where(a => a.UserId == userId)
                .GroupBy(a => a.User)
                .Select(scoreGroup => new UserProfileViewModel
                {
                    UserId = scoreGroup.Key.Id,
                    FirstName = scoreGroup.Key.FirstName,
                    FullName = scoreGroup.Key.FullName,
                    UserName = scoreGroup.Key.UserName,
                    TotalScoreAmount = scoreGroup.Sum(a => a.ScoreAmount)
                })
                .FirstOrDefaultAsync();

            if (userScore == null)
            {
                var user = await _userRepository.GetEntityAsNoTracking()
                    .Where(u => u.Id == userId)
                    .Select(u => new UserProfileViewModel
                    {
                        UserId = u.Id,
                        FirstName = u.FirstName,
                        FullName = u.FullName,
                        UserName = u.UserName,
                        TotalScoreAmount = 0
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return new OperationResult<UserProfileViewModel>(false, null, "کاربر مورد نظر یافت نشد");

                userScore = user;
            }

            var medal = await _medalRepository.GetEntityAsNoTracking()
                .Where(m => m.MinScore <= userScore.TotalScoreAmount && userScore.TotalScoreAmount < m.MaxScore)
                .FirstOrDefaultAsync();

            if (medal != null)
            {
                userScore.CurrentMedal = medal.Description;

                var nextMedal = await _medalRepository.GetEntityAsNoTracking()
                    .Where(m => m.MinScore > userScore.TotalScoreAmount)
                    .OrderBy(m => m.MinScore)
                    .FirstOrDefaultAsync();

                if (nextMedal != null)
                {
                    var remainingScore = nextMedal.MinScore - userScore.TotalScoreAmount;
                    userScore.RemainingScoreText = $"{userScore.FirstName} عزیز، شما به {remainingScore} امتیاز برای ورود به سطح {nextMedal.Description} نیاز دارید.";
                }
                else
                {
                    userScore.RemainingScoreText = $"{userScore.FirstName} عزیز، تبریک! شما بالاترین مدال را کسب کرده‌اید.";
                }
            }
            else
            {
                userScore.CurrentMedal = "بدون مدال";
                var nextMedal = await _medalRepository.GetEntityAsNoTracking()
                    .OrderBy(m => m.MinScore)
                    .FirstOrDefaultAsync();

                if (nextMedal != null)
                {
                    var remainingScore = nextMedal.MinScore - userScore.TotalScoreAmount;
                    userScore.RemainingScoreText = $"{userScore.FirstName} عزیز، شما به {remainingScore} امتیاز برای ورود به سطح {nextMedal.Description} نیاز دارید.";
                }
            }

            return new OperationResult<UserProfileViewModel>(true, userScore, "اطلاعات کاربر");
        }

        public async Task<OperationResult<UserProfileViewModel>> GetProfileDataByUserId(int userId)
        {

            var userScore = await _userScoreRepository.GetEntityAsNoTracking()
                .Where(a => a.UserId == userId)
                .GroupBy(a => a.User)
                .Select(scoreGroup => new UserProfileViewModel
                {
                    UserId = scoreGroup.Key.Id,
                    FirstName = scoreGroup.Key.FirstName,
                    FullName = scoreGroup.Key.FullName,
                    UserName = scoreGroup.Key.UserName,
                    TotalScoreAmount = scoreGroup.Sum(a => a.ScoreAmount)
                })
                .FirstOrDefaultAsync();

            if (userScore == null)
            {
                var user = await _userRepository.GetEntityAsNoTracking()
                    .Where(u => u.Id == userId)
                    .Select(u => new UserProfileViewModel
                    {
                        UserId = u.Id,
                        FirstName = u.FirstName,
                        FullName = u.FullName,
                        UserName = u.UserName,
                        TotalScoreAmount = 0
                    })
                    .FirstOrDefaultAsync();

                if (user == null)
                    return new OperationResult<UserProfileViewModel>(false, null, "کاربر مورد نظر یافت نشد");

                userScore = user;
            }

            var medal = await _medalRepository.GetEntityAsNoTracking()
                .Where(m => m.MinScore <= userScore.TotalScoreAmount && userScore.TotalScoreAmount < m.MaxScore)
                .FirstOrDefaultAsync();

            if (medal != null)
            {
                userScore.CurrentMedal = medal.Description;

                var nextMedal = await _medalRepository.GetEntityAsNoTracking()
                    .Where(m => m.MinScore > userScore.TotalScoreAmount)
                    .OrderBy(m => m.MinScore)
                    .FirstOrDefaultAsync();

                if (nextMedal != null)
                {
                    var remainingScore = nextMedal.MinScore - userScore.TotalScoreAmount;
                    userScore.RemainingScoreText = $"{userScore.FirstName} عزیز، شما به {remainingScore} امتیاز برای ورود به سطح {nextMedal.Description} نیاز دارید.";
                }
                else
                {
                    userScore.RemainingScoreText = $"{userScore.FirstName} عزیز، تبریک! شما بالاترین مدال را کسب کرده‌اید.";
                }
            }
            else
            {

                userScore.CurrentMedal = "بدون مدال";
                var nextMedal = await _medalRepository.GetEntityAsNoTracking()
                    .OrderBy(m => m.MinScore)
                    .FirstOrDefaultAsync();

                if (nextMedal != null)
                {
                    var remainingScore = nextMedal.MinScore - userScore.TotalScoreAmount;
                    userScore.RemainingScoreText = $"{userScore.FirstName} عزیز، شما به {remainingScore} امتیاز برای ورود به سطح {nextMedal.Description} نیاز دارید.";
                }
            }

            return new OperationResult<UserProfileViewModel>(true, userScore, "اطلاعات کاربر");
        }

        public async Task<OperationResult<List<string>>> GetAccessListByUserId(int userId)
        {
            var admins = await _adminRepository.GetEntityAsNoTracking()
                .Where(a => a.IsActive && !a.IsDeleted && a.UserId == userId).ToListAsync();

            var result = admins.Select(a => a.Kind).ToList();


            //var result = _mapper.Map<List<AdminViewModel>>(admins);

            return new OperationResult<List<string>>(true, result, "Get All Admins");
        }
        public async Task<OperationResult<List<UserProfileViewModel>>> GetProfileDataForAllUsers()
        {
            var usersQuery = _userRepository.GetEntityAsNoTracking()
                .Where(u => u.IsActive && !u.IsDeleted)
                .AsQueryable();

            var userScores = (
                    from user in usersQuery
                    join score in _userScoreRepository.GetEntityAsNoTracking() on user.Id equals score.UserId into scoreGroup
                    from score in scoreGroup.DefaultIfEmpty()
                    group score by user into userGroup
                    select new UserProfileViewModel
                    {
                        UserId = userGroup.Key.Id,
                        FullName = userGroup.Key.FullName,
                        UserName = userGroup.Key.UserName,
                        TotalScoreAmount = userGroup.Sum(s => s != null ? s.ScoreAmount : 0)
                    })
                .OrderByDescending(u => u.TotalScoreAmount)
                .ThenBy(u => u.UserId)
                .ToList();


            var medals = await _medalRepository.GetEntityAsNoTracking().ToListAsync();


            foreach (var userScore in userScores)
            {
                var userMedal = medals.FirstOrDefault(m => m.MinScore <= userScore.TotalScoreAmount && userScore.TotalScoreAmount < m.MaxScore);
                userScore.CurrentMedal = userMedal != null ? userMedal.Description : "بدون مدال";
            }

            return new OperationResult<List<UserProfileViewModel>>(true, userScores, string.Empty);
        }

        public async Task<OperationResult<List<UserProfileViewModel>>> GetTopThreeUsersByScore()
        {
            var usersQuery = _userRepository.GetEntityAsNoTracking()
                .Where(u => u.IsActive && !u.IsDeleted)
                .AsQueryable();

            var topThreeUserScores = (
                    from user in usersQuery
                    join score in _userScoreRepository.GetEntityAsNoTracking() on user.Id equals score.UserId into scoreGroup
                    from score in scoreGroup.DefaultIfEmpty()
                    group score by user into userGroup
                    select new UserProfileViewModel
                    {
                        UserId = userGroup.Key.Id,
                        FullName = userGroup.Key.FullName,
                        UserName = userGroup.Key.UserName,
                        TotalScoreAmount = userGroup.Sum(s => s != null ? s.ScoreAmount : 0)
                    })
                .OrderByDescending(u => u.TotalScoreAmount)
                .ThenBy(u => u.UserId)
                .Take(3)
                .ToList();


            var medals = await _medalRepository.GetEntityAsNoTracking().ToListAsync();


            foreach (var userScore in topThreeUserScores)
            {
                var userMedal = medals.FirstOrDefault(m => m.MinScore <= userScore.TotalScoreAmount && userScore.TotalScoreAmount < m.MaxScore);
                userScore.CurrentMedal = userMedal != null ? userMedal.Description : "بدون مدال";
            }

            return new OperationResult<List<UserProfileViewModel>>(true, topThreeUserScores, string.Empty);
        }


        //    public async Task<OperationResult<List<Top50ContentsViewModel>>> GetTop50Contents()
        //    {
        //        // 1) گرفتن Top 50 برای هر EntityType از روی PageViews

        //        var allowedEntityTypes = new[]
        //        {
        //    "Question",
        //    "KnowledgeContent",
        //    "Comment",
        //    "Proposal",
        //    "Project"
        //};

        //        var pageViewsQuery = _pageViewRepository.GetEntityAsNoTracking()
        //            .Where(p => p.IsActive && !p.IsDeleted && allowedEntityTypes.Contains(p.EntityType))
        //            .AsQueryable();

        //        var grouped = await (
        //            from pv in pageViewsQuery
        //            group pv by new { pv.EntityType, pv.EntityId } into g
        //            select new
        //            {
        //                EntityType = g.Key.EntityType,   // string
        //                g.Key.EntityId,
        //                PageViewCount = g.Count()
        //            }
        //        ).ToListAsync();

        //        var top50PerType = grouped
        //            .GroupBy(x => x.EntityType)
        //            .SelectMany(g => g
        //                .OrderByDescending(x => x.PageViewCount)
        //                .ThenBy(x => x.EntityId)
        //                .Take(50))
        //            .Select(x => new Top50ContentsViewModel
        //            {
        //                EntityId = x.EntityId,
        //                EntityType = Enum.Parse<VisitPageEntityEnum>(x.EntityType),
        //                PageViewCount = x.PageViewCount,
        //                Title = string.Empty,
        //                CreatedDate = default,
        //                LikeCount = 0,
        //                CommentCount = 0,
        //                IsLiked = null,
        //                IsConfirm = null,
        //                User = null,
        //                Attachments = new List<AttachmentViewModel>(),
        //                Tags = new List<TagsViewModel>()
        //            })
        //            .ToList();

        //        // 2) پر کردن Title و CreatedDate برای Question

        //        var questionIds = top50PerType
        //            .Where(x => x.EntityType == VisitPageEntityEnum.Question)
        //            .Select(x => x.EntityId)
        //            .Distinct()
        //            .ToList();

        //        if (questionIds.Any())
        //        {
        //            var questions = await _questionRepository.GetEntityAsNoTracking()
        //                .Where(q => questionIds.Contains(q.Id))
        //                .Select(q => new
        //                {
        //                    q.Id,
        //                    q.QuestionTitle,
        //                    q.CreatedDate
        //                })
        //                .ToListAsync();

        //            var questionDict = questions.ToDictionary(q => q.Id, q => q);

        //            foreach (var item in top50PerType.Where(x => x.EntityType == VisitPageEntityEnum.Question))
        //            {
        //                if (questionDict.TryGetValue(item.EntityId, out var q))
        //                {
        //                    item.Title = q.QuestionTitle;
        //                    item.CreatedDate = q.CreatedDate;
        //                }
        //            }
        //        }

        //        // 3) پر کردن Title و CreatedDate برای KnowledgeContent

        //        var knowledgeItemsIds = top50PerType
        //            .Where(x => x.EntityType == VisitPageEntityEnum.KnowledgeContent)
        //            .Select(x => x.EntityId)
        //            .Distinct()
        //            .ToList();

        //        if (knowledgeItemsIds.Any())
        //        {
        //            var knowledgeContents = await _knowledgeContentRepository.GetEntityAsNoTracking()
        //                .Where(k => knowledgeItemsIds.Contains(k.Id))
        //                .Select(k => new
        //                {
        //                    k.Id,
        //                    k.Title,
        //                    k.CreatedDate
        //                })
        //                .ToListAsync();

        //            var knowledgeDict = knowledgeContents.ToDictionary(k => k.Id, k => k);

        //            foreach (var item in top50PerType.Where(x => x.EntityType == VisitPageEntityEnum.KnowledgeContent))
        //            {
        //                if (knowledgeDict.TryGetValue(item.EntityId, out var k))
        //                {
        //                    item.Title = k.Title;
        //                    item.CreatedDate = k.CreatedDate;
        //                }
        //            }
        //        }

        //        // 4) پر کردن Title و CreatedDate برای Proposal

        //        var proposalIds = top50PerType
        //            .Where(x => x.EntityType == VisitPageEntityEnum.Proposal)
        //            .Select(x => x.EntityId)
        //            .Distinct()
        //            .ToList();

        //        if (proposalIds.Any())
        //        {
        //            var proposals = await _proposalRepository.GetEntityAsNoTracking()
        //                .Where(p => proposalIds.Contains(p.Id))
        //                .Select(p => new
        //                {
        //                    p.Id,
        //                    p.Title,
        //                    p.CreatedDate
        //                })
        //                .ToListAsync();

        //            var proposalDict = proposals.ToDictionary(p => p.Id, p => p);

        //            foreach (var item in top50PerType.Where(x => x.EntityType == VisitPageEntityEnum.Proposal))
        //            {
        //                if (proposalDict.TryGetValue(item.EntityId, out var p))
        //                {
        //                    item.Title = p.Title;
        //                    item.CreatedDate = p.CreatedDate;
        //                }
        //            }
        //        }

        //        // 5) پر کردن Title و CreatedDate برای Project

        //        var projectIds = top50PerType
        //            .Where(x => x.EntityType == VisitPageEntityEnum.Project)
        //            .Select(x => x.EntityId)
        //            .Distinct()
        //            .ToList();

        //        if (projectIds.Any())
        //        {
        //            var projects = await _projectRepository.GetEntityAsNoTracking()
        //                .Where(p => projectIds.Contains(p.Id))
        //                .Select(p => new
        //                {
        //                    p.Id,
        //                    p.Title,
        //                    p.CreatedDate
        //                })
        //                .ToListAsync();

        //            var projectDict = projects.ToDictionary(p => p.Id, p => p);

        //            foreach (var item in top50PerType.Where(x => x.EntityType == VisitPageEntityEnum.Project))
        //            {
        //                if (projectDict.TryGetValue(item.EntityId, out var p))
        //                {
        //                    item.Title = p.Title;
        //                    item.CreatedDate = p.CreatedDate;
        //                }
        //            }
        //        }

        //        // (برای EntityType = Comment فرض کردم Title خاصی نمی‌خوای؛ اگر خواستی می‌تونیم از خودش هم پر کنیم)

        //        // 6) پر کردن LikeCount برای همه EntityType ها از روی Likes

        //        var likeEntityTypes = top50PerType
        //            .Select(x => x.EntityType.ToString()) // "Question", "KnowledgeContent", ...
        //            .Distinct()
        //            .ToList();

        //        var likeEntityIds = top50PerType
        //            .Select(x => x.EntityId)
        //            .Distinct()
        //            .ToList();

        //        var likes = await _likeRepository.GetEntityAsNoTracking()
        //            .Where(s => s.IsActive && !s.IsDeleted
        //                        && likeEntityTypes.Contains(s.EntityType)
        //                        && likeEntityIds.Contains(s.EntityId))
        //            .ToListAsync();

        //        var likeDict = likes
        //            .GroupBy(s => new { s.EntityType, s.EntityId })
        //            .ToDictionary(
        //                g => new { g.Key.EntityType, g.Key.EntityId },
        //                g => g.Count()
        //            );

        //        foreach (var item in top50PerType)
        //        {
        //            var key = new { EntityType = item.EntityType.ToString(), EntityId = item.EntityId };

        //            if (likeDict.TryGetValue(key, out var likeCount))
        //                item.LikeCount = likeCount;
        //            else
        //                item.LikeCount = 0;
        //        }

        //        // 7) پر کردن CommentCount برای Question (از Answer)

        //        var questionIdsForAnswers = top50PerType
        //            .Where(x => x.EntityType == VisitPageEntityEnum.Question)
        //            .Select(x => x.EntityId)
        //            .Distinct()
        //            .ToList();

        //        if (questionIdsForAnswers.Any())
        //        {
        //            var answers = await _answerRepository.GetEntityAsNoTracking()
        //                .Where(a => questionIdsForAnswers.Contains(a.QuestionId)
        //                            && a.IsActive && !a.IsDeleted)
        //                .ToListAsync();

        //            var answerDict = answers
        //                .GroupBy(a => a.QuestionId)
        //                .ToDictionary(
        //                    g => g.Key,
        //                    g => g.Count()
        //                );

        //            foreach (var item in top50PerType.Where(x => x.EntityType == VisitPageEntityEnum.Question))
        //            {
        //                if (answerDict.TryGetValue(item.EntityId, out var count))
        //                    item.CommentCount = count;
        //                else
        //                    item.CommentCount = 0;
        //            }
        //        }

        //        // 8) پر کردن CommentCount برای KnowledgeContent (از Comment)

        //        var knowledgeCommentIds = top50PerType
        //            .Where(x => x.EntityType == VisitPageEntityEnum.KnowledgeContent)
        //            .Select(x => x.EntityId)
        //            .Distinct()
        //            .ToList();

        //        if (knowledgeCommentIds.Any())
        //        {
        //            var comments = await _commentRepository.GetEntityAsNoTracking()
        //                .Where(c => knowledgeCommentIds.Contains(c.KnowledgeContentId)
        //                            && c.IsActive && !c.IsDeleted)
        //                .ToListAsync();

        //            var commentDict = comments
        //                .GroupBy(c => c.KnowledgeContentId)
        //                .ToDictionary(
        //                    g => g.Key,
        //                    g => g.Count()
        //                );

        //            foreach (var item in top50PerType.Where(x => x.EntityType == VisitPageEntityEnum.KnowledgeContent))
        //            {
        //                if (commentDict.TryGetValue(item.EntityId, out var count))
        //                    item.CommentCount = count;
        //                else
        //                    item.CommentCount = 0;
        //            }
        //        }

        //        // 9) پر کردن CommentCount برای Proposal (از ProposalComment)

        //        var proposalCommentIds = top50PerType
        //            .Where(x => x.EntityType == VisitPageEntityEnum.Proposal)
        //            .Select(x => x.EntityId)
        //            .Distinct()
        //            .ToList();

        //        if (proposalCommentIds.Any())
        //        {
        //            var proposalComments = await _proposalCommentRepository.GetEntityAsNoTracking()
        //                .Where(pc => proposalCommentIds.Contains(pc.ProposalId)
        //                             && pc.IsActive && !pc.IsDeleted)
        //                .ToListAsync();

        //            var proposalCommentDict = proposalComments
        //                .GroupBy(pc => pc.ProposalId)
        //                .ToDictionary(
        //                    g => g.Key,
        //                    g => g.Count()
        //                );

        //            foreach (var item in top50PerType.Where(x => x.EntityType == VisitPageEntityEnum.Proposal))
        //            {
        //                if (proposalCommentDict.TryGetValue(item.EntityId, out var count))
        //                    item.CommentCount = count;
        //                else
        //                    item.CommentCount = 0;
        //            }
        //        }

        //        // 10) پر کردن CommentCount برای Project (از ProjectComment)

        //        var projectCommentIds = top50PerType
        //            .Where(x => x.EntityType == VisitPageEntityEnum.Project)
        //            .Select(x => x.EntityId)
        //            .Distinct()
        //            .ToList();

        //        if (projectCommentIds.Any())
        //        {
        //            var projectComments = await _projectCommentRepository.GetEntityAsNoTracking()
        //                .Where(pc => projectCommentIds.Contains(pc.ProjectId)
        //                             && pc.IsActive && !pc.IsDeleted)
        //                .ToListAsync();

        //            var projectCommentDict = projectComments
        //                .GroupBy(pc => pc.ProjectId)
        //                .ToDictionary(
        //                    g => g.Key,
        //                    g => g.Count()
        //                );

        //            foreach (var item in top50PerType.Where(x => x.EntityType == VisitPageEntityEnum.Project))
        //            {
        //                if (projectCommentDict.TryGetValue(item.EntityId, out var count))
        //                    item.CommentCount = count;
        //                else
        //                    item.CommentCount = 0;
        //            }
        //        }

        //        // 11) مرتب‌سازی نهایی بر اساس PageViewCount

        //        top50PerType = top50PerType
        //            .OrderByDescending(x => x.PageViewCount)
        //            .ThenBy(x => x.EntityType)
        //            .ThenBy(x => x.EntityId)
        //            .ToList();

        //        return new OperationResult<List<Top50ContentsViewModel>>(true, top50PerType, string.Empty);
        //    }


        public async Task<OperationResult<List<Top50ContentsViewModel>>> GetTop50Contents()
        {
            var currentUserId = _accountService.GetUserId();
            const string sql = @"
;WITH PvAgg AS (
    SELECT
        pv.EntityType,
        pv.EntityId,
        COUNT(1) AS PageViewCount
    FROM PageViews pv
    WHERE pv.IsActive = 1 AND pv.IsDeleted = 0
      AND pv.EntityType IN ('Question','KnowledgeContent','Comment','Proposal','Project')
    GROUP BY pv.EntityType, pv.EntityId
),
TopPerType AS (
    SELECT
        a.*,
        ROW_NUMBER() OVER (PARTITION BY a.EntityType ORDER BY a.PageViewCount DESC, a.EntityId) AS rn
    FROM PvAgg a
),
Top50 AS (
    SELECT EntityType, EntityId, PageViewCount
    FROM TopPerType
    WHERE rn <= 50
),
ContentUnion AS (
    SELECT
        'Question' AS EntityType,
        q.Id AS EntityId,
        q.QuestionTitle AS Title,
        CAST(q.QuestionText AS nvarchar(max)) AS [Text],
        q.CreatedDate,
        q.UserId
    FROM Questions q
    WHERE q.IsActive = 1 AND q.IsDeleted = 0

    UNION ALL

    SELECT
        'KnowledgeContent',
        k.Id,
        k.Title,
        CAST(k.Abstract AS nvarchar(max)) AS [Text],
        k.CreatedDate,
        k.UserId
    FROM KnowledgeContents k
    WHERE k.IsActive = 1 AND k.IsDeleted = 0

    UNION ALL

    SELECT
        'Proposal',
        p.Id,
        p.Title,
        CAST(p.Abstract AS nvarchar(max)) AS [Text],
        p.CreatedDate,
        p.UserId
    FROM Proposals p
    WHERE p.IsActive = 1 AND p.IsDeleted = 0

    UNION ALL

    SELECT
        'Project',
        pr.Id,
        pr.Title,
        CAST(pr.Abstract AS nvarchar(max)) AS [Text],
        pr.CreatedDate,
        pr.UserId
    FROM Projects pr
    WHERE pr.IsActive = 1 AND pr.IsDeleted = 0
),
LikesAgg AS (
    SELECT l.EntityType, l.EntityId, COUNT(1) AS LikeCount
    FROM Likes l
    WHERE l.IsActive = 1 AND l.IsDeleted = 0
    GROUP BY l.EntityType, l.EntityId
),
CommentAgg AS (
    SELECT 'Question' AS EntityType, a.QuestionId AS EntityId, COUNT(1) AS CommentCount
    FROM Answers a
    WHERE a.IsActive = 1 AND a.IsDeleted = 0
    GROUP BY a.QuestionId

    UNION ALL
    SELECT 'KnowledgeContent', c.KnowledgeContentId, COUNT(1)
    FROM Comments c
    WHERE c.IsActive = 1 AND c.IsDeleted = 0
    GROUP BY c.KnowledgeContentId

    UNION ALL
    SELECT 'Proposal', pc.ProposalId, COUNT(1)
    FROM ProposalComments pc
    WHERE pc.IsActive = 1 AND pc.IsDeleted = 0
    GROUP BY pc.ProposalId

    UNION ALL
    SELECT 'Project', prc.ProjectId, COUNT(1)
    FROM ProjectComments prc
    WHERE prc.IsActive = 1 AND prc.IsDeleted = 0
    GROUP BY prc.ProjectId
)
SELECT
    t.EntityType,
    t.EntityId,
    t.PageViewCount,

    ISNULL(cu.Title, '') AS Title,
    CASE
    WHEN cu.[Text] IS NULL THEN ''
    WHEN LEN(cu.[Text]) > 200 THEN LEFT(cu.[Text], 200) + '...'
    ELSE cu.[Text]
END AS [Text],

    ISNULL(cu.CreatedDate, '1900-01-01') AS CreatedDate,

    ISNULL(la.LikeCount, 0) AS LikeCount,
    ISNULL(ca.CommentCount, 0) AS CommentCount,

    cu.UserId AS UserId,
    u.FullName AS FullName,
CASE 
    WHEN EXISTS (
        SELECT 1
        FROM Likes l2
        WHERE l2.IsActive = 1 
          AND l2.IsDeleted = 0
          AND l2.UserId = @CurrentUserId
          AND l2.EntityType = t.EntityType
          AND l2.EntityId = t.EntityId
    )
    THEN CAST(1 AS bit)
    ELSE CAST(0 AS bit)
END AS IsLiked

FROM Top50 t
LEFT JOIN ContentUnion cu
    ON cu.EntityType = t.EntityType AND cu.EntityId = t.EntityId
LEFT JOIN Users u
    ON u.Id = cu.UserId
LEFT JOIN LikesAgg la
    ON la.EntityType = t.EntityType AND la.EntityId = t.EntityId
LEFT JOIN CommentAgg ca
    ON ca.EntityType = t.EntityType AND ca.EntityId = t.EntityId
ORDER BY t.PageViewCount DESC, t.EntityType, t.EntityId;
";

            var rows = await _dbContext.Set<Top50ContentsSqlRow>()
                .FromSqlRaw(
                    sql,
                    new SqlParameter("@CurrentUserId", currentUserId)
                )
                .AsNoTracking()
                .ToListAsync();


            var result = rows.Select(r => new Top50ContentsViewModel
            {
                EntityId = r.EntityId,
                EntityType = Enum.Parse<VisitPageEntityEnum>(r.EntityType),
                PageViewCount = r.PageViewCount,
                Title = r.Title,
                Text = r.Text ?? "",               
                CreatedDate = r.CreatedDate,
                LikeCount = r.LikeCount,
                CommentCount = r.CommentCount,

               User = r.UserId == null ? null : new UserViewModel
                {
                    Id = r.UserId.Value,
                    FullName = r.FullName 
                },

                IsLiked = r.IsLiked,

                IsConfirm = null,
                Attachments = new List<AttachmentViewModel>(),
                Tags = new List<TagsViewModel>()
            }).ToList();

            return new OperationResult<List<Top50ContentsViewModel>>(true, result, string.Empty);
        }



        public Medals? GetMedalForScore(decimal score)
        {
            var medal = _medalRepository
                .GetEntityAsNoTracking()
                .FirstOrDefault(m => score >= m.MinScore && score <= m.MaxScore);

            return medal;
        }
        #endregion
    }
}
