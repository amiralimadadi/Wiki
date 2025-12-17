using System.Runtime.CompilerServices;
using AutoMapper;
using Common.Extensions;
using Common.File;
using Common.OperationResult;
using Kms.Application.Services.Account;
using Kms.Application.ViewModels;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.ProjectAndProposal;
using Kms.Domain.Entities.QuestionAndAnswer;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Common.Paging;
using Kms.DataLayer.Repositories;
using Common.Mentions;
using Kms.Application.Senders;
using Kms.Application.Services.Gamifications;
using Kms.Application.Services.Units;
using Kms.Domain.Entities.KnowledgeContentGroup;

namespace Kms.Application.Services.ProjectAndProposal
{
    public class ProjectAndProposalService : IProjectAndProposalService
    {
        private readonly IAdminRepository _adminRepository;
        private readonly IAccountService _accountService;
        private readonly IProposalCommentRepository _proposalCommentRepository;
        private readonly IProjectCommentRepository _projectCommentRepository;
        private readonly IGoalRepository _goalRepository;
        private readonly ILikeRepository _likeRepository;
        private readonly IUnitRepository _unitRepository;
        private readonly IPageViewRepository _pageViewRepository;
        private readonly IUnitService _unitService;
        private readonly ITagRepository _tagRepository;
        private readonly IProjectAndProposalAttachmentRepository _projectAndProposalAttachmentRepository;
        private readonly IProjectAndProposalTagRepository _projectAndProposalTagRepository;
        private readonly IProposalRepository _proposalRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly IProjectAndProposalGeneratorRepository _projectAndProposalGeneratorRepository;
        private readonly IViewersRepository _viewersRepository;
        private readonly IUserRepository _userRepository;
        private readonly IGamificationService _gamificationService;
        private readonly INotificationSender _notificationSender;
		private readonly FileSettings _fileSettings;
        private readonly IMapper _mapper;
        private readonly PagingOptions _pagingOptions;

        #region Constructor 

        public ProjectAndProposalService(IAdminRepository adminRepository,
            IGoalRepository goalRepository,
            IProposalCommentRepository proposalCommentRepository,
            IProjectCommentRepository projectCommentRepository,
            IAccountService accountService,
            IProjectRepository projectRepository,
            ILikeRepository likeRepository,
            IPageViewRepository pageViewRepository,
            IUnitService unitService,
            IUnitRepository unitRepository,
            ITagRepository tagRepository,
            IProjectAndProposalAttachmentRepository projectAndProposalAttachmentRepository,
            IProjectAndProposalTagRepository projectAndProposalTagRepository,
            IProposalRepository proposalRepository,
            IProjectAndProposalGeneratorRepository projectAndProposalGeneratorRepository,
            IViewersRepository viewersRepository,
            IUserRepository userRepository,
            IGamificationService gamificationService,
			INotificationSender notificationSender,
			IOptions<FileSettings> fileSettings,
            IOptions<PagingOptions> pagingOptions,
            IMapper mapper)
        {
            _adminRepository = adminRepository;
            _goalRepository = goalRepository;
            _proposalCommentRepository = proposalCommentRepository;
            _projectCommentRepository = projectCommentRepository;
            _unitService = unitService;
            _likeRepository = likeRepository;
            _pageViewRepository = pageViewRepository;
            _projectRepository = projectRepository;
            _unitRepository = unitRepository;
            _tagRepository = tagRepository;
            _accountService = accountService;
            _projectAndProposalAttachmentRepository = projectAndProposalAttachmentRepository;
            _projectAndProposalTagRepository = projectAndProposalTagRepository;
            _proposalRepository = proposalRepository;
            _projectAndProposalGeneratorRepository = projectAndProposalGeneratorRepository;
            _viewersRepository = viewersRepository;
            _userRepository = userRepository;
            _gamificationService = gamificationService;
            _notificationSender = notificationSender;
            _fileSettings = fileSettings.Value;
            _pagingOptions = pagingOptions.Value;
            _mapper = mapper;
        }

        #endregion

