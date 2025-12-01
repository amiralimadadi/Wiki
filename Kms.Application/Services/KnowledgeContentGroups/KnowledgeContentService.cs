using AutoMapper;
using Common.File;
using Common.Mentions;
using Common.OperationResult;
using Common.Paging;
using Kms.Application.Senders;
using Kms.Application.Services.Account;
using Kms.Application.Services.Gamifications;
using Kms.Application.Services.Units;
using Kms.Application.ViewModels;
using Kms.DataLayer.Contracts;
using Kms.DataLayer.Repositories;
using Kms.Domain.Entities.General;
using Kms.Domain.Entities.KnowledgeContentGroup;
using Kms.Domain.Entities.ProjectAndProposal;
using Kms.Domain.Entities.QuestionAndAnswer;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Net.NetworkInformation;
using Kms.Application.ViewModel.Options;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace Kms.Application.Services.KnowledgeContentGroups
{
    public class KnowledgeContentService : IKnowledgeContentService
    {
        private readonly IGoalRepository _goalRepository;
        private readonly IAccountService _accountService;
        private readonly IUnitService _unitService;
        private readonly IPageViewRepository _pageViewRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAdminRepository _adminRepository;
        private readonly IViewersRepository _viewersRepository;
        private readonly IUnitRepository _unitRepository;
        private readonly ICommentRepository _commentRepository;
        private readonly PagingOptions _pagingOptions;
        private readonly ILikeRepository _likeRepository;
        private readonly IKnowledgeContentRepository _knowledgeContentRepository;
        private readonly ITagRepository _tagRepository;
        private readonly IKnowledgeContentTagRepository _knowledgeContentTagRepository;
        private readonly IProcessProfessionalRepository _processProfessionalRepository;
        private readonly IKnowledgeContentExpertConfirmRepository _knowledgeContentExpertConfirmRepository;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IGamificationService _gamificationService;
        private readonly INotificationSender _notificationSender;
        private readonly FileSettings _fileSettings;
        private readonly BranchEmploye _branchEmploye;
        private readonly IMapper _mapper;

        #region Constructor

        public KnowledgeContentService(
            IGoalRepository goalRepository,
            IAccountService accountService,
            IUserRepository userRepository,
            IUnitService unitService,
            IPageViewRepository pageViewRepository,
            IViewersRepository viewersRepository,
            IUnitRepository unitRepository,
            IAdminRepository adminRepository,
            ILikeRepository likeRepository,
            ICommentRepository commentRepository,
            IKnowledgeContentRepository knowledgeContentRepository,
            ITagRepository tagRepository,
            IKnowledgeContentTagRepository knowledgeContentTagRepository,
            IProcessProfessionalRepository processProfessionalRepository,
            IKnowledgeContentExpertConfirmRepository knowledgeContentExpertConfirmRepository,
            IAttachmentRepository attachmentRepository,
            IGamificationService gamificationService,
            INotificationSender notificationSender,
            IOptions<FileSettings> fileSettings,
            IOptions<PagingOptions> pagingOptions,
            IOptions<BranchEmploye> branchOptions,
            IMapper mapper)
        {
            _goalRepository = goalRepository;
            _accountService = accountService;
            _adminRepository = adminRepository;
            _unitService = unitService;
            _pageViewRepository = pageViewRepository;
            _viewersRepository = viewersRepository;
            _unitRepository = unitRepository;
            _userRepository = userRepository;
            _likeRepository = likeRepository;
            _notificationSender = notificationSender;
            _commentRepository = commentRepository;
            _knowledgeContentRepository = knowledgeContentRepository;
            _tagRepository = tagRepository;
            _knowledgeContentTagRepository = knowledgeContentTagRepository;
            _knowledgeContentExpertConfirmRepository = knowledgeContentExpertConfirmRepository;
            _processProfessionalRepository = processProfessionalRepository;
            _attachmentRepository = attachmentRepository;
            _gamificationService = gamificationService;
            _fileSettings = fileSettings.Value;
            _pagingOptions = pagingOptions.Value;
            _branchEmploye = branchOptions.Value;
            _mapper = mapper;
        }

        #endregion Constructor

        #region private Methods

        private bool ValidateKnowledgeContent(KnowledgeContent knowledgeContent, out KnowledgeContent finalKnowledgeContent, out List<ModelError> modelErrors, List<string> tags, List<IFormFile> file)
        {
            modelErrors = new List<ModelError>();
            finalKnowledgeContent = knowledgeContent;

            _knowledgeContentRepository.EntityValidation(finalKnowledgeContent, out List<ModelError> errors);
            var goal = _goalRepository.GetById(knowledgeContent.GoalId);
            if (goal == null)
                errors.Add(new ModelError("Goal", "انتخاب دسته بندی اجباری است."));

            if (knowledgeContent.KnowledgeContentType == "Structured")
            {
                if (string.IsNullOrWhiteSpace(knowledgeContent.Title))
                    errors.Add(new ModelError(nameof(knowledgeContent.Title), "عنوان اجباری است"));

                if (string.IsNullOrWhiteSpace(knowledgeContent.Text))
                    errors.Add(new ModelError(nameof(knowledgeContent.Text), "متن اجباری است"));

                if (string.IsNullOrWhiteSpace(knowledgeContent.Text))
                    errors.Add(new ModelError(nameof(knowledgeContent.Text), "متن اجباری است"));
                else if (knowledgeContent.Text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Length < 150)
                    errors.Add(new ModelError(nameof(knowledgeContent.Text), "تعداد کلمات متن نمی تواند کمتر از 150 باشد"));

                if (knowledgeContent.Title?.Length > 300)
                    errors.Add(new ModelError(nameof(knowledgeContent.Title), "طول عنوان نباید بیشتر از ۳۰۰ کاراکتر باشد"));

                if (string.IsNullOrWhiteSpace(knowledgeContent.Abstract))
                    errors.Add(new ModelError(nameof(knowledgeContent.Abstract), "چکیده اجباری است"));
                else if (knowledgeContent.Abstract.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Length < 15)
                    errors.Add(new ModelError(nameof(knowledgeContent.Abstract), "تعداد کلمات چکیده نمی‌تواند کمتر از ۱۵ باشد"));

                if (!tags.Any())
                    errors.Add(new ModelError(nameof(tags), "کلمات کلیدی اجباری است"));

                //if (knowledgeContent.References == null || !knowledgeContent.References.Any())
                //{
                //    errors.Add(new ModelError(nameof(knowledgeContent.References), "منابع اجباری است"));
                //}
            }

            if (knowledgeContent.KnowledgeContentType == "NonStructured")
            {
                if (string.IsNullOrWhiteSpace(knowledgeContent.Text))
                    errors.Add(new ModelError(nameof(knowledgeContent.Text), "متن اجباری است"));
                else
                {
                    var wordCount = knowledgeContent.Text.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Length;
                    switch (wordCount)
                    {
                        case < 30:
                            errors.Add(new ModelError(nameof(knowledgeContent.Text), "تعداد کلمات متن نمی‌تواند کمتر از 30 باشد"));
                            break;
                        case > 150:
                            errors.Add(new ModelError(nameof(knowledgeContent.Text), "تعداد کلمات متن نمی‌تواند بیشتر از 150 باشد"));
                            break;
                    }
                }

                if (!string.IsNullOrWhiteSpace(knowledgeContent.Abstract) &&
                    knowledgeContent.Abstract.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries).Length < 15)
                {
                    errors.Add(new ModelError(nameof(knowledgeContent.Abstract), "تعداد کلمات چکیده نمی‌تواند کمتر از ۱۵ باشد"));
                }

                //if (!file.Any())
                //    errors.Add(new ModelError(nameof(file), "حداقل یک فایل باید ارسال شود"));

                if (!tags.Any())
                    errors.Add(new ModelError(nameof(tags), "کلمات کلیدی اجباری است"));
            }


            if (errors.Any())
            {
                modelErrors = errors;
                return false;
            }
            return true;
        }
        private bool ValidateComment(Comment comment, out Comment finalComment, out List<ModelError> modelErrors)
        {
            modelErrors = new List<ModelError>();
            finalComment = comment;

            _commentRepository.EntityValidation(finalComment, out List<ModelError> errors);

            if (_knowledgeContentRepository.GetById(comment!.KnowledgeContentId) == null)
            {
                errors.Add(new ModelError(nameof(comment.KnowledgeContentId), "درخت دانش به درستی انتخاب نشده است"));
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

        #endregion private Methods

        #region KnowledgeContent
        public async Task<OperationResult<List<KnowledgeContentViewModel>>> GetNonStructuredKnowledgeContent(int? goalId = null, int? pageNo = null)
        {
            var userId = _accountService.GetUserId();

            #region Where

            var query = _knowledgeContentRepository.GetEntityAsNoTracking()
                                                    .Where(a => a.KnowledgeContentType == "NonStructured")
                                                    .AsQueryable();

            if (goalId != null)
            {
                query = query.Where(a => a.GoalId == goalId);
            }

            #endregion

            #region Paging and query populating

            var totalEntitiesCount = await query.CountAsync();
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore);

            query = _knowledgeContentRepository.GetAllAsNoTrackWithPagingAsync(paging, query)
                                               .Include(a => a.User);
            var tempRes = await query.ToListAsync();
            var result = _mapper.Map<List<KnowledgeContentViewModel>>(tempRes);

            #endregion

            #region Descriptions

            var tempTagRep = await (from q in _knowledgeContentTagRepository.GetEntityAsNoTracking()
                    .Where(s => s.EntityName == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId))
                                    join t in _tagRepository.GetAllAsNoTrackAsync() on q.TagId equals t.Id
                                    select new
                                    {
                                        q.TagId,
                                        q.EntityId,
                                        t.TagTitle,
                                        q.CreatedUserId
                                    }).ToListAsync();

            var tempLikeRepo = await _likeRepository.GetAllAsNoTrackAsync()
                                                    .Where(s => s.EntityType == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId)).ToListAsync();
            var tempAttachmentRepo = await _attachmentRepository.GetEntityAsNoTracking()
                                                                .Where(s => s.EntityName == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId)).ToListAsync();
            var goal = await _goalRepository.GetAllAsNoTrackAsync().FirstOrDefaultAsync(s => s.Id == goalId);
            var tempComRepo = _commentRepository.GetAllAsNoTrackAsync()
                .Where(s => result.Select(t => t.Id).Contains(s.KnowledgeContentId)).ToList();
            foreach (var res in result)
            {
                if (res.MentionUserIds != null)
                {
                    var tempMentionList = MentionJob.ExtractUserIdsFromString(res.MentionUserIds);
                    if (tempMentionList.Count > 0)
                    {
                        List<MentionViewModel> tempMentionViewModels = (from u in _userRepository.GetEntityAsNoTracking().Where(s => tempMentionList.Contains(s.Id))
                                                                        select new MentionViewModel
                                                                        {
                                                                            UserId = u.Id,
                                                                            FullName = u.FullName
                                                                        }).ToList();
                        res.Mentions = tempMentionViewModels;
                    }
                }

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

                res.GoalTitle = goal?.GoalTitle;
                res.CommentCount = tempComRepo.Count(s => s.KnowledgeContentId == res.Id);
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

            return new OperationResult<List<KnowledgeContentViewModel>>(true, result, "محتوای دانش شما با موفقیت ثبت شد.", new List<ModelError>(), paging);
        }

        public async Task<OperationResult<KnowledgeContentViewModel>> CreateKnowledgeContentStructured(CreateKnowledgeContentViewModel knowledgeContent)
        {
            var tempKnowledgeContent = _mapper.Map<KnowledgeContent>(knowledgeContent);
            tempKnowledgeContent.KnowledgeContentType = "Structured";

            //Validate KnowledgeContentViewModel
            if (!ValidateKnowledgeContent(tempKnowledgeContent, out _, out var errors, knowledgeContent.Tags, knowledgeContent.KnowledgeContentAttachments!))
            {
                return new OperationResult<KnowledgeContentViewModel>(false, null, "اشکال در ثبت محتوای دانش .", errors);
            }

            // Validate Attachments
            if (knowledgeContent.KnowledgeContentAttachments != null && knowledgeContent.KnowledgeContentAttachments.Any())
            {
                var validation = await _attachmentRepository.ValidateFile(knowledgeContent.KnowledgeContentAttachments.First(), _fileSettings);
                if (validation is { IsSuccess: false, ModelErrors: not null })
                    return new OperationResult<KnowledgeContentViewModel>(false, null, "فایل نامعتبر است.", validation.ModelErrors);
            }

            // tags
            var tempTags = knowledgeContent.Tags.Select(s => s.Trim().Replace("#", "")).ToList();
            var existingTags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var existingTagTitles = existingTags.Select(t => t.TagTitle).ToList();
            var newTagTitles = tempTags.Except(existingTagTitles).ToList();

            if (newTagTitles.Any())
            {
                var newTags = newTagTitles.Select(tagTitle => new Tag { TagTitle = tagTitle }).ToList();
                await _tagRepository.AddRangeAsync(newTags, true);
                existingTags.AddRange(newTags);
            }

            // محاسبه یوزرهایی که وجود ندارند
            if (knowledgeContent.MentionUserId != null && knowledgeContent.MentionUserId.Any())
            {
                var mentionUserIds = knowledgeContent.MentionUserId;
                var existingUsers = _userRepository.GetEntity(u => mentionUserIds.Contains(u.Id)).ToList();
                var existingUserIds = existingUsers.Select(u => u.Id).ToList();
                var newUserIds = mentionUserIds.Except(existingUserIds).ToList();

                if (newUserIds.Any())
                {
                    await _accountService.InsertNewUsers(newUserIds);
                }
            }

            //Mentions
            string? tempMentionIds = null;
            if (knowledgeContent.MentionUserId != null && knowledgeContent.MentionUserId.Any())
            {
                tempMentionIds = MentionJob.CreateMentionString(knowledgeContent.MentionUserId);
            }
            tempKnowledgeContent.MentionUserIds = tempMentionIds;

            // new KnowledgeContent
            var saveKnowledge = new KnowledgeContent()
            {
                UserId = _accountService.GetUserId(),
                GoalId = knowledgeContent.GoalId,
                References = knowledgeContent.References != null ? string.Join(",", knowledgeContent.References) : null,
                MentionUserIds = tempMentionIds,
                Title = knowledgeContent.Title!,
                Text = knowledgeContent.Text,
                Abstract = knowledgeContent.Abstract,
                KnowledgeContentType = "Structured",
                IsActive = true

            };
            await _knowledgeContentRepository.AddAsync(saveKnowledge, true);
            await _gamificationService.CalculateScores(new CalculateScoreViewModel()
            {
                Entity = saveKnowledge,
                ActionName = ActionNameGamificationEnum.Create,
                GroupName = GroupNameGamificationEnum.KnowledgeContent,
                SubGroupName = SubGroupNameGamificationEnum.StructuredKnowledgeContent
            }, true, true);
            // ثبت کاربران جدید
            var registeredUserIds = new List<int>();
            if (knowledgeContent.Users != null)
            {
                var existingUsers = await _userRepository.GetEntityAsNoTracking()
                    .Where(u => knowledgeContent.Users.Contains(u.Id))
                    .Select(u => u.Id)
                    .ToListAsync();


                var newUserIds = knowledgeContent.Users.Except(existingUsers).ToList();

                if (newUserIds.Any())
                {
                    await _accountService.InsertNewUsers(newUserIds);
                }

                foreach (var user in knowledgeContent.Users)
                {

                    var existingViewer = await _viewersRepository.GetEntityAsNoTracking()
                        .FirstOrDefaultAsync(v => v.UserId == user &&
                        v.EntityId == saveKnowledge.Id && v.Kind == "KnowledgeContent");

                    if (existingViewer == null)
                    {


                        var newUserViewer = new Viewers
                        {
                            UserId = user,
                            EntityId = saveKnowledge.Id,
                            Kind = "KnowledgeContent"
                        };
                        await _viewersRepository.AddAsync(newUserViewer, true);
                        registeredUserIds.Add(user);
                    }
                }
            }

            // ثبت واحدها
            var registeredUnitIds = new List<int>();
            if (knowledgeContent.Units != null)
            {
                foreach (var unitId in knowledgeContent.Units)
                {
                    var unit = await _unitRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(u => u.Id == unitId);

                    var existingViewer = await _viewersRepository.GetEntityAsNoTracking()
                        .FirstOrDefaultAsync(v => unit != null &&
                                                  v.UnitId == unit.IgtDepartmentId &&
                                                  v.EntityId == saveKnowledge.Id && v.Kind == "KnowledgeContent");

                    if (existingViewer == null)
                    {
                        var newUnitViewer = new Viewers
                        {
                            UnitId = unit?.IgtDepartmentId,
                            EntityId = saveKnowledge.Id,
                            Kind = "KnowledgeContent"
                        };
                        await _viewersRepository.AddAsync(newUnitViewer, true);
                        registeredUnitIds.Add(unitId);
                    }
                }
            }

            if (knowledgeContent.Users == null && knowledgeContent.Units == null)
            {
                saveKnowledge.IsGeneral = true;
            }
            if (knowledgeContent.KnowledgeContentAttachments != null && knowledgeContent.KnowledgeContentAttachments.Any())
            {
                await _attachmentRepository.SaveAttachments(knowledgeContent.KnowledgeContentAttachments, saveKnowledge.GetType().Name, saveKnowledge.Id, _fileSettings);
            }
            var tags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var knowledgeContentTags = tags.Select(tag => new KnowledgeContentTag()
            {
                EntityId = saveKnowledge.Id,
                EntityName = "KnowledgeContent",
                TagId = tag.Id,
            }).ToList();

            await _knowledgeContentTagRepository.AddRangeAsync(knowledgeContentTags, true);

            var result = new KnowledgeContentViewModel
            {
                Id = saveKnowledge.Id,
                Title = saveKnowledge.Title,
                Abstract = saveKnowledge.Abstract,
            };

            var notificationStatus = _notificationSender.SendNotification(new SendNotificationDto()
            {
                Entity = saveKnowledge,
                NotificationType = NotificationTypeEnum.KnowledgeContentStructureCreate,
                User = saveKnowledge.User,

            });

            return new OperationResult<KnowledgeContentViewModel>(true, result, "محتوای دانش شما با موفقیت ثبت شد.");
        }

        public async Task<OperationResult<KnowledgeContentViewModel>> CreateKnowledgeContentNonStructured(CreateKnowledgeContentViewModel knowledgeContent)
        {
            var tempKnowledgeContent = _mapper.Map<KnowledgeContent>(knowledgeContent);
            tempKnowledgeContent.KnowledgeContentType = "NonStructured";
            //if (knowledgeContent.KnowledgeContentAttachments == null || !knowledgeContent.KnowledgeContentAttachments.Any())
            //{
            //    return new OperationResult<KnowledgeContentViewModel>(false, null, "حداقل یک فایل باید ارسال شود.");
            //}
            if (!ValidateKnowledgeContent(tempKnowledgeContent, out _, out var errors, knowledgeContent.Tags, knowledgeContent.KnowledgeContentAttachments!))
            {
                return new OperationResult<KnowledgeContentViewModel>(false, null, "ایراد در فرمت ثبت محتوای دانش", errors);
            }

            // Validate Attachments
            if (knowledgeContent.KnowledgeContentAttachments != null && knowledgeContent.KnowledgeContentAttachments.Any())
            {
                var validation = await _attachmentRepository.ValidateFile(knowledgeContent.KnowledgeContentAttachments.First(), _fileSettings);
                if (validation is { IsSuccess: false, ModelErrors: not null })
                    return new OperationResult<KnowledgeContentViewModel>(false, null, "فایل نامعتبر است.", validation.ModelErrors);
            }

            // tags
            var tempTags = knowledgeContent.Tags.Select(s => s.Trim().Replace("#", "")).ToList();
            var existingTags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var existingTagTitles = existingTags.Select(t => t.TagTitle).ToList();
            var newTagTitles = tempTags.Except(existingTagTitles).ToList();

            if (newTagTitles.Any())
            {
                var newTags = newTagTitles.Select(tagTitle => new Tag { TagTitle = tagTitle }).ToList();
                await _tagRepository.AddRangeAsync(newTags, true);
                existingTags.AddRange(newTags);
            }

            // محاسبه یوزرهایی که وجود ندارند
            if (knowledgeContent.MentionUserId != null && knowledgeContent.MentionUserId.Any())
            {
                var mentionUserIds = knowledgeContent.MentionUserId;
                var existingUsers = _userRepository.GetEntity(u => mentionUserIds.Contains(u.Id)).ToList();
                var existingUserIds = existingUsers.Select(u => u.Id).ToList();
                var newUserIds = mentionUserIds.Except(existingUserIds).ToList();

                if (newUserIds.Any())
                {
                    await _accountService.InsertNewUsers(newUserIds);
                }
            }

            //Mentions
            string? tempMentionIds = null;
            if (knowledgeContent.MentionUserId != null && knowledgeContent.MentionUserId.Any())
            {
                tempMentionIds = MentionJob.CreateMentionString(knowledgeContent.MentionUserId);
            }
            tempKnowledgeContent.MentionUserIds = tempMentionIds;

            // new KnowledgeContent
            var saveKnowledge = new KnowledgeContent()
            {
                UserId = _accountService.GetUserId(),
                GoalId = knowledgeContent.GoalId,
                References = knowledgeContent.References != null ? string.Join(",", knowledgeContent.References) : null,
                MentionUserIds = tempMentionIds,
                Title = knowledgeContent.Title!,
                Text = knowledgeContent.Text,
                Abstract = knowledgeContent.Abstract,
                KnowledgeContentType = "NonStructured",
                IsActive = true
            };
            await _knowledgeContentRepository.AddAsync(saveKnowledge, true);

            // ثبت کاربران جدید
            var registeredUserIds = new List<int>();
            if (knowledgeContent.Users != null)
            {
                var existingUsers = await _userRepository.GetEntityAsNoTracking()
                    .Where(u => knowledgeContent.Users.Contains(u.Id))
                    .Select(u => u.Id)
                    .ToListAsync();


                var newUserIds = knowledgeContent.Users.Except(existingUsers).ToList();

                if (newUserIds.Any())
                {
                    await _accountService.InsertNewUsers(newUserIds);
                }

                foreach (var user in knowledgeContent.Users)
                {

                    var existingViewer = await _viewersRepository.GetEntityAsNoTracking()
                        .FirstOrDefaultAsync(v => v.UserId == user &&
                        v.EntityId == saveKnowledge.Id && v.Kind == "KnowledgeContent");

                    if (existingViewer == null)
                    {


                        var newUserViewer = new Viewers
                        {
                            UserId = user,
                            EntityId = saveKnowledge.Id,
                            Kind = "KnowledgeContent"
                        };
                        await _viewersRepository.AddAsync(newUserViewer, true);
                        registeredUserIds.Add(user);
                    }
                }
            }

            // ثبت واحدها
            var registeredUnitIds = new List<int>();
            if (knowledgeContent.Units != null)
            {
                foreach (var unitId in knowledgeContent.Units)
                {
                    var unit = await _unitRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(u => u.Id == unitId);

                    var existingViewer = await _viewersRepository.GetEntityAsNoTracking()
                        .FirstOrDefaultAsync(v => unit != null &&
                                                  v.UnitId == unit.IgtDepartmentId &&
                                                  v.EntityId == saveKnowledge.Id && v.Kind == "KnowledgeContent");

                    if (existingViewer == null)
                    {
                        var newUnitViewer = new Viewers
                        {
                            UnitId = unit?.IgtDepartmentId,
                            EntityId = saveKnowledge.Id,
                            Kind = "KnowledgeContent"
                        };
                        await _viewersRepository.AddAsync(newUnitViewer, true);
                        registeredUnitIds.Add(unitId);
                    }
                }
            }

            if (knowledgeContent.Users == null && knowledgeContent.Units == null)
            {
                saveKnowledge.IsGeneral = true;
            }

            if (knowledgeContent.KnowledgeContentAttachments != null && knowledgeContent.KnowledgeContentAttachments.Any())
            {
                await _attachmentRepository.SaveAttachments(knowledgeContent.KnowledgeContentAttachments, saveKnowledge.GetType().Name, saveKnowledge.Id, _fileSettings);
            }
            var tags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var knowledgeContentTags = tags.Select(tag => new KnowledgeContentTag()
            {
                EntityId = saveKnowledge.Id,
                EntityName = "KnowledgeContent",
                TagId = tag.Id,
            }).ToList();

            await _knowledgeContentTagRepository.AddRangeAsync(knowledgeContentTags, true);

            await _gamificationService.CalculateScores(new CalculateScoreViewModel()
            {
                Entity = saveKnowledge,
                ActionName = ActionNameGamificationEnum.Create,
                GroupName = GroupNameGamificationEnum.KnowledgeContent,
                SubGroupName = SubGroupNameGamificationEnum.NonStructuredKnowledgeContent
            }, true, true);

            var result = new KnowledgeContentViewModel
            {
                Id = saveKnowledge.Id,
                Title = saveKnowledge.Title,
                Abstract = saveKnowledge.Abstract,
            };

            var notificationStatus = _notificationSender.SendNotification(
                new SendNotificationDto
                {
                    Entity = saveKnowledge,
                    NotificationType = NotificationTypeEnum.KnowledgeContentStructureCreate,
                    User = saveKnowledge.User,

                });
            return new OperationResult<KnowledgeContentViewModel>(true, result, "محتوای دانش شما با موفقیت ثبت شد.");
        }

        public async Task<OperationResult<KnowledgeContentViewModel>> ChangeKnowledgeContentType(ChangeKnowledgeContentTypeViewModel model)
        {

            var knowledgeContent = _knowledgeContentRepository.GetById(model.KnowledgeContentId);
            if (knowledgeContent == null)
            {
                return new OperationResult<KnowledgeContentViewModel>(false, null, "محتوا یافت نشد.");
            }

            if (knowledgeContent.KnowledgeContentType != "NonStructured")
            {
                return new OperationResult<KnowledgeContentViewModel>(false, null, "محتوا از نوع NonStructured نیست.");
            }

            knowledgeContent.Title = model.Title.Trim();
            knowledgeContent.Abstract = model.Abstract.Trim();
            knowledgeContent.Text = model.Text.Trim();
            knowledgeContent.KnowledgeContentType = "Structured";

            var isAttachment = await _attachmentRepository.GetEntityAsNoTracking().AnyAsync(s =>
                s.EntityId == knowledgeContent.Id && s.EntityName == "KnowledgeContent");

            if (!ValidateKnowledgeContent(knowledgeContent, out var finalKnowledgeContent, out var modelErrors, model.Tags, model.KnowledgeContentAttachments))
            {
                return new OperationResult<KnowledgeContentViewModel>(false, null, "اعتبارسنجی ناموفق بود.", modelErrors);
            }
            if (model.KnowledgeContentAttachments != null)
            {
                var validation = await _attachmentRepository.ValidateFile(model.KnowledgeContentAttachments.First(), _fileSettings);
                if (validation is { IsSuccess: false, ModelErrors: not null })
                    return new OperationResult<KnowledgeContentViewModel>(false, null, "Invalid file", validation.ModelErrors);
            }

            var tempTags = model.Tags.Select(s => s.Trim().Replace("#", "")).ToList();
            var existingTags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var existingTagTitles = existingTags.Select(t => t.TagTitle).ToList();
            var newTagTitles = tempTags.Except(existingTagTitles).ToList();

            if (newTagTitles.Any())
            {
                var newTags = newTagTitles.Select(tagTitle => new Tag { TagTitle = tagTitle }).ToList();
                await _tagRepository.AddRangeAsync(newTags, true);
                existingTags.AddRange(newTags);
            }

            string? tempMentionIds = null;
            if (model.MentionUserId != null && model.MentionUserId.Any())
            {
                tempMentionIds = MentionJob.CreateMentionString(model.MentionUserId);
            }
            knowledgeContent.MentionUserIds = tempMentionIds;

            knowledgeContent.References = model.References != null ? string.Join(",", model.References) : null;

            if (model.KnowledgeContentAttachments != null && model.KnowledgeContentAttachments.Any())
            {
                await _attachmentRepository.DeleteRangeAsync(
                    _attachmentRepository.GetEntity(a => a.EntityId == knowledgeContent.Id && a.EntityName == nameof(KnowledgeContent)).ToList(),
                    hardDelete: false,
                    saveNow: true
                );
                await _attachmentRepository.SaveAttachments(model.KnowledgeContentAttachments, knowledgeContent.GetType().Name, knowledgeContent.Id, _fileSettings);
            }

            knowledgeContent.KnowledgeContentType = "Structured";
            await _knowledgeContentRepository.UpdateAsync(knowledgeContent, true);

            var tags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var knowledgeContentTags = tags.Select(tag => new KnowledgeContentTag()
            {
                EntityId = knowledgeContent.Id,
                EntityName = "KnowledgeContent",
                TagId = tag.Id,
            }).ToList();

            await _knowledgeContentTagRepository.DeleteRangeAsync(
                _knowledgeContentTagRepository.GetEntity(kt => kt.EntityId == knowledgeContent.Id && kt.EntityName == nameof(KnowledgeContent)).ToList(),
                hardDelete: false,
                saveNow: true
            );
            await _knowledgeContentTagRepository.AddRangeAsync(knowledgeContentTags, true);

            var result = new KnowledgeContentViewModel
            {
                Id = knowledgeContent.Id,
                Title = knowledgeContent.Title,
                Abstract = knowledgeContent.Abstract,
            };
            if (isAttachment)
            {
                await _gamificationService.CalculateScores(new CalculateScoreViewModel()
                {
                    Entity = knowledgeContent,
                    ActionName = ActionNameGamificationEnum.Change,
                    GroupName = GroupNameGamificationEnum.KnowledgeContent,
                    SubGroupName = SubGroupNameGamificationEnum.ChangeKnowledgeContent
                });
            }

            if (!isAttachment)
            {
                await _gamificationService.CalculateScores(new CalculateScoreViewModel()
                {
                    Entity = knowledgeContent,
                    ActionName = ActionNameGamificationEnum.ChangeAttach,
                    GroupName = GroupNameGamificationEnum.KnowledgeContent,
                    SubGroupName = SubGroupNameGamificationEnum.ChangeKnowledgeContent
                });
            }
          
            var notificationStatus = _notificationSender.SendNotification(new SendNotificationDto()
            {
                Entity = knowledgeContent,
                NotificationType = NotificationTypeEnum.ChanheKnowledgeContentToStructured,
                User = knowledgeContent.User,
            });
            return new OperationResult<KnowledgeContentViewModel>(true, result, "نوع محتوای دانشی با موفقیت تغییر یافت.");
        }

        public async Task<OperationResult<ViewerViewModel>> ConfirmKnowledgeContent(ConfirmKnowledgeContentViewModel model)

        {
            var errors = new List<ModelError>();

            var userId = _accountService.GetUserId();
            var myUser = await _userRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            var fullName = myUser?.FullName;

            var knowledgeContent = await _knowledgeContentRepository.GetEntityAsNoTracking(false)
                .FirstOrDefaultAsync(p => p.Id == model.EntityId);
            if (knowledgeContent == null)
            {
                errors.Add(new ModelError("EntityIdNotFound", "محتوای دانشی با این شناسه وجود ندارد."));
                return new OperationResult<ViewerViewModel>(false, null, "محتوای دانشی با این شناسه یافت نشد.", errors);
            }

            var existingAdmin = await _adminRepository.GetEntityAsNoTracking()
           .FirstOrDefaultAsync(a => a.UserId == userId && a.Kind == "KnowledgeContent");
            if (existingAdmin == null)
            {
                return new OperationResult<ViewerViewModel>(false, null, $"کاربر {fullName} ادمین محتوای دانش نمی باشد.");
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
                        v.EntityId == model.EntityId && v.Kind == "KnowledgeContent");

                    if (existingViewer != null)
                    {
                        errors.Add(new ModelError("Duplicate", $"کاربر با شناسه {userId} تکراری است."));
                        continue;
                    }

                    var newUserViewer = new Viewers
                    {
                        UserId = user,
                        EntityId = model.EntityId,
                        Kind = "KnowledgeContent"
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
                        .FirstOrDefaultAsync(v => v.UnitId == unit.IgtDepartmentId &&
                        v.EntityId == model.EntityId && v.Kind == "KnowledgeContent");

                    if (existingViewer != null)
                    {
                        errors.Add(new ModelError("Duplicate", $"واحد با شناسه {unitId} تکراری است."));
                        continue;
                    }
                    var newUnitViewer = new Viewers
                    {
                        UnitId = unit.IgtDepartmentId,
                        EntityId = model.EntityId,
                        Kind = "KnowledgeContent"
                    };
                    await _viewersRepository.AddAsync(newUnitViewer, true);
                    registeredUnitIds.Add(unitId);
                }
            }


            knowledgeContent.IsActive = true;
            if (model.GoalId != null)
            {
                knowledgeContent.GoalId = (int)model.GoalId;
            }
            if (!string.IsNullOrEmpty(model.Title))
            {
                knowledgeContent.Title = model.Title;
            }
            if (!string.IsNullOrEmpty(model.Abstract))
            {
                knowledgeContent.Abstract = model.Abstract;
            }
            if (!string.IsNullOrEmpty(model.Text))
            {
                knowledgeContent.Text = model.Text;
            }
            await _knowledgeContentRepository.UpdateAsync(knowledgeContent, true);

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

                Kind = "محتوای دانشی"


            };
            return new OperationResult<ViewerViewModel>(true, viewerViewModel, " با موفقیت تایید شد");

        }

        public async Task<List<int>> GetAllowableKnowledgeContentViewer(int userId)
        {
            List<int> allowableEntityIds;
            if (await (from u in _userRepository.GetEntityAsNoTracking()
                    where u.Id == userId
                    select u.IsBranchEmploye).FirstOrDefaultAsync())
            {
                allowableEntityIds = await (from v in _viewersRepository.GetEntityAsNoTracking()
                    where (v.UserId == (int?)userId || v.UnitId == (int?)_branchEmploye.UnitId) && v.IsActive && !v.IsDeleted && v.Kind == "KnowledgeContent"
                    select v.EntityId).Distinct().ToListAsync();
            }
            else 
            {
                int unitId = await _unitService.GetIgtUnitIdByUserId(userId);
                allowableEntityIds = await (from v in _viewersRepository.GetEntityAsNoTracking()
                    where (v.UserId == (int?)userId || (unitId != -1 && v.UnitId == (int?)unitId)) && v.IsActive && !v.IsDeleted && v.Kind == "KnowledgeContent"
                    select v.EntityId).Distinct().ToListAsync();
            }
            return allowableEntityIds;


        }

        public async Task<OperationResult<List<KnowledgeContentViewModel>>> GetKnowledgeContent(KnowledgeContentTypeEnum knowledgeContentFilter, string? searchText = null
            , int? goalId = null, int? pageNo = null)
        {
            var userId = _accountService.GetUserId();
           
            var IsBranchEmployeUser = await (from u in _userRepository.GetEntityAsNoTracking()
                where u.Id == userId
                select u.IsBranchEmploye).FirstOrDefaultAsync();

            #region Where

            var query = _knowledgeContentRepository.GetEntityAsNoTracking().AsQueryable();

            if (goalId != null)
            {
                query = query.Where(a => a.GoalId == goalId);
            }
            var allowableEntityIds = await GetAllowableKnowledgeContentViewer(userId);
            switch (knowledgeContentFilter)
            {
                case KnowledgeContentTypeEnum.All:
                    query = ((!IsBranchEmployeUser) ? query.Where((KnowledgeContent a) => a.IsGeneral || allowableEntityIds.Contains(a.Id)) : query.Where((KnowledgeContent a) => allowableEntityIds.Contains(a.Id)));
                    break;
                case KnowledgeContentTypeEnum.Structured:
                    query = ((!IsBranchEmployeUser) ? query.Where((KnowledgeContent a) => a.KnowledgeContentType == "Structured" && (a.IsGeneral || allowableEntityIds.Contains(a.Id))) : query.Where((KnowledgeContent a) => a.KnowledgeContentType == "Structured" && allowableEntityIds.Contains(a.Id)));
                    break;
                case KnowledgeContentTypeEnum.NonStructured:
                    query = ((!IsBranchEmployeUser) ? query.Where((KnowledgeContent a) => a.KnowledgeContentType == "NonStructured" && (a.IsGeneral || allowableEntityIds.Contains(a.Id))) : query.Where((KnowledgeContent a) => a.KnowledgeContentType == "NonStructured" && allowableEntityIds.Contains(a.Id)));
                    break;
                case KnowledgeContentTypeEnum.MyKnowledgeContent:
                    query = query.Where((KnowledgeContent a) => a.UserId == userId);
                    break;
                case KnowledgeContentTypeEnum.MentionedKnowledgeContent:
                    query = query.Where((KnowledgeContent a) => a.MentionUserIds != null && a.MentionUserIds!.Contains(MentionJob.CreateMentionString(new List<int> { userId })));
                    break;
                case KnowledgeContentTypeEnum.ExpertConfirm:
                {
                    List<int> expertGoals = await (from a in _processProfessionalRepository.GetAllAsNoTrackAsync((ProcessProfessional a) => a.UserId == userId && a.Kind == "Expert", null, null)
                        select a.GoalId).ToListAsync();
                    query = query.Where((KnowledgeContent a) => expertGoals.Contains(a.GoalId));
                    break;
                }
                default:
                    query = query;
                    break;
            }

            if (searchText != null)
            {
                query = query.Where(a => EF.Functions.Like(a.Text, $"%{searchText}%")
                                         || EF.Functions.Like(a.Abstract, $"%{searchText}%")
                                         || EF.Functions.Like(a.Title, $"%{searchText}%"));
            }
            // اجرای کوئری و شمارش کل موجودیت‌ها
            var totalEntities = await query.CountAsync();
            if (totalEntities == 0)
            {
                // بازگشت یک نتیجه خالی اگر هیچ رکوردی با شرایط مطابقت نداشت
                return new OperationResult<List<KnowledgeContentViewModel>>(true, new List<KnowledgeContentViewModel>(), "هیچ محتوای دانشی پیدا نشد.", new List<ModelError>(), null);
            }
            #endregion

            #region Paging and query populating

            var totalEntitiesCount = await query.CountAsync();
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore);

            query = _knowledgeContentRepository.GetAllAsNoTrackWithPagingAsync(paging, query)
                .Include(a => a.User);

            var tempRes = await query.ToListAsync();
            var result = _mapper.Map<List<KnowledgeContentViewModel>>(tempRes);

            #endregion

            #region Descriptions

            var tempTagRep = (from q in _knowledgeContentTagRepository.GetEntityAsNoTracking().Where(s => s.EntityName == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId))
                              join t in _tagRepository.GetAllAsNoTrackAsync() on q.TagId equals t.Id
                              select new
                              {
                                  q.TagId,
                                  q.EntityId,
                                  t.TagTitle,
                                  q.CreatedUserId
                              }).ToList();

            var tempLikeRepo = _likeRepository.GetAllAsNoTrackAsync()
                .Where(s => s.EntityType == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();

            var tempPageViewRepo = _pageViewRepository.GetAllAsNoTrackAsync()
                .Where(s => s.EntityType == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();


            var tempAttachmentRepo = _attachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempGoalRepo = _goalRepository.GetAllAsNoTrackAsync().Where(s => result.Select(t => t.GoalId).Contains(s.Id)).ToList();
            var tempComRepo = _commentRepository.GetAllAsNoTrackAsync()
                .Where(s => result.Select(t => t.Id).Contains(s.KnowledgeContentId)).ToList();
            foreach (var res in result)
            {
                if (res.MentionUserIds != null)
                {
                    var tempMentionList = MentionJob.ExtractUserIdsFromString(res.MentionUserIds);
                    if (tempMentionList.Count > 0)
                    {
                        List<MentionViewModel> tempMentionViewModels = (from u in _userRepository.GetEntityAsNoTracking().Where(s => tempMentionList.Contains(s.Id))
                                                                        select new MentionViewModel
                                                                        {
                                                                            UserId = u.Id,
                                                                            FullName = u.FullName
                                                                        }).ToList();
                        res.Mentions = tempMentionViewModels;
                    }
                }

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
                res.CommentCount = tempComRepo.Count(s => s.KnowledgeContentId == res.Id);
                res.LikeCount = tempLikeRepo.Count(s => s.EntityId == res.Id);
                res.PageViewCount = tempPageViewRepo.Count(s => s.EntityId == res.Id);
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

            #region Gamification

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                var gamificationData = new CalculateScoreViewModel
                {
                    GroupName = GroupNameGamificationEnum.KnowledgeContent,
                    ActionName = ActionNameGamificationEnum.Search,
                    SearchText = searchText
                };
                await _gamificationService.CalculateScores(gamificationData);
            }
            #endregion Gamification

            return new OperationResult<List<KnowledgeContentViewModel>>(true, result, "لیست تولید محتوای دانشی شما", new List<ModelError>(), paging);
        }

        public async Task<OperationResult<List<KnowledgeContentViewModel>>> GetAllKnowledgeContentForAdmin(
            string? searchText = null, int? goalId = null, int? pageNo = null)
        {
            var userId = _accountService.GetUserId();

            #region Where

            var query = _knowledgeContentRepository
                .GetAllEntityAsNoTracking().AsQueryable();

            if (goalId != null)
            {
                query = query.Where(a => a.GoalId == goalId);
            }

            if (searchText != null)
            {
                query = query.Where(a => EF.Functions.Like(a.Text, $"%{searchText}%")
                                         || EF.Functions.Like(a.Abstract, $"%{searchText}%")
                                         || EF.Functions.Like(a.Title, $"%{searchText}%"));
            }
            // اجرای کوئری و شمارش کل موجودیت‌ها
            var totalEntities = await query.CountAsync();
            if (totalEntities == 0)
            {
                // بازگشت یک نتیجه خالی اگر هیچ رکوردی با شرایط مطابقت نداشت
                return new OperationResult<List<KnowledgeContentViewModel>>(true, new List<KnowledgeContentViewModel>(), "هیچ محتوای دانشی پیدا نشد.", new List<ModelError>(), null);
            }
            #endregion

            #region Paging and query populating

            var totalEntitiesCount = await query.CountAsync();
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore);


            query = _knowledgeContentRepository.AllAsNoTrackWithPagingAsync(paging, query)
                .Include(a => a.User);

            var tempRes = await query.ToListAsync();
            var result = _mapper.Map<List<KnowledgeContentViewModel>>(tempRes);

            #endregion

            #region Descriptions

            var tempTagRep = (from q in _knowledgeContentTagRepository.GetEntityAsNoTracking().Where(s => s.EntityName == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId))
                              join t in _tagRepository.GetAllAsNoTrackAsync() on q.TagId equals t.Id
                              select new
                              {
                                  q.TagId,
                                  q.EntityId,
                                  t.TagTitle,
                                  q.CreatedUserId
                              }).ToList();

            var tempLikeRepo = _likeRepository.GetAllAsNoTrackAsync()
                .Where(s => s.EntityType == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempAttachmentRepo = _attachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempGoalRepo = _goalRepository.GetAllAsNoTrackAsync().Where(s => result.Select(t => t.GoalId).Contains(s.Id)).ToList();
            var tempComRepo = _commentRepository.GetAllAsNoTrackAsync()
                .Where(s => result.Select(t => t.Id).Contains(s.KnowledgeContentId)).ToList();
            var expertConfirms = await _knowledgeContentExpertConfirmRepository.GetEntityAsNoTracking()
                .Where(ec => result.Select(r => r.Id).Contains(ec.KnowledgeContentId))
                .ToListAsync();
            foreach (var res in result)
            {
                if (res.MentionUserIds != null)
                {
                    var tempMentionList = MentionJob.ExtractUserIdsFromString(res.MentionUserIds);
                    if (tempMentionList.Count > 0)
                    {
                        List<MentionViewModel> tempMentionViewModels = (from u in _userRepository.GetEntityAsNoTracking().Where(s => tempMentionList.Contains(s.Id))
                                                                        select new MentionViewModel
                                                                        {
                                                                            UserId = u.Id,
                                                                            FullName = u.FullName
                                                                        }).ToList();
                        res.Mentions = tempMentionViewModels;
                    }
                }

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
                res.CommentCount = tempComRepo.Count(s => s.KnowledgeContentId == res.Id);
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
                // اضافه کردن مقدار IsConfirmed
                var confirmation = expertConfirms.FirstOrDefault(ec => ec.KnowledgeContentId == res.Id);
                res.IsConfirm = confirmation?.IsConfirmed ?? false;
            }

            #endregion

            return new OperationResult<List<KnowledgeContentViewModel>>(true, result, "لیست تولید محتوای دانشی شما", new List<ModelError>(), paging);

        }


        public async Task<OperationResult<List<KnowledgeContentViewModel>>> GetAwaitingConfirmationKnowledgeContent(int? pageNo = null)
        {
            var userId = _accountService.GetUserId();

            var goalIds = await _processProfessionalRepository.GetEntityAsNoTracking()
                .Where(p => p.UserId == userId)
                .Select(p => p.GoalId)
                .ToListAsync();

            if (!goalIds.Any())
            {
                return new OperationResult<List<KnowledgeContentViewModel>>(true, new List<KnowledgeContentViewModel>(), "هیچ GoalId ای برای کاربر یافت نشد", new List<ModelError>(), null);
            }


            var query = _knowledgeContentRepository.GetAllEntityAsNoTracking()
                .Where(k => goalIds.Contains(k.GoalId) &&
                            k.KnowledgeContentType == "Structured");


            var totalEntitiesCount = await query.CountAsync();
            if (totalEntitiesCount == 0)
            {
                return new OperationResult<List<KnowledgeContentViewModel>>(true, new List<KnowledgeContentViewModel>(), "هیچ محتوای دانشی پیدا نشد.", new List<ModelError>(), null);
            }


            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore);
            query = _knowledgeContentRepository.AllAsNoTrackWithPagingAsync(paging, query)
                .Include(a => a.User);

            var tempRes = await query.ToListAsync();
            var result = _mapper.Map<List<KnowledgeContentViewModel>>(tempRes);

            #region Descriptions

            var tempTagRep = (from q in _knowledgeContentTagRepository.GetEntityAsNoTracking().Where(s => s.EntityName == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId))
                              join t in _tagRepository.GetAllAsNoTrackAsync() on q.TagId equals t.Id
                              select new
                              {
                                  q.TagId,
                                  q.EntityId,
                                  t.TagTitle,
                                  q.CreatedUserId
                              }).ToList();

            var tempLikeRepo = _likeRepository.GetAllAsNoTrackAsync()
                .Where(s => s.EntityType == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempAttachmentRepo = _attachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "KnowledgeContent" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempGoalRepo = _goalRepository.GetAllAsNoTrackAsync().Where(s => result.Select(t => t.GoalId).Contains(s.Id)).ToList();
            var tempComRepo = _commentRepository.GetAllAsNoTrackAsync()
                .Where(s => result.Select(t => t.Id).Contains(s.KnowledgeContentId)).ToList();
            var expertConfirms = await _knowledgeContentExpertConfirmRepository.GetEntityAsNoTracking()
                .Where(ec => result.Select(r => r.Id).Contains(ec.KnowledgeContentId))
                .ToListAsync();
            foreach (var res in result)
            {
                if (res.MentionUserIds != null)
                {
                    var tempMentionList = MentionJob.ExtractUserIdsFromString(res.MentionUserIds);
                    if (tempMentionList.Count > 0)
                    {
                        List<MentionViewModel> tempMentionViewModels = (from u in _userRepository.GetEntityAsNoTracking().Where(s => tempMentionList.Contains(s.Id))
                                                                        select new MentionViewModel
                                                                        {
                                                                            UserId = u.Id,
                                                                            FullName = u.FullName
                                                                        }).ToList();
                        res.Mentions = tempMentionViewModels;
                    }
                }

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
                res.CommentCount = tempComRepo.Count(s => s.KnowledgeContentId == res.Id);
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
                // اضافه کردن مقدار IsConfirmed
                //var confirmation = expertConfirms.FirstOrDefault(ec => ec.KnowledgeContentId == res.Id);
                //res.IsConfirm = confirmation?.IsConfirmed ?? false;

                // تایید محتوای دانشی برای کاربر جاری
                var confirmation = expertConfirms.FirstOrDefault(ec => ec.KnowledgeContentId == res.Id && ec.ExpertUserId == userId);
                res.IsConfirm = confirmation?.IsConfirmed ?? false;
            }

            #endregion

            return new OperationResult<List<KnowledgeContentViewModel>>(true, result, "لیست تولید محتوای دانشی شما", new List<ModelError>(), paging);


        }
        public async Task<OperationResult<PrintKnowledgeContentViewModel>> PrintStructuredKnowledgeContent(int knowledgeContentId)
        {
            var userId = _accountService.GetUserId();

            var knowledgeContent = await _knowledgeContentRepository.GetEntityAsNoTracking()
                                  .Include(k => k.User)
                                  .FirstOrDefaultAsync(k => k.Id == knowledgeContentId);
            if (knowledgeContent == null)
                return new OperationResult<PrintKnowledgeContentViewModel>(false, null!, "رکوردی یافت نشد");

            if (knowledgeContent.KnowledgeContentType == "NonStructured")
                return new OperationResult<PrintKnowledgeContentViewModel>(false, null!, "تنها محتوای ساختاریافته امکان چاپ دارند");

            var result = _mapper.Map<PrintKnowledgeContentViewModel>(knowledgeContent);



            result.Attachments = await _attachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "KnowledgeContent" && s.EntityId == knowledgeContentId)
                .Select(s => new AttachmentViewModel
                {
                    Address = s.Address,
                    Name = s.Name!,
                    Id = s.Id
                }).ToListAsync();


            result.Tags = await _knowledgeContentTagRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityId == knowledgeContentId && s.EntityName == "KnowledgeContent")
                .Join(_tagRepository.GetEntityAsNoTracking(), qt => qt.TagId, t => t.Id, (qt, t) => new TagsViewModel
                {
                    TagTitle = t.TagTitle,
                }).ToListAsync();


            if (!string.IsNullOrEmpty(knowledgeContent.References))
            {
                result.References = string.Join(" - ", knowledgeContent.References.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries));
            }

            var goal = await _goalRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(g => g.Id == result.GoalId);
            result.GoalTitle = goal?.GoalTitle;

            return new OperationResult<PrintKnowledgeContentViewModel>(true, result, nameof(KnowledgeContent) + $" رکورد {knowledgeContentId} ");
        }


        public async Task<OperationResult<KnowledgeContentViewModel>> GetKnowledgeContentById(int knowledgeContentId)
        {
            var userId = _accountService.GetUserId();

            var knowledgeContent = await _knowledgeContentRepository.GetEntityAsNoTracking()
                                  .Include(k => k.User)
                                  .FirstOrDefaultAsync(k => k.Id == knowledgeContentId);
            if (knowledgeContent == null)
                return new OperationResult<KnowledgeContentViewModel>(false, null!, "رکوردی یافت نشد");
            var result = _mapper.Map<KnowledgeContentViewModel>(knowledgeContent);


            // Attachments
            result.Attachments = await _attachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "KnowledgeContent" && s.EntityId == knowledgeContentId)
                .Select(s => new AttachmentViewModel
                {
                    Address = s.Address,
                    Id = s.Id
                }).ToListAsync();

            // Tags
            result.Tags = await _knowledgeContentTagRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityId == knowledgeContentId && s.EntityName == "KnowledgeContent")
                .Join(_tagRepository.GetEntityAsNoTracking(), qt => qt.TagId, t => t.Id, (qt, t) => new TagsViewModel
                {
                    TagTitle = t.TagTitle,
                    CreatedUserId = t.CreatedUserId!
                }).ToListAsync();


            // Mentions
            var mentionUserIds = result.MentionUserIds?
                .Split(new[] { "__,__" }, StringSplitOptions.RemoveEmptyEntries)
                .Select(id => int.Parse(id.Replace("__", "")))
                .ToList();

            if (mentionUserIds != null)
            {
                result.Mentions = await _userRepository.GetEntityAsNoTracking()
                    .Where(u => mentionUserIds.Contains(u.Id))
                    .Select(u => new MentionViewModel
                    {
                        UserId = u.Id,
                        FullName = u.FullName
                    }).ToListAsync();
            }

            // محاسبه تعداد لایک‌ها
            result.LikeCount = await _likeRepository.GetEntityAsNoTracking()
                .CountAsync(s => s.EntityType == "KnowledgeContent" && s.EntityId == knowledgeContentId);

            // بررسی اینکه آیا کاربر فعلی این سوال را لایک کرده است یا خیر
            result.IsLiked = await _likeRepository.GetEntityAsNoTracking()
                .AnyAsync(s => s.EntityType == "KnowledgeContent" && s.EntityId == knowledgeContentId && s.UserId == userId);
            var goal = await _goalRepository.GetEntityAsNoTracking().FirstOrDefaultAsync(g => g.Id == result.GoalId);
            result.GoalTitle = goal?.GoalTitle;

            return new OperationResult<KnowledgeContentViewModel>(true, result, nameof(KnowledgeContent) + $" رکورد {knowledgeContentId} ");
        }

        public async Task<OperationResult<LikeViewModel>> LikeKnowledgeContent(LikeViewModel qaLikeViewModel)
        {

            var errors = new List<ModelError>();
            var tempLike = _mapper.Map<Like>(qaLikeViewModel);

            if (qaLikeViewModel == null)
            {
                return new OperationResult<LikeViewModel>(false, null, nameof(Like) + " did not created.", errors);
            }

            if (!Enum.IsDefined(typeof(LikeEntityType), tempLike.EntityType))
            {
                var str = $"پارامتر نوع باید باید از نوع : {LikeEntityType.KnowledgeContent} باشد";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }

            if (_userRepository.GetById(tempLike.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            if (tempLike.EntityType == LikeEntityType.KnowledgeContent.ToString())
            {
                if (_knowledgeContentRepository.GetById(tempLike.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "پاسخ به درستی انتخاب نشده است"));
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
                GroupName = GroupNameGamificationEnum.KnowledgeContent,
                ActionName = ActionNameGamificationEnum.Like,
                Entity = tempLike
            };
            await _gamificationService.CalculateScores(gamificationData);

            var knowledgeContent = _knowledgeContentRepository.GetEntityAsNoTracking()
                .Include(s => s.User)
                .Include(s => s.Goal)
                .FirstOrDefault(s => s.Id == tempLike.EntityId);
            if (knowledgeContent != null)
            {
                var expertUserIds = await _processProfessionalRepository
                .GetEntity(p => p.Kind == "Expert" && p.GoalId == knowledgeContent.GoalId)
                .Select(p => p.UserId)
                .ToListAsync();

                var likeCountExpert = await _likeRepository
                    .GetEntity(a => a.EntityType == tempLike.EntityType
                                    && a.EntityId == tempLike.EntityId
                                    && expertUserIds.Contains(a.UserId))
                    .CountAsync();

                var lastLikeExpert = await _likeRepository
                    .GetEntity(a => a.EntityType == tempLike.EntityType
                                    && a.EntityId == tempLike.EntityId
                                    && expertUserIds.Contains(a.UserId))
                    .OrderByDescending(a => a.CreatedDate)
                    .Select(a => a.Id)
                    .FirstOrDefaultAsync();

                if (likeCountExpert == 2 && tempLike.Id == lastLikeExpert && knowledgeContent.KnowledgeContentType== "NonStructured")
                {
                    _notificationSender.SendNotification(new SendNotificationDto
                    {
                        Entity = knowledgeContent,
                        NotificationType = NotificationTypeEnum.ExpertLikeKnowledgeContent,
                        User = knowledgeContent.User
                    });
                }

                if (await _likeRepository.GetEntity(a => a.EntityType == tempLike.EntityType &&
                                                         a.EntityId == tempLike.EntityId).CountAsync() == 10 
                    && await _knowledgeContentExpertConfirmRepository.GetEntityAsNoTracking().AnyAsync(s => s.KnowledgeContentId == knowledgeContent.Id && s.IsExpert))
                {
                    var trackedKnowledgeContent = await _knowledgeContentRepository.GetEntity().FirstOrDefaultAsync(s => s.Id == tempLike.EntityId);
                    if (trackedKnowledgeContent != null)
                    {
                        trackedKnowledgeContent.IsOfficial = true;
                        trackedKnowledgeContent.KnowledgeContentType = "Official";
                        await _knowledgeContentRepository.UpdateAsync(trackedKnowledgeContent, saveNow: true);
                        await _gamificationService.CalculateScores(new CalculateScoreViewModel
                        {
                            Entity = trackedKnowledgeContent,
                            ActionName = ActionNameGamificationEnum.Official,
                            GroupName = GroupNameGamificationEnum.KnowledgeContent,
                            SubGroupName = SubGroupNameGamificationEnum.OfficialKnowledgeContent
                        });
                    }
                    await HandleOfficialContentCount(knowledgeContent);
                }
            }
            return new OperationResult<LikeViewModel>(true, qaLikeViewModel, nameof(Like) + " لایک با موفقیت ایجاد شد.");
        }

        public async Task<OperationResult<LikeViewModel>> UnLikeKnowledgeContent(LikeViewModel qaLikeViewModel)
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
                string str = $"پارامتر نوع باید از نوع : {LikeEntityType.KnowledgeContent} باشد";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }

            if (_userRepository.GetById(qaLikeViewModel.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            if (qaLikeViewModel.EntityType == LikeEntityEnum.KnowledgeContent)
            {
                if (_knowledgeContentRepository.GetById(qaLikeViewModel.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "پاسخ به درستی انتخاب نشده است"));
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
                GroupName = GroupNameGamificationEnum.KnowledgeContent

            });

            return new OperationResult<LikeViewModel>(true, qaLikeViewModel, nameof(Like) + " حذف لایک با موفقیت انجام شد");
        }

        public async Task<OperationResult<List<UserViewModel>>> GetUsersViewerKnowledgeContent(int id)
        {
            var users = (await (from s in _viewersRepository.GetEntityAsNoTracking()
                where s.EntityId == id && s.UnitId == null
                select s).Include(s => s.User).ToListAsync()).Select(item => new UserViewModel
            {
                FullName = item.User?.FullName,
                IgtUserId = Convert.ToInt32(item.User?.IgtUserId),
                Id = (item.User?.Id).Value,
                UserName = item.User!.UserName
            }).ToList();


            return new OperationResult<List<UserViewModel>>(true, users, "لیست افرادی که این محتوای دانشی را میتوانند ببینند");

        }
        public async Task<OperationResult<List<UnitViewModel>>> GetUnitsViewerKnowledgeContent(int id)
        {
            var viewer = await _viewersRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityId == id && s.UserId == null)
                .Include(s => s.Unit).ToListAsync();

            var units = viewer.Select(item => new UnitViewModel()
            {
                UnitName = item.Unit?.UnitName,
                ID = item.Unit!.IgtDepartmentId
            }).ToList();

            return new OperationResult<List<UnitViewModel>>(true, units, "لیست افرادی که این محتوای دانشی را میتوانند ببینند");

        }

        public async Task<OperationResult<KnowledgeContentViewModel>> DeactivateKnowledgeContent(int knowledgeContentId)
        {
            var knowledgeContent = _knowledgeContentRepository.GetById(knowledgeContentId);
            if (knowledgeContent == null)
                return new OperationResult<KnowledgeContentViewModel>(false, null, "رکوردی یافت نشد");
            try
            {
                knowledgeContent.IsActive = !knowledgeContent.IsActive;

                knowledgeContent = await _knowledgeContentRepository.UpdateAsync(knowledgeContent, true);

                if (knowledgeContent.KnowledgeContentType == "Structured" && !knowledgeContent.IsActive)
                {
                    await _gamificationService.CalculateScores(new CalculateScoreViewModel()
                    {
                        Entity = knowledgeContent,
                        ActionName = ActionNameGamificationEnum.Deactivate,
                        GroupName = GroupNameGamificationEnum.KnowledgeContent

                    });
                }
                var result = _mapper.Map<KnowledgeContentViewModel>(knowledgeContent);
                var message = knowledgeContent.IsActive ? "فعال سازی با موفقیت انجام شد" : "غیرفعال سازی با موفقیت انجام شد";

                return new OperationResult<KnowledgeContentViewModel>(true, result, message);
            }
            catch (Exception ex)
            {
                return new OperationResult<KnowledgeContentViewModel>(false, null, "خطا در حین به‌روزرسانی: " + ex.Message);
            }
        }

        public async Task<OperationResult<KnowledgeContentExpertConfirmsViewModel>> ConfirmOrNotConfirmKnowledgeContent(
            int knowledgeContentId)
        {
            var userId = _accountService.GetUserId();

            var knowledgeContent = _knowledgeContentRepository.GetEntityAsNoTracking()
                .Include(s => s.User).
                Include(s => s.Goal)
                   .FirstOrDefault(s => s.Id == knowledgeContentId);

            if (knowledgeContent == null)
                return new OperationResult<KnowledgeContentExpertConfirmsViewModel>(false, null, "محتوای دانشی یافت نشد.");

            var goalId = knowledgeContent.GoalId;

            var expertCount = await GetProfessionalCount(goalId, "Expert");
            var ownerCount = await GetProfessionalCount(goalId, "Owner");

            var isExpert = await _processProfessionalRepository.CheckIfUserIsExpert(userId, goalId);
            var isOwner = await _processProfessionalRepository.CheckIfUserIsOwner(userId, goalId);

            var existingConfirmation = await _knowledgeContentExpertConfirmRepository
            .GetEntityAsNoTracking()
            .FirstOrDefaultAsync(a => a.KnowledgeContentId == knowledgeContentId
                                      && a.ExpertUserId == userId);

            if (existingConfirmation != null)
            {
                await _knowledgeContentExpertConfirmRepository.DeleteAsync(existingConfirmation, true, true);
                return new OperationResult<KnowledgeContentExpertConfirmsViewModel>(true, null, "محتوای دانشی از تایید خارج شد.", new List<ModelError>(), null);
            }

            var newConfirmation = new KnowledgeContentExpertConfirm()
            {
                KnowledgeContentId = knowledgeContentId,
                ExpertUserId = userId,
                IsConfirmed = true,
                IsActive = true,
                IsExpert = isExpert,
                IsOwner = isOwner,
            };
            await _knowledgeContentExpertConfirmRepository.AddAsync(newConfirmation, true);

            // محاسبه تعداد IsExpert و IsOwner برای KnowledgeContent
            var expertCountKnowledgeContent = await _knowledgeContentExpertConfirmRepository
                .GetEntityAsNoTracking()
                .CountAsync(c => c.KnowledgeContentId == knowledgeContentId && c.IsExpert);

            var ownerCountKnowledgeContent = await _knowledgeContentExpertConfirmRepository
                .GetEntityAsNoTracking()
                .CountAsync(c => c.KnowledgeContentId == knowledgeContentId && c.IsOwner);
            if (ownerCountKnowledgeContent == ownerCount && expertCountKnowledgeContent == expertCount / 2)
            {
                var trackedKnowledgeContent = await _knowledgeContentRepository.GetEntity()
                    .FirstOrDefaultAsync(s => s.Id == knowledgeContentId);

                if (trackedKnowledgeContent != null)
                {
                    trackedKnowledgeContent.IsOfficial = true;
                    trackedKnowledgeContent.KnowledgeContentType = "Official";
                    await _knowledgeContentRepository.UpdateAsync(trackedKnowledgeContent, true);
                }

                await _gamificationService.CalculateScores(new CalculateScoreViewModel()
                {
                    Entity = trackedKnowledgeContent,
                    ActionName = ActionNameGamificationEnum.Official,
                    GroupName = GroupNameGamificationEnum.KnowledgeContent,
                    SubGroupName = SubGroupNameGamificationEnum.OfficialKnowledgeContent
                }, true, true);
                _notificationSender.SendNotification(new SendNotificationDto
                {
                    Entity = trackedKnowledgeContent,
                    NotificationType = NotificationTypeEnum.ChangeKnowledgeContentToOfficial,
                    User = knowledgeContent.User,

                });

                await HandleOfficialContentCount(knowledgeContent);


            }
            var result = _mapper.Map<KnowledgeContentExpertConfirmsViewModel>(newConfirmation);


            return new OperationResult<KnowledgeContentExpertConfirmsViewModel>(true, result, "محتوای دانشی تأیید شد.");
        }

        private async Task HandleOfficialContentCount(KnowledgeContent knowledgeContent)
        {
            // بررسی تعداد محتواهای رسمی کاربر پس از رسمی کردن محتوا
            var officialContentCount = await _knowledgeContentRepository
                .GetEntityAsNoTracking()
                .CountAsync(c => c.UserId == knowledgeContent.UserId
                                 && c.IsOfficial
                                 && c.GoalId == knowledgeContent.GoalId);

            if (officialContentCount == 2)
            {
                var existingExpert = await _processProfessionalRepository
                    .GetEntityAsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == knowledgeContent.UserId && p.Kind == "Expert");

                if (existingExpert == null)
                {
                    var newExpert = new ProcessProfessional
                    {
                        UserId = knowledgeContent.UserId,
                        Kind = "Expert",
                        GoalId = knowledgeContent.GoalId,
                    };

                    await _processProfessionalRepository.AddAsync(newExpert, true);

                    _notificationSender.SendNotification(new SendNotificationDto
                    {
                        Entity = knowledgeContent,
                        NotificationType = NotificationTypeEnum.AddUserToExpert,
                        User = knowledgeContent.User,
                    });
                }
            }
        }

        //private async Task HandleExpertContentCount(int knowledgeContentId)
        //{

        //    var knowledgeContent = _knowledgeContentRepository.GetEntityAsNoTracking()
        //        .Include(s => s.User).
        //        Include(s => s.Goal)
        //        .FirstOrDefault(s => s.Id == knowledgeContentId);
        //    var goalId = knowledgeContent.GoalId;

        //    var expertCount = await GetProfessionalCount(goalId, "Expert");


        //}


        private async Task<int> GetProfessionalCount(int goalId, string role)
        {
            return await _processProfessionalRepository
                .GetEntityAsNoTracking()
                .CountAsync(p => p.GoalId == goalId && p.Kind == role);
        }
        //private async Task<bool> IsUserInRole(int userId, int goalId, string role)
        //{
        //    return await _processProfessionalRepository
        //        .GetEntityAsNoTracking()
        //        .AnyAsync(p => p.UserId == userId && p.Kind == role && p.GoalId == goalId);
        //}
        #endregion

        #region Comment
        public async Task<OperationResult<CommentViewModel>> CreateComment(CreateCommentViewModel comment)
        {

            var tempComment = _mapper.Map<Comment>(comment);
            tempComment.IsActive = false;

            var res = ValidateComment(tempComment, out _, out List<ModelError> errors);
            if (!res)
            {
                return new OperationResult<CommentViewModel>(false, null, nameof(comment) + " did not created.", errors);
            }

            var validation = await _attachmentRepository.ValidateFile(comment.CommentAttachments?.First()!, _fileSettings);
            if (!validation.IsSuccess)
            {
                return new OperationResult<CommentViewModel>(false, null, @"فایل معتبر نمی باشد",
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

            // محاسبه یوزرهایی که وجود ندارند
            if (comment.MentionUserId != null && comment.MentionUserId.Any())
            {
                var mentionUserIds = comment.MentionUserId;
                var existingUsers = _userRepository.GetEntity(u => mentionUserIds.Contains(u.Id)).ToList();
                var existingUserIds = existingUsers.Select(u => u.Id).ToList();
                var newUserIds = mentionUserIds.Except(existingUserIds).ToList();


                //if (newUserIds.Any())
                //{
                //    var newUsers = newUserIds.Select(id => new User
                //    {
                //        Id = id,
                //        IgtUserId = id.ToString(),
                //        UserName = "noname",
                //        FirstName = "noname",
                //        LastName = "noname",
                //        FullName = "noname noname"
                //    }).ToList();

                //    await _userRepository.AddRangeAsync(newUsers, true);
                //}

                if (newUserIds.Any())
                {
                    await _accountService.InsertNewUsers(newUserIds);
                }
            }

            string? tempMentionIds = null;

            if (comment.MentionUserId is { Count: > 0 })
            {
                tempMentionIds = MentionJob.CreateMentionString(comment.MentionUserId);
            }
            tempComment.MentionUserIds = tempMentionIds;
            tempComment.IsActive = true;
            await _commentRepository.AddAsync(tempComment, true);

            var gamificationData = new CalculateScoreViewModel()
            {
                GroupName = GroupNameGamificationEnum.Comment,
                ActionName = ActionNameGamificationEnum.Create,
                Entity = tempComment
            };
            var scores = await _gamificationService.CalculateScores(gamificationData);

            var tags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var commentTags = tags.Select(tag => new KnowledgeContentTag
            {
                EntityId = tempComment.Id,
                EntityName = "Comment",
                TagId = tag.Id,
                CreatedUserId = _accountService.GetUserId().ToString(),

            }).ToList();

            await _knowledgeContentTagRepository.AddRangeAsync(commentTags, true);


            if (comment.CommentAttachments != null && comment.CommentAttachments.Any())
            {

                await _attachmentRepository.SaveAttachments(comment.CommentAttachments, tempComment.GetType().Name, tempComment.Id, _fileSettings);

            }
            var retVal = _mapper.Map<CommentViewModel>(tempComment);


            return new OperationResult<CommentViewModel>(true, retVal, nameof(comment) + " کامنت با موفقیت ایجاد شد.");

        }

        public async Task<OperationResult<List<CommentViewModel>>> GetCommentOfKnowledgeContent(int knowledgeContentId,
            int? pageNo = null)
        {
            var userId = _accountService.GetUserId();

            #region Where

            var query = _commentRepository.GetEntityAsNoTracking()
                .Where(a => a.KnowledgeContentId == knowledgeContentId)
                .AsQueryable();

            #endregion

            #region Paging and query populating

            var totalEntitiesCount = await query.CountAsync();
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore);
            query = _commentRepository.GetAllAsNoTrackWithPagingAsync(paging, query)
                .Include(a => a.User);
            var tempRes = await query.ToListAsync();
            var result = _mapper.Map<List<CommentViewModel>>(tempRes);

            #endregion

            #region Descriptions

            var tempTagRep = (from q in _knowledgeContentTagRepository.GetEntityAsNoTracking()
                    .Where(s => s.EntityName == "Comment" && result.Select(t => t.Id).Contains(s.EntityId))
                              join t in _tagRepository.GetAllAsNoTrackAsync() on q.TagId equals t.Id
                              select new
                              {
                                  q.TagId,
                                  q.EntityId,
                                  t.TagTitle,
                                  q.CreatedUserId
                              }).ToList();

            var tempLikeRepo = _likeRepository.GetAllAsNoTrackAsync()
                .Where(s => s.EntityType == "Comment" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempAttachmentRepo = _attachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "Comment" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();

            foreach (var res in result)
            {
                if (res.MentionUserIds != null)
                {
                    var tempMentionList = MentionJob.ExtractUserIdsFromString(res.MentionUserIds);
                    if (tempMentionList.Count > 0)
                    {
                        List<MentionViewModel> tempMentionViewModels = (from u in _userRepository.GetEntityAsNoTracking().Where(s => tempMentionList.Contains(s.Id))
                                                                        select new MentionViewModel
                                                                        {
                                                                            UserId = u.Id,
                                                                            FullName = u.FullName

                                                                        }).ToList();
                        res.Mentions = tempMentionViewModels;
                    }
                }

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

            return new OperationResult<List<CommentViewModel>>(true, result, "فهرست کامنت ها", new List<ModelError>(), paging);

        }

        public async Task<OperationResult<List<CommentViewModel>>> GetCommentOfKnowledgeContentWithoutPagination(
            int knowledgeContentId)
        {
            var userId = _accountService.GetUserId();

            #region Where

            var query = _commentRepository.GetEntityAsNoTracking()
                .Where(a => a.KnowledgeContentId == knowledgeContentId)
                .Include(a => a.User)
                .AsQueryable();

            #endregion

            #region Query Execution and Mapping

            var tempRes = await query.ToListAsync();
            var result = _mapper.Map<List<CommentViewModel>>(tempRes);

            #endregion

            #region Descriptions

            var tempTagRep = (from q in _knowledgeContentTagRepository.GetEntityAsNoTracking()
                    .Where(s => s.EntityName == "Comment" && result.Select(t => t.Id).Contains(s.EntityId))
                              join t in _tagRepository.GetAllAsNoTrackAsync() on q.TagId equals t.Id
                              select new
                              {
                                  q.TagId,
                                  q.EntityId,
                                  t.TagTitle,
                                  q.CreatedUserId
                              }).ToList();

            var tempLikeRepo = _likeRepository.GetAllAsNoTrackAsync()
                .Where(s => s.EntityType == "Comment" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempAttachmentRepo = _attachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "Comment" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();

            foreach (var res in result)
            {
                if (res.MentionUserIds != null)
                {
                    var tempMentionList = MentionJob.ExtractUserIdsFromString(res.MentionUserIds);
                    if (tempMentionList.Count > 0)
                    {
                        List<MentionViewModel> tempMentionViewModels = (from u in _userRepository.GetEntityAsNoTracking().Where(s => tempMentionList.Contains(s.Id))
                                                                        select new MentionViewModel
                                                                        {
                                                                            UserId = u.Id,
                                                                            FullName = u.FullName

                                                                        }).ToList();
                        res.Mentions = tempMentionViewModels;
                    }
                }

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

            return new OperationResult<List<CommentViewModel>>(true, result, "فهرست کامنت ها بدون صفحه بندی", new List<ModelError>());
        }


        public async Task<OperationResult<CommentViewModel>> GetCommentById(int commentId)
        {
            var comment = await _commentRepository.GetEntityAsNoTracking()
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == commentId);

            if (comment == null)
                return new OperationResult<CommentViewModel>(false, null!, "کامنت یافت نشد");

            var result = _mapper.Map<CommentViewModel>(comment);

            var userId = _accountService.GetUserId();


            //  Attachments
            result.Attachments = await _attachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "Comment" && s.EntityId == comment.Id)
                .Select(s => new AttachmentViewModel
                {
                    Address = s.Address,
                    Name = s.Name!,
                    Id = s.Id
                }).ToListAsync();

            //  Tags
            result.Tags = await _knowledgeContentTagRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityId == comment.Id && s.EntityName == "Comment")
                .Join(_tagRepository.GetEntityAsNoTracking(), qt => qt.TagId, t => t.Id, (qt, t) => new TagsViewModel
                {
                    TagTitle = t.TagTitle,
                    CreatedUserId = t.CreatedUserId!
                }).ToListAsync();

            //  Mention
            var mentionUserIds = result.MentionUserIds?
                .Split(new[] { "__,__" }, StringSplitOptions.RemoveEmptyEntries)
                .Select(id => int.Parse(id.Replace("__", "")))
                .ToList();

            if (mentionUserIds != null)
            {
                result.Mentions = await _userRepository.GetEntityAsNoTracking()
                    .Where(u => mentionUserIds.Contains(u.Id))
                    .Select(u => new MentionViewModel
                    {
                        UserId = u.Id,
                        FullName = u.FullName
                    }).ToListAsync();
            }

            // محاسبه 
            result.LikeCount = await _likeRepository.GetEntityAsNoTracking()
                .CountAsync(s => s.EntityType == "Comment" && s.EntityId == comment.Id);

            //  آیا کاربر فعلی این پاسخ را لایک کرده است یا خیر
            result.IsLiked = await _likeRepository.GetEntityAsNoTracking()
                .AnyAsync(s => s.EntityType == "Comment" && s.EntityId == comment.Id && s.UserId == userId);

            return new OperationResult<CommentViewModel>(true, result, nameof(Comment) + $" رکورد {commentId} ");


        }

        public async Task<OperationResult<LikeViewModel>> LikeComment(LikeViewModel likeViewModel)
        {
            var errors = new List<ModelError>();
            var tempLike = _mapper.Map<Like>(likeViewModel);


            if (likeViewModel == null)
            {
                return new OperationResult<LikeViewModel>(false, null, nameof(Like) + " did not created.", errors);
            }

            if (!Enum.IsDefined(typeof(LikeEntityType), tempLike.EntityType))
            {
                string str = $"پارامتر نوع باید باید از نوع : {LikeEntityType.Comment} باشد";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }

            if (_userRepository.GetById(tempLike.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            if (tempLike.EntityType == LikeEntityType.KnowledgeContent.ToString())
            {
                if (_commentRepository.GetById(tempLike.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "کامنت به درستی انتخاب نشده است"));
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

            return new OperationResult<LikeViewModel>(true, likeViewModel, nameof(Like) + " لایک با موفقیت ایجاد شد.");
        }

        public async Task<OperationResult<LikeViewModel>> UnlikeComment(LikeViewModel likeViewModel)
        {
            var errors = new List<ModelError>();

            var temp = _likeRepository.GetEntity(a => a.EntityType == likeViewModel.EntityType.ToString()
                                    && a.UserId == likeViewModel.UserId && a.EntityId == likeViewModel.EntityId);
            var tempLike = temp.Any() ? temp.First() : null;


            if (tempLike == null)
            {
                errors.Add(new ModelError(nameof(likeViewModel.EntityId), "این مورد یافت نشد"));
            }

            if (!Enum.IsDefined(typeof(LikeEntityType), (LikeEntityType)likeViewModel.EntityType))
            {
                string str = $"پارامتر نوع باید از نوع : {LikeEntityType.Comment} باشد";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }

            if (_userRepository.GetById(likeViewModel.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            if (likeViewModel.EntityType == LikeEntityEnum.Comment)
            {
                if (_commentRepository.GetById(likeViewModel.EntityId) == null)
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

        public async Task<OperationResult<KnowledgeContentViewModel>> DeleteKnowledgeContent(int knowledgeContentId)
        {
            var knowledgeContent = _knowledgeContentRepository.GetById(knowledgeContentId);
            if (knowledgeContent == null)
                return new OperationResult<KnowledgeContentViewModel>(false, null!, "رکوردی یافت نشد");
            await _knowledgeContentRepository.DeleteAsync(knowledgeContent, false, true);
            var result = _mapper.Map<KnowledgeContentViewModel>(knowledgeContent);

            return new OperationResult<KnowledgeContentViewModel>(true, result, $" .حذف با موفقیت انجام شد");

        }


        #endregion

    }
}