        #region private Methods
        private bool ValidateProposal(Proposal proposal,
            out Proposal finalProposal,
            out List<ModelError> modelErrors, List<string> tags,
            List<IFormFile> file)
        {
            modelErrors = new List<ModelError>();
            finalProposal = proposal;

            _proposalRepository.EntityValidation(finalProposal, out List<ModelError> errors);
            var goal = _goalRepository.GetById(proposal.GoalId);
            if (goal == null)
                errors.Add(new ModelError("Goal", "Goal is required"));

            if (string.IsNullOrWhiteSpace(proposal.Title))
                errors.Add(new ModelError(nameof(proposal.Title), "عنوان اجباری است"));
            if (!string.IsNullOrWhiteSpace(proposal.Abstract))
            {
                var wordCount = proposal.Abstract.Split(new[] { ' ', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries).Length;
                if (wordCount < 15)
                {
                    errors.Add(new ModelError(nameof(proposal.Abstract), "چکیده باید حداقل 15 کلمه داشته باشد."));
                }
            }
            if (!tags.Any())
                errors.Add(new ModelError(nameof(tags), "کلمات کلیدی اجباری است"));
            if (errors.Any())
            {
                modelErrors = errors;
                return false;
            }
            return true;
        }

        private bool ValidateProject(Project project,
            out Project finalProject,
            out List<ModelError> modelErrors, List<string> tags,
            List<IFormFile> file)
        {
            modelErrors = new List<ModelError>();
            finalProject = project;

            _projectRepository.EntityValidation(finalProject, out List<ModelError> errors);
            var goal = _goalRepository.GetById(project.GoalId);
            if (goal == null)
                errors.Add(new ModelError("Goal", "Goal is required"));

            if (string.IsNullOrWhiteSpace(project.Title))
                errors.Add(new ModelError(nameof(project.Title), "عنوان اجباری است"));
            if (!string.IsNullOrWhiteSpace(project.Abstract))
            {
                var wordCount = project.Abstract.Split(new[] { ' ', '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries).Length;
                if (wordCount < 15)
                {
                    errors.Add(new ModelError(nameof(project.Abstract), "چکیده باید حداقل 15 کلمه داشته باشد."));
                }
            }
            if (!tags.Any())
                errors.Add(new ModelError(nameof(tags), "کلمات کلیدی اجباری است"));
            if (errors.Any())
            {
                modelErrors = errors;
                return false;
            }
            return true;
        }

        private bool ValidateProposalComment(ProposalComment comment, out ProposalComment finalComment, out List<ModelError> modelErrors)
        {
            modelErrors = new List<ModelError>();
            finalComment = comment;

            _proposalCommentRepository.EntityValidation(finalComment, out List<ModelError> errors);

            if (_proposalRepository.GetById(comment!.ProposalId) == null)
            {
                errors.Add(new ModelError(nameof(comment.ProposalId), "طرح به درستی انتخاب نشده است"));
            }
            if (_userRepository.GetById(comment!.UserId) == null)
            {
                errors.Add(new ModelError(nameof(comment.UserId), "کاربر ثبت کننده به درستی انتخاب نشده است"));
            }
            if (string.IsNullOrWhiteSpace(comment.CommentText))
            {
                errors.Add(new ModelError(nameof(comment.CommentText), "متن  اجباری است"));
            }

            if (errors.Any())
            {
                modelErrors = errors;
                return false;
            }
            return true;
        }
        private bool ValidateProjectComment(ProjectComment comment, out ProjectComment finalComment, out List<ModelError> modelErrors)
        {
            modelErrors = new List<ModelError>();
            finalComment = comment;

            _projectCommentRepository.EntityValidation(finalComment, out List<ModelError> errors);

            if (_projectRepository.GetById(comment!.ProjectId) == null)
            {
                errors.Add(new ModelError(nameof(comment.ProjectId), "طرح به درستی انتخاب نشده است"));
            }
            if (_userRepository.GetById(comment!.UserId) == null)
            {
                errors.Add(new ModelError(nameof(comment.UserId), "کاربر ثبت کننده به درستی انتخاب نشده است"));
            }
            if (string.IsNullOrWhiteSpace(comment.CommentText))
            {
                errors.Add(new ModelError(nameof(comment.CommentText), "متن  اجباری است"));
            }

            if (errors.Any())
            {
                modelErrors = errors;
                return false;
            }
            return true;
        }

        #endregion

        #region Generator And Viewer

        public async Task<OperationResult<GeneratorViewModel>> AddUserToGenerator(CreateGeneratorViewModel model)
        {
            var errors = new List<ModelError>();
            var userId = _accountService.GetUserId();
            var myUser = await _userRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            var fullName = myUser?.FullName;
            var kindString = model.Kind.ToString();

            var generatorViewModels = new List<UserViewerViewModel>();

            foreach (var user in model.UserId ?? new List<int>())
            {

                var existingGenerator = await _projectAndProposalGeneratorRepository.GetEntityAsNoTracking()
                    .FirstOrDefaultAsync(g => g.UserId == user && g.Kind == kindString);
                if (existingGenerator != null)
                {
                    errors.Add(new ModelError("Duplicate", $"کاربر با شناسه {user} با نوع {kindString} قبلاً در سیستم ثبت شده است."));
                    continue;
                }

                var existingAdmin = await _adminRepository.GetEntityAsNoTracking()
                    .FirstOrDefaultAsync(a => a.UserId == userId && a.Kind == kindString);
                if (existingAdmin == null)
                {
                    return new OperationResult<GeneratorViewModel>(false, null, $"کاربر {fullName} ادمین {kindString} نمی باشد.");
                }

                var dbUser = await _userRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(u => u.Id == user);
                if (dbUser == null)
                {
                    await _accountService.InsertNewUser(user);
                }

                var newGenerator = new ProjectAndProposalGenerator()
                {
                    UserId = user,
                    Kind = kindString,
                };

                await _projectAndProposalGeneratorRepository.AddAsync(newGenerator, true);

                var userViewer = new UserViewerViewModel
                {
                    UserId = user,
                    FullName = dbUser?.FullName,

                };

                generatorViewModels.Add(userViewer);
            }

            if (generatorViewModels.Count == 0)
            {
                return new OperationResult<GeneratorViewModel>(false, null, "هیچ رکوردی به درستی اضافه نشد.", errors);
            }

            var resultViewModel = new GeneratorViewModel
            {
                UserViewer = generatorViewModels,
                Kind = kindString
            };

            return new OperationResult<GeneratorViewModel>(true, resultViewModel, "کاربران مورد نظر با موفقیت  اضافه شدند.");
        }

        public async Task<OperationResult<List<GeneratorViewModel>>> GetUsersGenerator()
        {
            var data = await _projectAndProposalGeneratorRepository.GetEntityAsNoTracking()
                .Where(a => a.IsActive && !a.IsDeleted)
                .Include(a => a.User)
                .Select(a => new
                {
                    a.Id,
                    a.Kind,
                    a.UserId,
                    FullName = a.User.FullName
                })
                .ToListAsync();

            var result = data.Select(a =>
            {
                string kindDisplay = AdminKind.Project.GetDisplayName(); // default

                if (Enum.TryParse<AdminKind>(a.Kind, true, out var kindEnum))
                {
                    kindDisplay = kindEnum.GetDisplayName();
                }

                return new GeneratorViewModel
                {
                    Id = a.Id,
                    Kind = kindDisplay,
                    UserViewer = new List<UserViewerViewModel>
                    {
                        new UserViewerViewModel
                        {
                            UserId = a.UserId,
                            FullName = a.FullName
                        }
                    }
                };
            }).ToList();

            return new OperationResult<List<GeneratorViewModel>>(true, result, "لیست افرادی که قابلیت ثبت دارند");
        }

        public async Task<OperationResult<GeneratorViewModel>> DeleteUsersGeneratorById(int id)
        {
            try
            {
                // پیدا کردن رکورد بر اساس Id یا UserId
                var entity = await _projectAndProposalGeneratorRepository.GetEntity()
                    .FirstOrDefaultAsync(g => g.Id == id );

                if (entity == null)
                {
                    return new OperationResult<GeneratorViewModel>(
                        false,
                        null,
                        "رکوردی برای حذف یافت نشد."
                    );
                }

                // حذف واقعی از دیتابیس
                await _projectAndProposalGeneratorRepository.DeleteAsync(entity, hardDelete: true, saveNow: true);

        

                return new OperationResult<GeneratorViewModel>(
                    true,
                    null,
                    "کاربر با موفقیت حذف شد."
                );
            }
            catch (Exception)
            {
                return new OperationResult<GeneratorViewModel>(
                    false,
                    null,
                    "خطا در حذف کاربر."
                );
            }
        }

        public async Task<OperationResult<ViewerViewModel>> ConfirmProposal(CreateViewerViewModel model)
        {
            //  var tempViewer = _mapper.Map<Viewers>(model);
            var errors = new List<ModelError>();

            var userId = _accountService.GetUserId();


           

            var proposal = await _proposalRepository.GetEntityAsNoTracking(false)
                .FirstOrDefaultAsync(s => s.Id == model.EntityId);

            if (proposal == null)
            {
                errors.Add(new ModelError("EntityIdNotFound", "طرحی با این شناسه وجود ندارد."));
                return new OperationResult<ViewerViewModel>(false, null, "طرحی با این شناسه یافت نشد.", errors);
            }

            var existingAdmin = await _adminRepository.GetEntityAsNoTracking()
                .FirstOrDefaultAsync(a => a.UserId == userId && a.Kind == "Proposal");



            if (existingAdmin == null)
            {
                return new OperationResult<ViewerViewModel>(false, null, "ادمینی با این مشخصات یافت نشد.");
            }

            if (model.UserId == null && model.UnitId == null)
            {
                errors.Add(new ModelError("InputError", "لیست کاربران و واحدها نمی‌تواند هر دو خالی باشد."));
                return new OperationResult<ViewerViewModel>(false, null, "ورودی نادرست است.", errors);
            }

            // ثبت کاربران جدید
            var registeredUserIds = new List<int>();
            if (model.UserId != null)
            {
                var existingUsers = await _userRepository.GetEntityAsNoTracking()
                    .Where(u => model.UserId.Contains(u.Id))
                    .Select(u => u.Id)
                    .ToListAsync();


                var newUserIds = model.UserId.Except(existingUsers).ToList();

                if (newUserIds.Any())
                {
                   await _accountService.InsertNewUsers(newUserIds);
                }

                foreach (var user in model.UserId)
                {

                    var existingViewer = await _viewersRepository.GetEntityAsNoTracking()
                        .FirstOrDefaultAsync(v => v.UserId == user &&
                                                  v.EntityId == model.EntityId && v.Kind == "Proposal");

                    if (existingViewer != null)
                    {
                        errors.Add(new ModelError("Duplicate", $"کاربر با شناسه {userId} قبلاً برای این نوع ثبت شده است."));
                        continue;
                    }

                    var newUserViewer = new Viewers
                    {
                        UserId = user,
                        EntityId = model.EntityId,
                        Kind = "Proposal"
                    };

                    await _viewersRepository.AddAsync(newUserViewer, true);
                    registeredUserIds.Add(user);
                }
            }

            // ثبت واحدها
            var registeredUnitIds = new List<int>();
            if (model.UnitId != null)
            {
	            var units = _unitRepository.GetEntityAsNoTracking().Where(a => model.UnitId.Contains(a.Id));

				foreach (var unitId in model.UnitId)
                {
                    var unit = await units.FirstOrDefaultAsync(u => u.Id == unitId);
                    
                    var existingViewer = await _viewersRepository.GetEntityAsNoTracking()
                        .FirstOrDefaultAsync(v => unit != null &&
                                                  v.UnitId == unit.IgtDepartmentId &&
                                                  v.EntityId == model.EntityId && v.Kind == "Proposal");

                    if (existingViewer != null)
                    {
                        //errors.Add(new ModelError("Duplicate", $"واحد با شناسه {unit.UnitName} قبلاً برای این نوع ثبت شده است."));
                        continue;
                    }
                    var newUnitViewer = new Viewers
                    {
                        UnitId = unit?.IgtDepartmentId,
                        EntityId = model.EntityId,
                        Kind = "Proposal"
                    };
                    await _viewersRepository.AddAsync(newUnitViewer, true);
                    registeredUnitIds.Add(unitId);
                }
            }

            //var proposal = await _proposalRepository.GetEntityAsNoTracking(false).FirstOrDefaultAsync(s => s.Id == model.EntityId);
            if (proposal != null)
            {
                proposal.IsActive = true;
                if (model.GoalId != null)
                {
                    proposal.GoalId = (int)model.GoalId;
                }
                if (!string.IsNullOrEmpty(model.Title))
                {
                    proposal.Title = model.Title;
                }
                if (!string.IsNullOrEmpty(model.Abstract))
                {
                    proposal.Abstract = model.Abstract;
                }
                if (!string.IsNullOrEmpty(model.IdeaCode))
                {
                    proposal.IdeaCode = model.IdeaCode;
                }
                await _proposalRepository.UpdateAsync(proposal, true);
            }

            var viewerViewModel = new ViewerViewModel
            {
                UserViewer = registeredUserIds.Select(id => new UserViewerViewModel
                {
                    UserId = id,
                    FullName = _userRepository.GetEntityAsNoTracking().FirstOrDefault(u => u.Id == id)?.FullName
                }).ToList(),

                UnitViewer = registeredUnitIds.Select(unitId => new UnitViewModel
                {
                    ID = unitId,
                    UnitName = _unitRepository.GetEntityAsNoTracking().FirstOrDefault(u => u.IgtDepartmentId == unitId)?.UnitName
                }).ToList(),

                Kind = "طرح"

            };

            var isAdminCreator = proposal.UserId == existingAdmin.UserId;


            if (isAdminCreator)
            {
                await _gamificationService.CalculateScores(new CalculateScoreViewModel()
                {
                    Entity = proposal,
                    ActionName = ActionNameGamificationEnum.Admin,
                    GroupName = GroupNameGamificationEnum.Proposal

                }, true, true);
            }
            else
            {
                var gamificationData = new CalculateScoreViewModel()
                {
                    GroupName = GroupNameGamificationEnum.Proposal,
                    ActionName = ActionNameGamificationEnum.Confirm,
                    Entity = proposal
                };
                var scores = await _gamificationService.CalculateScores(gamificationData);

            }

            return new OperationResult<ViewerViewModel>(true, viewerViewModel, " با موفقیت ثبت شد");

        }

        public async Task<OperationResult<ViewerViewModel>> GetUsersViewer(int entityId)
        {
            var errors = new List<ModelError>();


            var viewers = await _viewersRepository.GetEntityAsNoTracking()
                .Where(v => v.EntityId == entityId && v.Kind == "Proposal")
                .ToListAsync();


            var userIds = viewers.Where(v => v.UserId.HasValue).Select(v => v.UserId.Value).ToList();
            var users = await _userRepository.GetEntityAsNoTracking()
                .Where(u => userIds.Contains(u.Id))
                .ToListAsync();


            var unitIds = viewers.Where(v => v.UnitId.HasValue).Select(v => v.UnitId.Value).ToList();
            var units = await _unitRepository.GetEntityAsNoTracking()
                .Where(u => unitIds.Contains(u.Id))
                .ToListAsync();


            var userViewers = users.Select(u => new UserViewerViewModel
            {
                UserId = u.Id,
                FullName = u.FullName
            }).ToList();


            var unitViewers = units.Select(u => new UnitViewModel
            {
                ID = u.Id,
                UnitName = u.UnitName
            }).ToList();


            var viewerViewModel = new ViewerViewModel
            {
                UserViewer = userViewers,
                UnitViewer = unitViewers,
                Kind = "Proposal"
            };

            return new OperationResult<ViewerViewModel>(true, viewerViewModel, "با موفقیت انجام شد");

        }

        #endregion

        #region Proposal

        public async Task<List<AttachmentViewModel>> GetAttachmentForProposalOrProject(string entityNAme, int entityId)
        {
            var attachments =await  _projectAndProposalAttachmentRepository.GetEntityAsNoTracking(true)
                .Where(p => p.EntityName == entityNAme && p.EntityId == entityId).ToListAsync();
            return attachments.Select(a => new AttachmentViewModel
            {
                Id = a.Id,
               Address = a.Address,
               Name = a.Name
            }).ToList();

        }

        public async Task<OperationResult<List<ProposalViewModel>>> GetProposalsForAdminConfirm()
        {
            var userId = _accountService.GetUserId();

            var existingAdmin = await _adminRepository.GetEntityAsNoTracking()
                .FirstOrDefaultAsync(a => a.UserId == userId && a.Kind == "Proposal");

            
            if (existingAdmin == null)
            {
                return new OperationResult<List<ProposalViewModel>>(true, new List<ProposalViewModel>(), "مدیر یافت نشد، لیست خالی است.");
            }
          
            var result = await _proposalRepository.GetEntityAsNoTracking(false)
                .Where(p =>  !p.IsActive)
                
                .Select(p => new ProposalViewModel
                {
                    Id = p.Id,
                    Title = p.Title,
                    Abstract = p.Abstract,
                    Code = p.Code,
                    GoalId = p.GoalId,
                    GoalTitle = p.Goal.GoalTitle,
                    IdeaCode = p.IdeaCode,
                    CreatedDate = p.CreatedDate,
                    User = new UserViewModel()
                    {
                        FullName = p.User.FullName,
                        Id = p.User.Id,
                    },
                    Attachments = new List<AttachmentViewModel>()
                })
                .OrderByDescending(p => p.Id).ToListAsync();
            foreach (var proposal in result)
            {
                proposal.Attachments = await GetAttachmentForProposalOrProject("Proposal", proposal.Id);
            }

            return new OperationResult<List<ProposalViewModel>>(true, result, "لیست طرح های تایید نشده");

        }
        public async Task<OperationResult<ProposalViewModel>> CreateProposal(CreateProposalViewModel proposal)
        {
            var tempProposal = _mapper.Map<Proposal>(proposal);

            var userId = _accountService.GetUserId();

            var isUserInGenerator = await _projectAndProposalGeneratorRepository
                .GetEntityAsNoTracking()
                .AnyAsync(g => g.UserId == userId && g.Kind == "Proposal");

            if (!isUserInGenerator)
            {
                return new OperationResult<ProposalViewModel>(false, null, "این کاربر امکان ثبت طرح را ندارد.");
            }

            //Validate Proposal
            if (!ValidateProposal(tempProposal, out _, out var errors, proposal.Tags, proposal.ProposalAttachments!))
            {
                return new OperationResult<ProposalViewModel>(false, null, "Proposal did not create.", errors);
            }

            // Validate Attachments
            if (proposal.ProposalAttachments != null)
            {
                var validation = await _projectAndProposalAttachmentRepository.ValidateFile(proposal.ProposalAttachments.First(), _fileSettings);
                if (validation is { IsSuccess: false, ModelErrors: not null })
                    return new OperationResult<ProposalViewModel>(false, null, "فایل نامعتبر است.",
                        validation.ModelErrors);
            }

            // tags
            var tempTags = proposal.Tags.Select(s => s.Trim().Replace("#", "")).ToList();
            var existingTags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var existingTagTitles = existingTags.Select(t => t.TagTitle).ToList();
            var newTagTitles = tempTags.Except(existingTagTitles).ToList();

            if (newTagTitles.Any())
            {
                var newTags = newTagTitles.Select(tagTitle => new Tag { TagTitle = tagTitle }).ToList();
                await _tagRepository.AddRangeAsync(newTags, true);
                existingTags.AddRange(newTags);
            }
 
            var saveProposal = new Proposal
            {
                UserId = _accountService.GetUserId(),
                GoalId = proposal.GoalId,
                Title = proposal.Title!,
                Abstract = proposal.Abstract,
                IdeaCode = proposal.IdeaCode,
                IsActive = false,
                Code = CommonExtensions.GenerateShortKey()
            };
        
            await _proposalRepository.AddAsync(saveProposal, true);

            if (proposal.ProposalAttachments != null && proposal.ProposalAttachments.Any())
            {
                await _projectAndProposalAttachmentRepository.SaveAttachments(proposal.ProposalAttachments, saveProposal.GetType().Name, saveProposal.Id, _fileSettings);
            }
            var tags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var proposalTags = tags.Select(tag => new ProjectAndProposalTag
            {
                EntityId = saveProposal.Id,
                EntityName = "Proposal",
                TagId = tag.Id,
            }).ToList();

            await _projectAndProposalTagRepository.AddRangeAsync(proposalTags, true);

            var result = new ProposalViewModel()
            {
                Id = saveProposal.Id,
                Title = saveProposal.Title,
                Abstract = saveProposal.Abstract,
            };
            var creator = _userRepository.GetById(saveProposal.UserId);
            
                var notificationStatus = _notificationSender.SendNotification(new SendNotificationDto()
                {
                    Entity = saveProposal,
                    NotificationType = NotificationTypeEnum.CreateProposal,
                    User = creator
                });

			return new OperationResult<ProposalViewModel>(true, result, "ثبت طرح با موفقیت ایجاد شد");
        }

        public async Task<OperationResult<List<ProposalViewModel>>> GetAllProposal(GetProposalTypesEnum proposalFilter, string? searchText = null, int? goalId = null, int? pageNo = null)
        {
            var userId = _accountService.GetUserId();

            #region Where

            var query = _proposalRepository.GetAllAsNoTrackAsync().AsQueryable();

            if (goalId != null)
            {
                query = query.Where(a => a.GoalId == goalId);
            }


            if (!string.IsNullOrEmpty(searchText))
            {
                query = query.Where(a => a.Abstract != null && (a.Abstract.Contains(searchText) || a.Title.Contains(searchText)));
            }


            switch (proposalFilter)
            {
                //case GetProposalTypesEnum.AllProposal:
                //    query = query.Where(a => a.IsActive);
                //    break;
                case GetProposalTypesEnum.MyProposal:
                    query = query.Where(a => a.UserId == userId);
                    break;
                case GetProposalTypesEnum.AllProposal:
                    var allowableEntityIds = await GetAllowableEntityIdInViewer(userId);
                    query = query.Where(p => allowableEntityIds.Contains(p.Id) && p.IsActive);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(proposalFilter), proposalFilter, null);
            }
            #endregion

            #region Paging and query populating

            var totalEntitiesCount = await query.CountAsync();
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore);

            query = _proposalRepository.AllAsNoTrackWithPagingAsync(paging, query)
                .Include(a => a.User);
            var tempRes = await query.ToListAsync();
            var result = _mapper.Map<List<ProposalViewModel>>(tempRes);

            #endregion

            #region Descriptions

            var tempTagRep = (from q in _projectAndProposalTagRepository.GetEntityAsNoTracking().Where(s => s.EntityName == "Proposal" && result.Select(t => t.Id).Contains(s.EntityId))
                              join t in _tagRepository.GetAllAsNoTrackAsync() on q.TagId equals t.Id
                              select new
                              {
                                  q.TagId,
                                  q.EntityId,
                                  t.TagTitle,
                                  q.CreatedUserId
                              }).ToList();

            var tempLikeRepo = _likeRepository.GetAllAsNoTrackAsync()
                .Where(s => s.EntityType == "Proposal" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();

            var tempPageViewRepo = _pageViewRepository.GetAllAsNoTrackAsync()
                .Where(s => s.EntityType == "Proposal" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();


            var tempAnsRepo = _proposalCommentRepository.GetAllAsNoTrackAsync()
                .Where(s => result.Select(t => t.Id).Contains(s.ProposalId)).ToList();

            var tempAttachmentRepo = _projectAndProposalAttachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "Proposal" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempGoalRepo = _goalRepository.GetAllAsNoTrackAsync().Where(s => result.Select(t => t.GoalId).Contains(s.Id)).ToList();

            foreach (var res in result)
            {
                if (res.User != null) res.IsCreator = res.User.Id == userId;
                res.Code = res.IsCreator ? res.Code : null;
                if (tempTagRep is { Count: > 0 })
                {
                    List<TagsViewModel> tempTagViewModels = (from t in tempTagRep.Where(a => a.EntityId == res.Id)
                                                             select new TagsViewModel
                                                             {
                                                                 TagTitle = t.TagTitle,
                                                                 CreatedUserId = t.CreatedUserId
                                                             }).ToList();
                    res.Tags = tempTagViewModels;
                }

                res.GoalTitle = tempGoalRepo.FirstOrDefault(s => s.Id == res.GoalId)?.GoalTitle;

                res.LikeCount = tempLikeRepo.Count(s => s.EntityId == res.Id);
                res.PageViewCount = tempPageViewRepo.Count(s => s.EntityId == res.Id);
                res.CommentCount = tempAnsRepo.Count(s => s.ProposalId == res.Id);
                res.IsLiked = tempLikeRepo.Any(s => s.EntityId == res.Id && s.UserId == userId);
                res.Attachments = tempAttachmentRepo
                                    .Where(s => s.EntityId == res.Id)
                                    .Select(s => new AttachmentViewModel
                                    {
                                        Address = s.Address,
                                        Id = s.Id,
                                        Name = s.Name!
                                    }).ToList();
            }

			#endregion

			if (!string.IsNullOrWhiteSpace(searchText))
			{
				var gamificationData = new CalculateScoreViewModel()
				{
					GroupName = GroupNameGamificationEnum.Proposal,
					ActionName = ActionNameGamificationEnum.Search,
					SearchText = searchText
				};
				var scores = await _gamificationService.CalculateScores(gamificationData);
			}

			return new OperationResult<List<ProposalViewModel>>(true, result, "Proposal are here", new List<ModelError>(), paging);

        }
        public async Task<List<int>> GetAllowableEntityIdInViewer(int userId)
        {

            var unitId = await _unitService.GetIgtUnitIdByUserId(userId);


            var allowableEntityIds = _viewersRepository.GetEntityAsNoTracking()
                .Where(v => (v.UserId == userId || (unitId != -1 && v.UnitId == unitId))
                            && v.IsActive && !v.IsDeleted && v.Kind == "Proposal")
                .Select(v => v.EntityId)
                .Distinct()
                .ToList();

            return allowableEntityIds;
        }
        #endregion

        #region Project
        private async Task<bool> IsProposalCodeValid(string proposalCode)
        {
           return await _proposalRepository
                .GetEntityAsNoTracking()
                .AnyAsync(p => p.Code == proposalCode );
        }
        public async Task<OperationResult<ProjectViewModel>> CreateProject(CreateProjectViewModel project)
        {
            var tempProject = _mapper.Map<Project>(project);

            var userId = _accountService.GetUserId();

            var isUserInGenerator = await _projectAndProposalGeneratorRepository
                .GetEntityAsNoTracking()
                .AnyAsync(g => g.UserId == userId && g.Kind == "Project");

            if (!isUserInGenerator)
            {
                return new OperationResult<ProjectViewModel>(false, null, "این کاربر امکان ثبت پروژه را ندارد.");
            }
            
            if (!string.IsNullOrEmpty(project.ProposalCode) && !await IsProposalCodeValid(project.ProposalCode))
            {
                return new OperationResult<ProjectViewModel>(false, null, "کد طرح وارد شده معتبر نیست.");
            }

            //Validate Proposal
            if (!ValidateProject(tempProject, out _, out var errors, project.Tags, project.ProjectAttachments!))
            {
                return new OperationResult<ProjectViewModel>(false, null, "Project did not create.", errors);
            }

            // Validate Attachments
            if (project.ProjectAttachments != null)
            {
                var validation = await _projectAndProposalAttachmentRepository.ValidateFile(project.ProjectAttachments.First(), _fileSettings);
                if (validation is { IsSuccess: false, ModelErrors: not null })
                    return new OperationResult<ProjectViewModel>(false, null, "فایل نامعتبر است.",
                        validation.ModelErrors);
            }


            // tags
            var tempTags = project.Tags.Select(s => s.Trim().Replace("#", "")).ToList();
            var existingTags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var existingTagTitles = existingTags.Select(t => t.TagTitle).ToList();
            var newTagTitles = tempTags.Except(existingTagTitles).ToList();

            if (newTagTitles.Any())
            {
                var newTags = newTagTitles.Select(tagTitle => new Tag { TagTitle = tagTitle }).ToList();
                await _tagRepository.AddRangeAsync(newTags, true);
                existingTags.AddRange(newTags);
            }
            
            var saveProject = new Project
            {
                UserId = _accountService.GetUserId(),
                GoalId = project.GoalId,
                Title = project.Title!,
                Abstract = project.Abstract,
                //IdeaCode = project.IdeaCode,
                IsActive = false,
                Code = CommonExtensions.GenerateShortKey()
            };
            if (!string.IsNullOrEmpty(project.ProposalCode))
            {
                saveProject.ProposalCode = project.ProposalCode;
            }
            if (!string.IsNullOrEmpty(project.IdeaCode))
            {
                saveProject.IdeaCode = project.IdeaCode;
            }
            await _projectRepository.AddAsync(saveProject, true);

            if (project.ProjectAttachments != null && project.ProjectAttachments.Any())
            {
                await _projectAndProposalAttachmentRepository.SaveAttachments(project.ProjectAttachments, saveProject.GetType().Name, saveProject.Id, _fileSettings);
            }
            var tags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var proposalTags = tags.Select(tag => new ProjectAndProposalTag
            {
                EntityId = saveProject.Id,
                EntityName = "Project",
                TagId = tag.Id,
            }).ToList();

            await _projectAndProposalTagRepository.AddRangeAsync(proposalTags, true);

            var result = new ProjectViewModel()
            {
                Id = saveProject.Id,
                Title = saveProject.Title,
                Abstract = saveProject.Abstract,
            };
            var creator = _userRepository.GetById(userId);
       
                var notificationStatus = _notificationSender.SendNotification(new SendNotificationDto()
                {
                    Entity = saveProject,
                    NotificationType = NotificationTypeEnum.CreateProject,
                    User = creator
                });
   			return new OperationResult<ProjectViewModel>(true, result, "ثبت طرح با موفقیت ایجاد شد");

        }

        public async Task<OperationResult<List<ProjectViewModel>>> GetAllProject(GetProjectTypesEnum projectFilter, string? searchText = null, int? goalId = null, int? pageNo = null)
        {
            var userId = _accountService.GetUserId();

            #region Where

            var query = _projectRepository.GetAllEntityAsNoTracking().AsQueryable();

            if (goalId != null)
            {
                query = query.Where(a => a.GoalId == goalId);
            }


            if (!string.IsNullOrEmpty(searchText))
            {
                query = query.Where(a => a.Abstract != null && (a.Abstract.Contains(searchText) || a.Title.Contains(searchText)));
            }


            switch (projectFilter)
            {
                //case GetProjectTypesEnum.AllProject:

                //    break;
                case GetProjectTypesEnum.MyProject:
                    query = query.Where(a => a.UserId == userId);
                    break;
                case GetProjectTypesEnum.AllProject:
                    var allowableEntityIds = await GetAllowableProjectViewer(userId);
                    query = query.Where(p => allowableEntityIds.Contains(p.Id) && p.IsActive);
                    break;
                default:
                    throw new ArgumentOutOfRangeException(nameof(projectFilter), projectFilter, null);
            }
            #endregion

            #region Paging and query populating

            var totalEntitiesCount = await query.CountAsync();
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore);

            query = _projectRepository.AllAsNoTrackWithPagingAsync(paging, query)
                .Include(a => a.User);
            var tempRes = await query.ToListAsync();
            var result = _mapper.Map<List<ProjectViewModel>>(tempRes);

            #endregion

            #region Descriptions

            var tempTagRep = (from q in _projectAndProposalTagRepository.GetEntityAsNoTracking()
                    .Where(s => s.EntityName == "Project"
                                && result.Select(t => t.Id).Contains(s.EntityId))
                              join t in _tagRepository.GetAllAsNoTrackAsync() on q.TagId equals t.Id
                              select new
                              {
                                  q.TagId,
                                  q.EntityId,
                                  t.TagTitle,
                                  q.CreatedUserId
                              }).ToList();

            var tempLikeRepo = _likeRepository.GetAllAsNoTrackAsync()
                .Where(s => s.EntityType == "Project"
                            && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempAnsRepo = _projectCommentRepository.GetAllAsNoTrackAsync()
                .Where(s => result.Select(t => t.Id).Contains(s.ProjectId)).ToList();

            var tempAttachmentRepo = _projectAndProposalAttachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "Project"
                            && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempGoalRepo = _goalRepository.GetAllAsNoTrackAsync().Where(s => result.Select(t => t.GoalId).Contains(s.Id)).ToList();

            foreach (var res in result)
            {

                if (tempTagRep is { Count: > 0 })
                {
                    List<TagsViewModel> tempTagViewModels = (from t in tempTagRep.Where(a => a.EntityId == res.Id)
                                                             select new TagsViewModel
                                                             {
                                                                 TagTitle = t.TagTitle,
                                                                 CreatedUserId = t.CreatedUserId
                                                             }).ToList();
                    res.Tags = tempTagViewModels;
                }

                res.GoalTitle = tempGoalRepo.FirstOrDefault(s => s.Id == res.GoalId)?.GoalTitle;
                res.CommentCount = tempAnsRepo.Count(s => s.ProjectId == res.Id);
                res.LikeCount = tempLikeRepo.Count(s => s.EntityId == res.Id);
                res.IsLiked = tempLikeRepo.Any(s => s.EntityId == res.Id && s.UserId == userId);
                res.Attachments = tempAttachmentRepo
                                    .Where(s => s.EntityId == res.Id)
                                    .Select(s => new AttachmentViewModel
                                    {
                                        Address = s.Address,
                                        Id = s.Id,
                                        Name = s.Name!
                                    }).ToList();
            }

			#endregion
			if (!string.IsNullOrWhiteSpace(searchText))
			{
				var gamificationData = new CalculateScoreViewModel()
				{
					GroupName = GroupNameGamificationEnum.Project,
					ActionName = ActionNameGamificationEnum.Search,
					SearchText = searchText
				};
				var scores = await _gamificationService.CalculateScores(gamificationData);
			}
			return new OperationResult<List<ProjectViewModel>>(true, result, "Proposal are here", new List<ModelError>(), paging);

        }
        public async Task<List<int>> GetAllowableProjectViewer(int userId)
        {

            var unitId = await _unitService.GetIgtUnitIdByUserId(userId);


            var allowableEntityIds = _viewersRepository.GetEntityAsNoTracking()
                .Where(v => (v.UserId == userId || v.UnitId == unitId)
                            && v.IsActive && !v.IsDeleted && v.Kind == "Project")
                .Select(v => v.EntityId)
                .Distinct()
                .ToList();

            return allowableEntityIds;
        }
        public async Task<OperationResult<ViewerViewModel>> ConfirmProject(CreateViewerViewModel model)
        {
            var errors = new List<ModelError>();

            var userId = _accountService.GetUserId();
            var myUser = await _userRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            var fullName = myUser?.FullName;


            var project = await _projectRepository.GetEntityAsNoTracking(false)
                .FirstOrDefaultAsync(p => p.Id == model.EntityId);
            if (project == null)
            {
                errors.Add(new ModelError("EntityIdNotFound", "پروژه ای با این شناسه وجود ندارد."));
                return new OperationResult<ViewerViewModel>(false, null, "پروژه ای با این شناسه یافت نشد.", errors);
            }

            var existingAdmin = await _adminRepository.GetEntityAsNoTracking()
                .FirstOrDefaultAsync(a => a.UserId == userId && a.Kind == "Project");
            if (existingAdmin == null)
            {
                return new OperationResult<ViewerViewModel>(false, null, $"کاربر {fullName} ادمین پروژه نمی باشد.");
            }

            if (model.UserId == null && model.UnitId == null)
            {
                errors.Add(new ModelError("InputError", "لیست کاربران و واحدها نمی‌تواند هر دو خالی باشد."));
                return new OperationResult<ViewerViewModel>(false, null, "ورودی نادرست است.", errors);
            }

            // ثبت کاربران جدید
            var registeredUserIds = new List<int>();
            if (model.UserId != null)
            {
                var existingUsers = await _userRepository.GetEntityAsNoTracking()
                    .Where(u => model.UserId.Contains(u.Id))
                    .Select(u => u.Id)
                    .ToListAsync();


                var newUserIds = model.UserId.Except(existingUsers).ToList();

                if (newUserIds.Any())
                {
                   await _accountService.InsertNewUsers(newUserIds);
                }

                foreach (var user in model.UserId)
                {

                    var existingViewer = await _viewersRepository.GetEntityAsNoTracking()
                        .FirstOrDefaultAsync(v => v.UserId == user &&
                                                  v.EntityId == model.EntityId && v.Kind == "Project");

                    if (existingViewer != null)
                    {
                        errors.Add(new ModelError("Duplicate", $"کاربر با شناسه {userId} تکراری است."));
                        continue;
                    }

                    var newUserViewer = new Viewers
                    {
                        UserId = user,
                        EntityId = model.EntityId,
                        Kind = "Project"
                    };

                    await _viewersRepository.AddAsync(newUserViewer, true);
                    registeredUserIds.Add(user);
                }
            }

            // ثبت واحدها
            var registeredUnitIds = new List<int>();
            if (model.UnitId != null)
            {
                foreach (var unitId in model.UnitId)
                {
                    var unit = await _unitRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(u => u.Id == unitId);

                    var existingViewer = await _viewersRepository.GetEntityAsNoTracking()
                        .FirstOrDefaultAsync(v => unit != null &&
                                                  v.UnitId == unit.IgtDepartmentId &&
                                                  v.EntityId == model.EntityId && v.Kind == "Project");

                    if (existingViewer != null)
                    {
                        errors.Add(new ModelError("Duplicate", $"واحد با شناسه {unitId} تکراری است."));
                        continue;
                    }
                    var newUnitViewer = new Viewers
                    {
                        UnitId = unit?.IgtDepartmentId,
                        EntityId = model.EntityId,
                        Kind = "Project"
                    };
                    await _viewersRepository.AddAsync(newUnitViewer, true);
                    registeredUnitIds.Add(unitId);
                }
            }

            //var project = await _projectRepository.GetEntityAsNoTracking(false)
            //    .FirstOrDefaultAsync(s => s.Id == model.EntityId);
            if (project != null)
            {
                project.IsActive = true;
                if (model.GoalId != null)
                {
                    project.GoalId = (int)model.GoalId;
                }
                if (!string.IsNullOrEmpty(model.Title))
                {
                    project.Title = model.Title;
                }
                if (!string.IsNullOrEmpty(model.Abstract))
                {
                    project.Abstract = model.Abstract;
                }
                if (!string.IsNullOrEmpty(model.IdeaCode))
                {
                    project.IdeaCode = model.IdeaCode;
                }
                if (!string.IsNullOrEmpty(model.ProposalCode))
                {
                    project.ProposalCode = model.ProposalCode;
                }
                await _projectRepository.UpdateAsync(project, true);
            }

            var viewerViewModel = new ViewerViewModel
            {
                UserViewer = registeredUserIds.Select(id => new UserViewerViewModel
                {
                    UserId = id,
                    FullName = _userRepository.GetEntityAsNoTracking().FirstOrDefault(u => u.Id == id)?.FullName
                }).ToList(),

                UnitViewer = registeredUnitIds.Select(unitId => new UnitViewModel
                {
                    ID = unitId,
                    UnitName = _unitRepository.GetEntityAsNoTracking().FirstOrDefault(u => u.IgtDepartmentId == unitId)?.UnitName
                }).ToList(),

                Kind = "پروژه"

            };



            var isAdminCreator = project.UserId == existingAdmin.UserId;


            if (isAdminCreator)
            {
                await _gamificationService.CalculateScores(new CalculateScoreViewModel()
                {
                    Entity = project,
                    ActionName = ActionNameGamificationEnum.Admin,
                    GroupName = GroupNameGamificationEnum.Project

                }, true, true);
            }
            else
            {
                var gamificationData = new CalculateScoreViewModel()
                {
                    GroupName = GroupNameGamificationEnum.Project,
                    ActionName = ActionNameGamificationEnum.Confirm,
                    Entity = project
                };
                var scores = await _gamificationService.CalculateScores(gamificationData);
            }





			return new OperationResult<ViewerViewModel>(true, viewerViewModel, " با موفقیت ثبت شد");

        }
        public async Task<OperationResult<List<ProjectViewModel>>> GetProjectsForAdminConfirm()
        {
            var userId = _accountService.GetUserId();
            var existingAdmin = await _adminRepository.GetEntityAsNoTracking()
                .FirstOrDefaultAsync(a => a.UserId == userId && a.Kind == "Project");
            if (existingAdmin == null)
            {
                return new OperationResult<List<ProjectViewModel>>(true, new List<ProjectViewModel>(), "مدیر یافت نشد، لیست خالی است.");
            }

            var result = await _projectRepository.GetEntityAsNoTracking(false)
                .Where(p => !p.IsActive)
                .Select(p => new ProjectViewModel
                {
                    Id = p.Id,
                    Title = p.Title,
                    Abstract = p.Abstract,
                    Code = p.Code,
                    ProposalCode = p.ProposalCode,
                    GoalId = p.GoalId,
                    IdeaCode = p.IdeaCode,
                    GoalTitle = p.Goal.GoalTitle,
                    CreatedDate = p.CreatedDate,
                    User = new UserViewModel()
                    {
                        FullName = p.User.FullName,
                        Id = p.User.Id,
                    },
                    Attachments = new List<AttachmentViewModel>()

                })
                .OrderByDescending(p => p.Id).ToListAsync();
            foreach (var project in result)
            {
                project.Attachments = await GetAttachmentForProposalOrProject("Project", project.Id);
            }
            return new OperationResult<List<ProjectViewModel>>(true, result, "لیست طرح های تایید نشده");

        }
        public async Task<OperationResult<LikeViewModel>> LikeProject(LikeViewModel qaLikeViewModel)
        {
            var errors = new List<ModelError>();
            var tempLike = _mapper.Map<Like>(qaLikeViewModel);

            if (qaLikeViewModel == null)
            {
                return new OperationResult<LikeViewModel>(false, null, nameof(Like) + " did not created.", errors);
            }

            if (!Enum.IsDefined(typeof(LikeEntityType), tempLike.EntityType))
            {
                var str = $"پارامتر نوع باید  از نوع {LikeEntityType.Project} باشد";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }

            if (_userRepository.GetById(tempLike.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            var project = _projectRepository.GetById(tempLike.EntityId);

			if (tempLike.EntityType == LikeEntityType.Project.ToString())
            {
                if (project == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "پروژه به درستی انتخاب نشده است"));
                }
            }


            if (_likeRepository.GetEntity(a => a.EntityType == tempLike.EntityType
                        && a.UserId == tempLike.UserId && a.EntityId == tempLike.EntityId).Any())
            {
                errors.Add(new ModelError(nameof(tempLike.EntityId), "این مورد قبلا لایک شده است"));
            }

            if (errors.Any())
            {
                return new OperationResult<LikeViewModel>(false, null!, "خطایی رخ داده است", errors);
            }

            await _likeRepository.AddAsync(tempLike, true);

            var gamificationData = new CalculateScoreViewModel()
            {
	            GroupName = GroupNameGamificationEnum.Project,
	            ActionName = ActionNameGamificationEnum.Like,
	            Entity = tempLike
			};
            var scores = await _gamificationService.CalculateScores(gamificationData);


			return new OperationResult<LikeViewModel>(true, qaLikeViewModel, nameof(Like) + " لایک با موفقیت ایجاد شد.");
        }

        public async Task<OperationResult<LikeViewModel>> UnLikeProject(LikeViewModel qaLikeViewModel)
        {
            var errors = new List<ModelError>();

            var temp = _likeRepository.GetEntity(a => a.EntityType == qaLikeViewModel.EntityType.ToString()
                                    && a.UserId == qaLikeViewModel.UserId
                                    && a.EntityId == qaLikeViewModel.EntityId);
            var tempLike = temp.Any() ? temp.First() : null;


            if (tempLike == null)
            {
                errors.Add(new ModelError(nameof(qaLikeViewModel.EntityId), "این مورد یافت نشد"));
            }

            if (!Enum.IsDefined(typeof(LikeEntityType), (LikeEntityType)qaLikeViewModel.EntityType))
            {
                var str = $"پارامتر نوع باید  از نوع {LikeEntityType.Project} باشد";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }


            if (_userRepository.GetById(qaLikeViewModel.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            if (qaLikeViewModel.EntityType == LikeEntityEnum.Project)
            {
                if (_projectRepository.GetById(qaLikeViewModel.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "پروژه به درستی انتخاب نشده است"));
                }
            }


            if (errors.Any())
            {
                return new OperationResult<LikeViewModel>(false, null!, "خطایی رخ داده است", errors);
            }

            await _likeRepository.DeleteAsync(tempLike!, true, true);
            await _gamificationService.CalculateScores(new CalculateScoreViewModel()
            {
                Entity = tempLike,
                ActionName = ActionNameGamificationEnum.UnLike,
                GroupName = GroupNameGamificationEnum.Project

            }, true, true);


            return new OperationResult<LikeViewModel>(true, qaLikeViewModel, nameof(Like) + " حذف لایک با موفقیت انجام شد");
        }

        public async Task<OperationResult<ProjectCommentViewModel>> CreateProjectComment(CreateProjectCommentViewModel comment)
        {
            var tempComment = _mapper.Map<ProjectComment>(comment);


            var res = ValidateProjectComment(tempComment, out _, out List<ModelError> errors);
            if (!res)
            {
                return new OperationResult<ProjectCommentViewModel>(false, null, nameof(comment) + " did not created.", errors);
            }

            var validation = await _projectAndProposalAttachmentRepository.ValidateFile(comment.ProposalCommentAttachments?.First()!, _fileSettings);
            if (!validation.IsSuccess)
            {
                return new OperationResult<ProjectCommentViewModel>(false, null, @"فایل معتبر نمی باشد",
                    validation.ModelErrors!);
            }

            // tags
            var tempTags = comment.Tags.Select(s => s.Trim().Replace("#", "")).ToList();
            var existingTags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var existingTagTitles = existingTags.Select(t => t.TagTitle).ToList();
            var newTagTitles = tempTags.Except(existingTagTitles).ToList();

            if (newTagTitles.Any())
            {
                var newTags = newTagTitles.Select(tagTitle => new Tag { TagTitle = tagTitle }).ToList();
                await _tagRepository.AddRangeAsync(newTags, true);
                existingTags.AddRange(newTags);
            }



            await _projectCommentRepository.AddAsync(tempComment, true);

            var tags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var commentTags = tags.Select(tag => new ProjectAndProposalTag
            {
                EntityId = tempComment.Id,
                EntityName = "ProjectComment",
                TagId = tag.Id,
                CreatedUserId = _accountService.GetUserId().ToString(),

            }).ToList();

            await _projectAndProposalTagRepository.AddRangeAsync(commentTags, true);


            if (comment.ProposalCommentAttachments != null && comment.ProposalCommentAttachments.Any())
            {

                await _projectAndProposalAttachmentRepository.SaveAttachments(comment.ProposalCommentAttachments, tempComment.GetType().Name, tempComment.Id, _fileSettings);

            }
            var retVal = _mapper.Map<ProjectCommentViewModel>(tempComment);


            return new OperationResult<ProjectCommentViewModel>(true, retVal, nameof(comment) + " کامنت با موفقیت ایجاد شد.");
        }

        public async Task<OperationResult<List<ProjectCommentViewModel>>> GetCommentOfProject(int projectId, int? pageNo = null)
        {
            var userId = _accountService.GetUserId();

            #region Where

            var query = _projectCommentRepository.GetEntityAsNoTracking(false)
                .Where(a => a.ProjectId == projectId)
                .AsQueryable();

            #endregion

            #region Paging and query populating

            var totalEntitiesCount = await query.CountAsync();
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore);
            query = _projectCommentRepository.GetAllAsNoTrackWithPagingAsync(paging, query)
                .Include(a => a.User);
            var tempRes = await query.ToListAsync();
            var result = _mapper.Map<List<ProjectCommentViewModel>>(tempRes);

            #endregion

            #region Descriptions

            var tempTagRep = (from q in _projectAndProposalTagRepository.GetEntityAsNoTracking()
                    .Where(s => s.EntityName == "ProjectComment"
                                && result.Select(t => t.Id).Contains(s.EntityId))
                              join t in _tagRepository.GetAllAsNoTrackAsync() on q.TagId equals t.Id
                              select new
                              {
                                  q.TagId,
                                  q.EntityId,
                                  t.TagTitle,
                                  q.CreatedUserId
                              }).ToList();

            var tempLikeRepo = _likeRepository.GetAllAsNoTrackAsync()
                .Where(s => s.EntityType == "ProjectComment" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempAttachmentRepo = _projectAndProposalAttachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "ProjectComment" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();

            foreach (var res in result)
            {


                if (tempTagRep is { Count: > 0 })
                {
                    List<TagsViewModel> tempTagViewModels = (from t in tempTagRep.Where(a => a.EntityId == res.Id)
                                                             select new TagsViewModel
                                                             {
                                                                 TagTitle = t.TagTitle,
                                                                 CreatedUserId = t.CreatedUserId
                                                             }).ToList();
                    res.Tags = tempTagViewModels;
                }

                res.LikeCount = tempLikeRepo.Count(s => s.EntityId == res.Id);
                res.IsLiked = tempLikeRepo.Any(s => s.EntityId == res.Id && s.UserId == userId);
                res.Attachments = tempAttachmentRepo
                                    .Where(s => s.EntityId == res.Id)
                                    .Select(s => new AttachmentViewModel
                                    {
                                        Address = s.Address,
                                        Id = s.Id,
                                        Name = s.Name ?? ""
                                    }).ToList();
            }

            #endregion

            return new OperationResult<List<ProjectCommentViewModel>>(true, result, "فهرست کامنت ها", new List<ModelError>(), paging);

        }

        public async Task<OperationResult<ProjectCommentViewModel>> GetProjectCommentById(int commentId)
        {
            var comment = await _projectCommentRepository.GetEntityAsNoTracking()
                          .Include(a => a.User)
                          .FirstOrDefaultAsync(a => a.Id == commentId);

            if (comment == null)
                return new OperationResult<ProjectCommentViewModel>(false, null!, "کامنت یافت نشد");

            var result = _mapper.Map<ProjectCommentViewModel>(comment);

            var userId = _accountService.GetUserId();


            //  Attachments
            result.Attachments = await _projectAndProposalAttachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "ProjectComment" && s.EntityId == comment.Id)
                .Select(s => new AttachmentViewModel
                {
                    Address = s.Address,
                    Name = s.Name!,
                    Id = s.Id
                }).ToListAsync();

            //  Tags
            result.Tags = await _projectAndProposalTagRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityId == comment.Id && s.EntityName == "ProjectComment")
                .Join(_tagRepository.GetEntityAsNoTracking(), qt => qt.TagId, t => t.Id, (qt, t) => new TagsViewModel
                {
                    TagTitle = t.TagTitle,
                    CreatedUserId = t.CreatedUserId!
                }).ToListAsync();

            //  Mention


            // محاسبه 
            result.LikeCount = await _likeRepository.GetEntityAsNoTracking()
                .CountAsync(s => s.EntityType == "ProjectComment" && s.EntityId == comment.Id);

            //  آیا کاربر فعلی این پاسخ را لایک کرده است یا خیر
            result.IsLiked = await _likeRepository.GetEntityAsNoTracking()
                .AnyAsync(s => s.EntityType == "ProjectComment"
                               && s.EntityId == comment.Id
                               && s.UserId == userId);

            return new OperationResult<ProjectCommentViewModel>(true, result, nameof(ProjectComment) + $" رکورد {commentId} ");

        }

        public async Task<OperationResult<LikeViewModel>> LikeCommentProject(LikeViewModel likeViewModel)
        {
            var errors = new List<ModelError>();
            var tempLike = _mapper.Map<Like>(likeViewModel);


            if (likeViewModel == null)
            {
                return new OperationResult<LikeViewModel>(false, null, nameof(Like) + " did not created.", errors);
            }

            if (!Enum.IsDefined(typeof(LikeEntityType), tempLike.EntityType))
            {
                string str = $"پارامتر نوع باید باید از نوع : {LikeEntityType.ProjectComment} باشد";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }

            if (_userRepository.GetById(tempLike.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            if (tempLike.EntityType == LikeEntityType.ProjectComment.ToString())
            {
                if (_projectCommentRepository.GetById(tempLike.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "کامنت به درستی انتخاب نشده است"));
                }
            }

            if (_likeRepository.GetEntity(a => a.EntityType == tempLike.EntityType
                                               && a.UserId == tempLike.UserId
                                               && a.EntityId == tempLike.EntityId).Any())
            {
                errors.Add(new ModelError(nameof(tempLike.EntityId), "این مورد قبلا لایک شده است"));
            }

            if (errors.Any())
            {
                return new OperationResult<LikeViewModel>(false, null!, "خطایی رخ داده است", errors);
            }

            await _likeRepository.AddAsync(tempLike, true);

            return new OperationResult<LikeViewModel>(true, likeViewModel, nameof(Like) + " لایک با موفقیت ایجاد شد.");

        }

        public async Task<OperationResult<LikeViewModel>> UnlikeCommentProject(LikeViewModel likeViewModel)
        {
            var errors = new List<ModelError>();

            var temp = _likeRepository.GetEntity(a => a.EntityType == likeViewModel.EntityType.ToString()
                                                      && a.UserId == likeViewModel.UserId
                                                      && a.EntityId == likeViewModel.EntityId);
            var tempLike = temp.Any() ? temp.First() : null;


            if (tempLike == null)
            {
                errors.Add(new ModelError(nameof(likeViewModel.EntityId), "این مورد یافت نشد"));
            }

            if (!Enum.IsDefined(typeof(LikeEntityType), (LikeEntityType)likeViewModel.EntityType))
            {
                string str = $"پارامتر نوع باید از نوع : {LikeEntityType.ProjectComment} باشد";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }

            if (_userRepository.GetById(likeViewModel.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            if (likeViewModel.EntityType == LikeEntityEnum.ProjectComment)
            {
                if (_projectCommentRepository.GetById(likeViewModel.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "پاسخ به درستی انتخاب نشده است"));
                }
            }


            if (errors.Any())
            {
                return new OperationResult<LikeViewModel>(false, null!, "خطایی رخ داده است", errors);
            }

            await _likeRepository.DeleteAsync(tempLike!, true, true);

            return new OperationResult<LikeViewModel>(true, likeViewModel, nameof(Like) + " حذف لایک با موفقیت انجام شد");

        }

        #endregion

        #region Like
        public async Task<OperationResult<LikeViewModel>> LikeProposal(LikeViewModel qaLikeViewModel)
        {
            var errors = new List<ModelError>();
            var tempLike = _mapper.Map<Like>(qaLikeViewModel);

            if (qaLikeViewModel == null)
            {
                return new OperationResult<LikeViewModel>(false, null, nameof(Like) + " did not created.", errors);
            }

            if (!Enum.IsDefined(typeof(LikeEntityType), tempLike.EntityType))
            {
                var str = $"پارامتر نوع باید  از نوع {LikeEntityType.Proposal} باشد";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }

            if (_userRepository.GetById(tempLike.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            var proposal = _proposalRepository.GetById(tempLike.EntityId);

			if (tempLike.EntityType == LikeEntityType.Proposal.ToString())
            {
                if (proposal == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "طرح به درستی انتخاب نشده است"));
                }
            }


            if (_likeRepository.GetEntity(a => a.EntityType == tempLike.EntityType
                        && a.UserId == tempLike.UserId && a.EntityId == tempLike.EntityId).Any())
            {
                errors.Add(new ModelError(nameof(tempLike.EntityId), "این مورد قبلا لایک شده است"));
            }

            if (errors.Any())
            {
                return new OperationResult<LikeViewModel>(false, null!, "خطایی رخ داده است", errors);
            }

            await _likeRepository.AddAsync(tempLike, true);
            var gamificationData = new CalculateScoreViewModel()
            {
	            GroupName = GroupNameGamificationEnum.Proposal,
	            ActionName = ActionNameGamificationEnum.Like,
	            Entity = tempLike
			};
            var scores = await _gamificationService.CalculateScores(gamificationData);

			return new OperationResult<LikeViewModel>(true, qaLikeViewModel, nameof(Like) + " لایک با موفقیت ایجاد شد.");
        }

        public async Task<OperationResult<LikeViewModel>> UnLikeProposal(LikeViewModel qaLikeViewModel)
        {
            var errors = new List<ModelError>();

            var temp = _likeRepository.GetEntity(a => a.EntityType == qaLikeViewModel.EntityType.ToString()
                                    && a.UserId == qaLikeViewModel.UserId && a.EntityId == qaLikeViewModel.EntityId);
            var tempLike = temp.Any() ? temp.First() : null;


            if (tempLike == null)
            {
                errors.Add(new ModelError(nameof(qaLikeViewModel.EntityId), "این مورد یافت نشد"));
            }

            if (!Enum.IsDefined(typeof(LikeEntityType), (LikeEntityType)qaLikeViewModel.EntityType))
            {
                var str = $"پارامتر نوع باید  از نوع {LikeEntityType.Proposal} باشد";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }


            if (_userRepository.GetById(qaLikeViewModel.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            if (qaLikeViewModel.EntityType == LikeEntityEnum.Proposal)
            {
                if (_proposalRepository.GetById(qaLikeViewModel.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "طرح به درستی انتخاب نشده است"));
                }
            }


            if (errors.Any())
            {
                return new OperationResult<LikeViewModel>(false, null!, "خطایی رخ داده است", errors);
            }

            await _likeRepository.DeleteAsync(tempLike!, true, true);
            await _gamificationService.CalculateScores(new CalculateScoreViewModel()
            {
                Entity = tempLike,
                ActionName = ActionNameGamificationEnum.UnLike,
                GroupName = GroupNameGamificationEnum.Proposal

            }, true, true);

            return new OperationResult<LikeViewModel>(true, qaLikeViewModel, nameof(Like) + " حذف لایک با موفقیت انجام شد");
        }

        public async Task<OperationResult<ProposalCommentViewModel>> CreateProposalComment(CreateProposalCommentViewModel comment)
        {
            var tempComment = _mapper.Map<ProposalComment>(comment);


            var res = ValidateProposalComment(tempComment, out _, out List<ModelError> errors);
            if (!res)
            {
                return new OperationResult<ProposalCommentViewModel>(false, null, nameof(comment) + " did not created.", errors);
            }

            var validation = await _projectAndProposalAttachmentRepository.ValidateFile(comment.ProposalCommentAttachments?.First()!, _fileSettings);
            if (!validation.IsSuccess)
            {
                return new OperationResult<ProposalCommentViewModel>(false, null, @"فایل معتبر نمی باشد",
                    validation.ModelErrors!);
            }

            // tags
            var tempTags = comment.Tags.Select(s => s.Trim().Replace("#", "")).ToList();
            var existingTags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var existingTagTitles = existingTags.Select(t => t.TagTitle).ToList();
            var newTagTitles = tempTags.Except(existingTagTitles).ToList();

            if (newTagTitles.Any())
            {
                var newTags = newTagTitles.Select(tagTitle => new Tag { TagTitle = tagTitle }).ToList();
                await _tagRepository.AddRangeAsync(newTags, true);
                existingTags.AddRange(newTags);
            }



            await _proposalCommentRepository.AddAsync(tempComment, true);

            var tags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var commentTags = tags.Select(tag => new ProjectAndProposalTag
            {
                EntityId = tempComment.Id,
                EntityName = "ProposalComment",
                TagId = tag.Id,
                CreatedUserId = _accountService.GetUserId().ToString(),

            }).ToList();

            await _projectAndProposalTagRepository.AddRangeAsync(commentTags, true);


            if (comment.ProposalCommentAttachments != null && comment.ProposalCommentAttachments.Any())
            {

                await _projectAndProposalAttachmentRepository.SaveAttachments(comment.ProposalCommentAttachments, tempComment.GetType().Name, tempComment.Id, _fileSettings);

            }
            var retVal = _mapper.Map<ProposalCommentViewModel>(tempComment);


            return new OperationResult<ProposalCommentViewModel>(true, retVal, nameof(comment) + " کامنت با موفقیت ایجاد شد.");
        }

        public async Task<OperationResult<List<ProposalCommentViewModel>>> GetCommentOfProposal(int proposalId, int? pageNo = null)
        {
            var userId = _accountService.GetUserId();

            #region Where

            var query = _proposalCommentRepository.GetEntityAsNoTracking()
                .Where(a => a.ProposalId == proposalId)
                .AsQueryable();

            #endregion

            #region Paging and query populating

            var totalEntitiesCount = await query.CountAsync();
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore);
            query = _proposalCommentRepository.GetAllAsNoTrackWithPagingAsync(paging, query)
                .Include(a => a.User);
            var tempRes = await query.ToListAsync();
            var result = _mapper.Map<List<ProposalCommentViewModel>>(tempRes);

            #endregion

            #region Descriptions

            var tempTagRep = (from q in _projectAndProposalTagRepository.GetEntityAsNoTracking()
                    .Where(s => s.EntityName == "ProposalComment"
                                && result.Select(t => t.Id).Contains(s.EntityId))
                              join t in _tagRepository.GetAllAsNoTrackAsync() on q.TagId equals t.Id
                              select new
                              {
                                  q.TagId,
                                  q.EntityId,
                                  t.TagTitle,
                                  q.CreatedUserId
                              }).ToList();

            var tempLikeRepo = _likeRepository.GetAllAsNoTrackAsync()
                .Where(s => s.EntityType == "ProposalComment" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempAttachmentRepo = _projectAndProposalAttachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "ProposalComment" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();

            foreach (var res in result)
            {


                if (tempTagRep is { Count: > 0 })
                {
                    List<TagsViewModel> tempTagViewModels = (from t in tempTagRep.Where(a => a.EntityId == res.Id)
                                                             select new TagsViewModel
                                                             {
                                                                 TagTitle = t.TagTitle,
                                                                 CreatedUserId = t.CreatedUserId
                                                             }).ToList();
                    res.Tags = tempTagViewModels;
                }

                res.LikeCount = tempLikeRepo.Count(s => s.EntityId == res.Id);
                res.IsLiked = tempLikeRepo.Any(s => s.EntityId == res.Id && s.UserId == userId);
                res.Attachments = tempAttachmentRepo
                                    .Where(s => s.EntityId == res.Id)
                                    .Select(s => new AttachmentViewModel
                                    {
                                        Address = s.Address,
                                        Id = s.Id,
                                        Name = s.Name ?? ""
                                    }).ToList();
            }

            #endregion

            return new OperationResult<List<ProposalCommentViewModel>>(true, result, "فهرست کامنت ها", new List<ModelError>(), paging);
        }

        public async Task<OperationResult<ProposalCommentViewModel>> GetProposalCommentById(int commentId)
        {
            var comment = await _proposalCommentRepository.GetEntityAsNoTracking()
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == commentId);

            if (comment == null)
                return new OperationResult<ProposalCommentViewModel>(false, null!, "کامنت یافت نشد");

            var result = _mapper.Map<ProposalCommentViewModel>(comment);

            var userId = _accountService.GetUserId();


            //  Attachments
            result.Attachments = await _projectAndProposalAttachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "ProposalComment" && s.EntityId == comment.Id)
                .Select(s => new AttachmentViewModel
                {
                    Address = s.Address,
                    Name = s.Name!,
                    Id = s.Id
                }).ToListAsync();

            //  Tags
            result.Tags = await _projectAndProposalTagRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityId == comment.Id && s.EntityName == "ProposalComment")
                .Join(_tagRepository.GetEntityAsNoTracking(), qt => qt.TagId, t => t.Id, (qt, t) => new TagsViewModel
                {
                    TagTitle = t.TagTitle,
                    CreatedUserId = t.CreatedUserId!
                }).ToListAsync();

            //  Mention


            // محاسبه 
            result.LikeCount = await _likeRepository.GetEntityAsNoTracking()
                .CountAsync(s => s.EntityType == "ProposalComment" && s.EntityId == comment.Id);

            //  آیا کاربر فعلی این پاسخ را لایک کرده است یا خیر
            result.IsLiked = await _likeRepository.GetEntityAsNoTracking()
                .AnyAsync(s => s.EntityType == "ProposalComment"
                               && s.EntityId == comment.Id
                               && s.UserId == userId);

            return new OperationResult<ProposalCommentViewModel>(true, result, nameof(ProposalComment) + $" رکورد {commentId} ");
        }

        public async Task<OperationResult<LikeViewModel>> LikeProposalComment(LikeViewModel likeViewModel)
        {
            var errors = new List<ModelError>();
            var tempLike = _mapper.Map<Like>(likeViewModel);


            if (likeViewModel == null)
            {
                return new OperationResult<LikeViewModel>(false, null, nameof(Like) + " did not created.", errors);
            }

            if (!Enum.IsDefined(typeof(LikeEntityType), tempLike.EntityType))
            {
                string str = $"پارامتر نوع باید باید از نوع : {LikeEntityType.ProposalComment} باشد";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }

            if (_userRepository.GetById(tempLike.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            if (tempLike.EntityType == LikeEntityType.ProposalComment.ToString())
            {
                if (_proposalCommentRepository.GetById(tempLike.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "کامنت به درستی انتخاب نشده است"));
                }
            }

            if (_likeRepository.GetEntity(a => a.EntityType == tempLike.EntityType
                                               && a.UserId == tempLike.UserId
                                               && a.EntityId == tempLike.EntityId).Any())
            {
                errors.Add(new ModelError(nameof(tempLike.EntityId), "این مورد قبلا لایک شده است"));
            }

            if (errors.Any())
            {
                return new OperationResult<LikeViewModel>(false, null!, "خطایی رخ داده است", errors);
            }

            await _likeRepository.AddAsync(tempLike, true);

            return new OperationResult<LikeViewModel>(true, likeViewModel, nameof(Like) + " لایک با موفقیت ایجاد شد.");
        }

        public async Task<OperationResult<LikeViewModel>> UnlikeProposalComment(LikeViewModel likeViewModel)
        {
            var errors = new List<ModelError>();

            var temp = _likeRepository.GetEntity(a => a.EntityType == likeViewModel.EntityType.ToString()
                                                      && a.UserId == likeViewModel.UserId
                                                      && a.EntityId == likeViewModel.EntityId);
            var tempLike = temp.Any() ? temp.First() : null;


            if (tempLike == null)
            {
                errors.Add(new ModelError(nameof(likeViewModel.EntityId), "این مورد یافت نشد"));
            }

            if (!Enum.IsDefined(typeof(LikeEntityType), (LikeEntityType)likeViewModel.EntityType))
            {
                string str = $"پارامتر نوع باید از نوع : {LikeEntityType.ProposalComment} باشد";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }

            if (_userRepository.GetById(likeViewModel.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            if (likeViewModel.EntityType == LikeEntityEnum.ProposalComment)
            {
                if (_proposalCommentRepository.GetById(likeViewModel.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "پاسخ به درستی انتخاب نشده است"));
                }
            }


            if (errors.Any())
            {
                return new OperationResult<LikeViewModel>(false, null!, "خطایی رخ داده است", errors);
            }

            await _likeRepository.DeleteAsync(tempLike!, true, true);

            return new OperationResult<LikeViewModel>(true, likeViewModel, nameof(Like) + " حذف لایک با موفقیت انجام شد");

        }

        #endregion
    }
}
