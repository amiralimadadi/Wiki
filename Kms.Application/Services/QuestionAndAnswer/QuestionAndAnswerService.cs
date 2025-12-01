using Kms.Application.ViewModels;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.QuestionAndAnswer;
using Common.OperationResult;
using AutoMapper;
using Common.File;
using Kms.Application.Services.Account;
using Kms.DataLayer.Repositories;
using Kms.Application.ViewModel.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Common.Mentions;
using Common.Paging;
using Kms.Application.Senders;
using Kms.Application.Services.Gamifications;

namespace Kms.Application.Services.QuestionAndAnswer
{
    public class QuestionAndAnswerService : IQuestionAndAnswerService
    {
        private readonly IQuestionRepository _questionRepository;
        private readonly IQuestionGoalRepository _questionGoalRepository;
        private readonly IGoalRepository _goalRepository;
        private readonly IAnswerRepository _answerRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILikeRepository _likeRepository;
        private readonly ITagRepository _tagRepository;
        private readonly IQuestionTagRepository _questionTagRepository;
        private readonly IMapper _mapper;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly AttachmentSetting _attachmentSetting;
        private readonly FileSettings _fileSettings;
        private readonly IAccountService _accountService;
        private readonly IGamificationService _gamificationService;
        private readonly IUserScoreRepository _userScoreRepository;
        private readonly INotificationSender _notificationSender;
        private readonly PagingOptions _pagingOptions;

        private const string RejectQuestionString = "حذف پرسش";
        private const string RejectAnswerString = "حذف پاسخ";

        #region Constructor
        public QuestionAndAnswerService(IQuestionRepository questionRepository, IQuestionGoalRepository questionGoalRepository,
            IGoalRepository goalRepository, IAnswerRepository answerRepository, IUserRepository userRepository,
            ILikeRepository likeRepository, ITagRepository tagRepository, IQuestionTagRepository questionTagRepository,
            IMapper mapper, IAttachmentRepository attachmentRepository, IOptions<AttachmentSetting> attachmentSetting,
            IOptions<FileSettings> fileSettings, IAccountService accountService, IGamificationService gamificationService,
            IUserScoreRepository userScoreRepository,
            INotificationSender notificationSender,
            IOptions<PagingOptions> pagingOptions)
        {
            _questionRepository = questionRepository;
            _questionGoalRepository = questionGoalRepository;
            _likeRepository = likeRepository;
            _goalRepository = goalRepository;
            _answerRepository = answerRepository;
            _userRepository = userRepository;
            _tagRepository = tagRepository;
            _questionTagRepository = questionTagRepository;
            _mapper = mapper;
            _attachmentRepository = attachmentRepository;
            _attachmentSetting = attachmentSetting.Value;
            _fileSettings = fileSettings.Value;
            _accountService = accountService;
            _gamificationService = gamificationService;
            _userScoreRepository = userScoreRepository;
            _notificationSender = notificationSender;
            _pagingOptions = pagingOptions.Value;
        }
        #endregion

        #region Private Methods
        private bool ValidateAnswer(Answer answer, out Answer finalAnswer, out List<ModelError> modelErrors)
        {
            modelErrors = new List<ModelError>();
            finalAnswer = answer;

            var entityErrors = _answerRepository.EntityValidation(finalAnswer, out List<ModelError> errors);
            var propertyErrors = errors.Select(a => a.ModelPropertyName).ToList();

            if (answer == null)
            {
                errors.Add(new ModelError(nameof(answer.Id), "اطلاعات سوال به درستی پر نشده است"));
            }
            if (_questionRepository.GetById(answer!.QuestionId) == null)
            {
                errors.Add(new ModelError(nameof(answer.QuestionId), "پرسش به درستی انتخاب نشده است"));
            }
            if (_userRepository.GetById(answer!.UserId) == null)
            {
                errors.Add(new ModelError(nameof(answer.UserId), "کاربر ثبت کننده به درستی انتخاب نشده است"));
            }
            if (string.IsNullOrWhiteSpace(answer.AnswerText))
            {
                errors.Add(new ModelError(nameof(answer.AnswerText), "متن پاسخ اجباری است"));
            }

            if (errors.Any())
            {
                modelErrors = errors;
                return false;
            }
            return true;
        }

        private bool ValidateQuestion(Question question, out Question finalQuestion, out List<ModelError> modelErrors, List<int> goalIds, List<string> tags)
        {
            modelErrors = new List<ModelError>();
            finalQuestion = question;

            _questionRepository.EntityValidation(finalQuestion, out List<ModelError> errors);

            if (question == null)
            {
                modelErrors.Add(new ModelError(nameof(question), "اطلاعات پرسش به درستی پر نشده است"));
                return false;
            }


            if (string.IsNullOrWhiteSpace(question.QuestionText))
            {
                errors.Add(new ModelError(nameof(question.QuestionText), "متن پرسش اجباری است"));
            }

            if (!goalIds.Any())
                errors.Add(new ModelError(nameof(goalIds), "دست کم یک هدف انتخاب شود"));

            if (string.IsNullOrWhiteSpace(question.QuestionTitle))
                errors.Add(new ModelError(nameof(question.QuestionTitle), "عنوان پرسش اجباری است"));

            if (!tags.Any())
                errors.Add(new ModelError(nameof(tags), "کلمات کلیدی اجباری است"));


            _questionRepository.EntityValidation(finalQuestion, out var validationErrors);
            if (validationErrors.Any())
            {
                modelErrors.AddRange(validationErrors);
            }

            return !modelErrors.Any();
        }

        #endregion

        #region Question

        public async Task<OperationResult<List<int>>> GetDataForCreateQuestion(List<int> goalIds)
        {
            var goals = _goalRepository.GetEntity(a => goalIds.Contains(a.Id));
            var dbGoalIds = goals.Select(a => a.Id).ToList();
            if (!goals.Any())
            {
                return new OperationResult<List<int>>(false, null!, @"هدف(ها) به درستی انتخاب نشده است.");
            }

            if (goalIds != dbGoalIds)
            {
                return new OperationResult<List<int>>(false, null!, @"هدف(ها) به درستی انتخاب نشده است.");
            }
            return new OperationResult<List<int>>(true, goalIds, string.Empty);
        }

        public async Task<OperationResult<QuestionViewModel>> CreateQuestion(CreateQuestionViewModel question)
        {
            var tempQuestion = _mapper.Map<Question>(question);
            tempQuestion.IsActive = false;
            var errors = new List<ModelError>();

            // Validate Question
            if (!ValidateQuestion(tempQuestion, out var finalQuestion, out var validationErrors, question.GoalIds, question.Tags))
            {
                errors.AddRange(validationErrors); // اضافه کردن خطاهای ولیدیشن به لیست errors
                return new OperationResult<QuestionViewModel>(false, null, "Question did not create.", errors);
            }


            // Validate Attachments
            if (question.QuestionAttachments != null && question.QuestionAttachments.Any())
            {
                var validation = await _attachmentRepository.ValidateFile(question.QuestionAttachments.First(), _fileSettings);
                if (!validation.IsSuccess)
                {
                    return new OperationResult<QuestionViewModel>(false, null, "Invalid file", validation.ModelErrors);
                }
            }



            // Validate Goals
            var dbGoals = _goalRepository.GetEntity(a => question.GoalIds.Contains(a.Id)).ToList();
            if (dbGoals.Count != question.GoalIds.Count)
            {
                errors.Add(new ModelError(nameof(question.GoalIds), "Goals not correctly selected."));
            }

            if (errors.Any())
            {
                return new OperationResult<QuestionViewModel>(false, null!, "خطایی رخ داده است", errors);
            }


            // tags
            var tempTags = question.Tags.Select(s => s.Trim().Replace("#", "")).ToList();
            var existingTags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var existingTagTitles = existingTags.Select(t => t.TagTitle).ToList();
            var newTagTitles = tempTags.Except(existingTagTitles).ToList();

            if (newTagTitles.Any())
            {
                var newTags = newTagTitles.Select(tagTitle => new Tag { TagTitle = tagTitle }).ToList();
                await _tagRepository.AddRangeAsync(newTags, true);
                existingTags.AddRange(newTags);
            }


            if (question.MentionUserId != null && question.MentionUserId.Any())
            {
                var mentionUserIds = question.MentionUserId;
                var existingUsers = _userRepository.GetEntity(u => mentionUserIds.Contains(u.Id)).ToList();
                var existingUserIds = existingUsers.Select(u => u.Id).ToList();
                var newUserIds = mentionUserIds.Except(existingUserIds).ToList();


                if (newUserIds.Any())
                {
                    await _accountService.InsertNewUsers(newUserIds);
                }
                tempQuestion.MentionUserIds = MentionJob.CreateMentionString(mentionUserIds);
            }



            // new Question
            var tempQues = new Question
            {
                QuestionText = question.QuestionText,
                QuestionTitle = question.QuestionTitle,
                UserId = _accountService.GetUserId(),
                MentionUserIds = tempQuestion.MentionUserIds,
                IsActive = false
            };

            await _questionRepository.AddAsync(tempQues, true);




            var tempQuesGoal = (from g in question.GoalIds
                                select new QuestionGoal { QuestionId = tempQues.Id, GoalId = g }).ToList();
            await _questionGoalRepository.AddRangeAsync(tempQuesGoal, true);

            if (question.QuestionAttachments != null && question.QuestionAttachments.Any())
            {

                await _attachmentRepository.SaveAttachments(question.QuestionAttachments, tempQuestion.GetType().Name, tempQues.Id, _fileSettings);

            }
            var tags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
            var questionTags = tags.Select(tag => new QuestionTag
            {
                EntityId = tempQues.Id,
                EntityName = "Question",
                TagId = tag.Id,
                CreatedUserId = _accountService.GetUserId().ToString(),
            }).ToList();

            await _questionTagRepository.AddRangeAsync(questionTags, true);

            var result = new QuestionViewModel
            {
                Id = tempQues.Id,
                QuestionTitle = tempQues.QuestionTitle,
                QuestionText = tempQues.QuestionText,
                QuestionType = "DefaultType",
                Tags = tags.Select(tag => new TagsViewModel
                {
                    TagTitle = tag.TagTitle
                }).ToList(),
                Mentions = question.MentionUserId?.Select(userId => new MentionViewModel
                {
                    UserId = userId,
                    FullName = _userRepository.GetEntity(u => u.Id == userId).Select(u => u.FullName).FirstOrDefault()
                }).ToList() ?? new List<MentionViewModel>(),
                Attachments = _attachmentRepository.GetEntity(a => a.EntityId == tempQues.Id && a.EntityName == "Question")
                    .Select(a => new AttachmentViewModel
                    {
                        Id = a.Id,
                        Name = a.Name,
                        Address = a.Address

                    }).ToList(),
                User = new UserViewModel
                {
                    Id = tempQues.UserId,
                    FullName = tempQues.User.FullName
                }
            };
            var notificationStatus = _notificationSender.SendNotification(new SendNotificationDto()
            {
                Entity = tempQues,
                NotificationType = NotificationTypeEnum.QuestionCreate,
                User = tempQues.User
            });
            return new OperationResult<QuestionViewModel>(true, result, "پرسش با موفقیت ایجاد شد.");
        }

        public async Task<OperationResult<List<QuestionViewModel>>> GetQuestions(GetQuestionTypesEnum questionFilter, string? searchText, int? goalId = null, int? pageNo = null)
        {
            var userId = _accountService.GetUserId();

            #region Where
            var query = _questionRepository.GetEntityAsNoTracking().AsQueryable();

            if (goalId != null)
            {
                query = query.Where(a => a.QuestionGoals.Any(g => g.GoalId == goalId));
            }

            if (questionFilter == GetQuestionTypesEnum.MyQuestions)
            {
                query = query.Where(a => a.UserId == userId);
            }

            if (questionFilter == GetQuestionTypesEnum.MentionedQuestions)
            {
                var mentionStr = MentionJob.CreateMentionString(new List<int> { userId });
                query = query.Where(a => a.MentionUserIds.Contains(mentionStr));
            }

            if (searchText != null)
            {
                query = query.Where(a => a.QuestionText.Contains(searchText)
                || a.QuestionTitle.Contains(searchText));
            }
            #endregion

            #region Paging and query populating
            var totalEntitiesCount = await query.CountAsync();
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore)!;

            query = _questionRepository.GetAllAsNoTrackWithPagingAsync(paging, query)
                //.Include(a => a.QuestionAnswers)!.ThenInclude(a => a.User)
                .Include(a => a.QuestionGoals).ThenInclude(a => a.Goal)
                .Include(a => a.User);
            var tempRes = await query.ToListAsync();
            var result = _mapper.Map<List<QuestionViewModel>>(tempRes);
            #endregion

            #region Descriptions

            var tempGoalRepo = (from q in _questionGoalRepository.GetEntityAsNoTracking().Where(s => result.Select(t => t.Id).Contains(s.QuestionId))
                                join g in _goalRepository.GetAllAsNoTrackAsync() on q.GoalId equals g.Id
                                select new
                                {
                                    q.GoalId,
                                    q.QuestionId,
                                    g.GoalTitle
                                }).ToList();
            var tempTagRep = (from q in _questionTagRepository.GetEntityAsNoTracking().Where(s => s.EntityName == "Question" && result.Select(t => t.Id).Contains(s.EntityId))
                              join t in _tagRepository.GetAllAsNoTrackAsync() on q.TagId equals t.Id
                              select new
                              {
                                  q.TagId,
                                  q.EntityId,
                                  t.TagTitle,
                                  q.CreatedUserId
                              }).ToList();

            var tempAnsRepo = _answerRepository.GetAllAsNoTrackAsync()
                .Where(s => result.Select(t => t.Id).Contains(s.QuestionId)).ToList();
            var tempLikeRepo = _likeRepository.GetAllAsNoTrackAsync()
                .Where(s => s.EntityType == "Question" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();
            var tempAttachmentRepo = _attachmentRepository.GetEntityAsNoTracking()
                    .Where(s => s.EntityName == "Question" && result.Select(t => t.Id).Contains(s.EntityId)).ToList();


            foreach (var res in result)
            {
                var tempMentionList = MentionJob.ExtractUserIdsFromString(res.MentionUserIds);
                if (tempMentionList != null && tempMentionList.Count > 0)
                {
                    var tempMentionViewModels = new List<MentionViewModel>();
                    tempMentionViewModels = (from u in _userRepository.GetEntityAsNoTracking().Where(s => tempMentionList.Contains(s.Id))
                                             select new MentionViewModel
                                             {
                                                 UserId = u.Id,
                                                 FullName = u.FullName

                                             }).ToList();
                    res.Mentions = tempMentionViewModels;
                }

                if (tempTagRep != null && tempTagRep.Count > 0)
                {
                    var tempTagViewModels = new List<TagsViewModel>();
                    tempTagViewModels = (from t in tempTagRep.Where(a => a.EntityId == res.Id)
                                         select new TagsViewModel
                                         {
                                             TagTitle = t.TagTitle,
                                             CreatedUserId = t.CreatedUserId
                                         }).ToList();
                    res.Tags = tempTagViewModels;
                }
                res.GoalTile = tempGoalRepo.Where(g => g.QuestionId == res.Id).Select(g => g.GoalTitle).ToList();
                res.AnswerCount = tempAnsRepo.Count(s => s.QuestionId == res.Id);
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

            #region Gamification

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                var gamificationData = new CalculateScoreViewModel()
                {
                    GroupName = GroupNameGamificationEnum.Question,
                    ActionName = ActionNameGamificationEnum.Search,
                    SearchText = searchText
                };
                var scores = await _gamificationService.CalculateScores(gamificationData);
            }
            #endregion Gamification
            return new OperationResult<List<QuestionViewModel>>(true, result, "Questions are here", new List<ModelError>(), paging);
        }

        public async Task<OperationResult<QuestionViewModel>> GetQuestionById(int questionId)
        {
            var question = await _questionRepository.GetEntityAsNoTracking(false)
                .Include(q => q.QuestionGoals).ThenInclude(qg => qg.Goal)
                .Include(q => q.User)
                .FirstOrDefaultAsync(q => q.Id == questionId);

            if (question == null)
                return new OperationResult<QuestionViewModel>(false, null!, "سوال یافت نشد");

            var result = _mapper.Map<QuestionViewModel>(question);
            var userId = _accountService.GetUserId();

            // Attachments
            result.Attachments = await _attachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "Question" && s.EntityId == questionId)
                .Select(s => new AttachmentViewModel
                {
                    Address = s.Address,
                    Id = s.Id,
                    Name = s.Name ?? ""
                }).ToListAsync();

            // Tags
            result.Tags = await _questionTagRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityId == questionId && s.EntityName == "Question")
                .Join(_tagRepository.GetEntityAsNoTracking(), qt => qt.TagId, t => t.Id, (qt, t) => new TagsViewModel
                {
                    TagTitle = t.TagTitle,
                    CreatedUserId = t.CreatedUserId
                }).ToListAsync();

            // Mentions
            var mentionUserIds = MentionJob.ExtractUserIdsFromString(result.MentionUserIds);
            if (mentionUserIds.Count > 0)
            {
                result.Mentions = await _userRepository.GetEntityAsNoTracking()
                    .Where(u => mentionUserIds.Contains(u.Id))
                    .Select(u => new MentionViewModel
                    {
                        UserId = u.Id,
                        FullName = u.FullName
                    }).ToListAsync();
            }

            result.GoalTile = await _questionGoalRepository.GetEntityAsNoTracking()
                .Where(qg => qg.QuestionId == questionId)
                .Join(_goalRepository.GetAllAsNoTrackAsync(), qg => qg.GoalId, g => g.Id, (qg, g) => g.GoalTitle)
                .ToListAsync();

            result.LikeCount = await _likeRepository.GetEntityAsNoTracking()
                .CountAsync(s => s.EntityType == "Question" && s.EntityId == questionId);


            result.IsLiked = await _likeRepository.GetEntityAsNoTracking()
                .AnyAsync(s => s.EntityType == "Question" && s.EntityId == questionId && s.UserId == userId);


            result.AnswerCount = await _answerRepository.GetEntityAsNoTracking()
                .CountAsync(a => a.QuestionId == questionId);

            return new OperationResult<QuestionViewModel>(true, result, nameof(Question) + $" رکورد {questionId} ");
        }

        #endregion Question

        #region  Answer
        public async Task<OperationResult<AnswerViewModel>> GetAnswerById(int answerId)
        {
            var answer = await _answerRepository.GetEntityAsNoTracking()
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == answerId);

            if (answer == null)
                return new OperationResult<AnswerViewModel>(false, null!, "پاسخ یافت نشد");

            var result = _mapper.Map<AnswerViewModel>(answer);

            var userId = _accountService.GetUserId();


            //  Attachments
            result.Attachments = await _attachmentRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityName == "Answer" && s.EntityId == answer.Id)
                .Select(s => new AttachmentViewModel
                {
                    Address = s.Address,
                    Id = s.Id
                }).ToListAsync();

            //  Tags
            result.Tags = await _questionTagRepository.GetEntityAsNoTracking()
                .Where(s => s.EntityId == answer.Id && s.EntityName == "Answer")
                .Join(_tagRepository.GetEntityAsNoTracking(), qt => qt.TagId, t => t.Id, (qt, t) => new TagsViewModel
                {
                    TagTitle = t.TagTitle,
                    CreatedUserId = t.CreatedUserId
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
                .CountAsync(s => s.EntityType == "Answer" && s.EntityId == answer.Id);

            //  آیا کاربر فعلی این پاسخ را لایک کرده است یا خیر
            result.IsLiked = await _likeRepository.GetEntityAsNoTracking()
                .AnyAsync(s => s.EntityType == "Answer" && s.EntityId == answer.Id && s.UserId == userId);

            return new OperationResult<AnswerViewModel>(true, result, nameof(Answer) + $" رکورد {answerId} ");

        }

        public async Task<OperationResult<List<AnswerViewModel>>> GetAnswersOfQuestion(int questionId, int? pageNo = null)
        {
            var userId = _accountService.GetUserId();

            var query = _answerRepository.GetEntityAsNoTracking()
           .Where(a => a.QuestionId == questionId).AsQueryable();

            var totalEntitiesCount = await query.CountAsync();
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore)!;
            query = _answerRepository.GetAllAsNoTrackWithPagingAsync(paging, query)
                .Include(a => a.User);

            var tempRes = await query.ToListAsync();

            var result = _mapper.Map<List<AnswerViewModel>>(tempRes);

            result = result.Select(a =>
            {
                //  Mention
                var mentionUserIds = a.MentionUserIds?
                    .Split(new[] { "__,__" }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(id => int.Parse(id.Replace("__", "")))
                    .ToList();

                if (mentionUserIds != null)
                {
                    var mentionedUsers = _userRepository.GetEntityAsNoTracking()
                        .Where(u => mentionUserIds.Contains(u.Id))
                        .Select(u => new MentionViewModel
                        {
                            UserId = u.Id,
                            FullName = u.FullName
                        }).ToList();
                    a.Mentions = mentionedUsers;
                }

                //  Attachments
                a.Attachments = _attachmentRepository.GetEntityAsNoTracking()
                    .Where(s => s.EntityName == "Answer" && s.EntityId == a.Id)
                    .Select(s => new AttachmentViewModel
                    {
                        Address = s.Address,
                        Id = s.Id
                    }).ToList();

                //  Tags
                a.Tags = _questionTagRepository.GetEntityAsNoTracking()
                    .Where(s => s.EntityId == a.Id && s.EntityName == "Answer")
                    .Join(_tagRepository.GetEntityAsNoTracking(), qt => qt.TagId, t => t.Id, (qt, t) => new TagsViewModel
                    {
                        TagTitle = t.TagTitle,
                        CreatedUserId = t.CreatedUserId
                    }).ToList();

                a.LikeCount = _likeRepository.GetEntityAsNoTracking()
                     .Count(s => s.EntityType == "Answer" && s.EntityId == a.Id);

                a.IsLiked = _likeRepository.GetEntityAsNoTracking()
                    .Any(s => s.EntityType == "Answer" && s.EntityId == a.Id && s.UserId == userId);

                return a;
            }).ToList();


            return new OperationResult<List<AnswerViewModel>>(true, result, "فهرست پاسخ‌ها", new List<ModelError>(), paging);

        }

        public async Task<OperationResult<AnswerViewModel>> CreateAnswer(CreateAnswerViewModel answer)
        {
            var tempAnswer = _mapper.Map<Answer>(answer);
            tempAnswer.IsActive = false;

            var res = ValidateAnswer(tempAnswer, out var finalAnswer, out List<ModelError> errors);
            if (!res)
                return new OperationResult<AnswerViewModel>(false, null, nameof(Answer) + " did not created.", errors);

            // ✅ اگر فایل نداریم، اصلاً ValidateFile نزن
            if (answer.AnswerAttachments != null && answer.AnswerAttachments.Any())
            {
                var validation = await _attachmentRepository.ValidateFile(answer.AnswerAttachments.First(), _fileSettings);
                if (!validation.IsSuccess)
                    return new OperationResult<AnswerViewModel>(false, null, @"فایل معتبر نمی باشد", validation.ModelErrors!);
            }

            // Mentions → قبل از ذخیره هم اشکالی ندارد
            if (answer.MentionUserId != null && answer.MentionUserId.Any())
            {
                var mentionUserIds = answer.MentionUserId;
                var existingUsers = _userRepository.GetEntity(u => mentionUserIds.Contains(u.Id)).ToList();
                var existingUserIds = existingUsers.Select(u => u.Id).ToList();
                var newUserIds = mentionUserIds.Except(existingUserIds).ToList();
                if (newUserIds.Any())
                    await _accountService.InsertNewUsers(newUserIds);
            }

            tempAnswer.MentionUserIds = (answer.MentionUserId != null && answer.MentionUserId.Count > 0)
                ? MentionJob.CreateMentionString(answer.MentionUserId)
                : null;

            // ✅ اول خود Answer را ذخیره کن تا Id بگیرد
            await _answerRepository.AddAsync(tempAnswer, true);

            // ✅ حالا که tempAnswer.Id مقدار دارد، تگ‌ها را وصل کن
            if (answer.Tags != null && answer.Tags.Any())
            {
                var tempTags = answer.Tags.Select(s => s.Trim().Replace("#", "")).ToList();

                var existingTags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();
                var existingTagTitles = existingTags.Select(t => t.TagTitle).ToList();
                var newTagTitles = tempTags.Except(existingTagTitles).ToList();

                if (newTagTitles.Any())
                {
                    var newTags = newTagTitles.Select(tagTitle => new Tag { TagTitle = tagTitle }).ToList();
                    await _tagRepository.AddRangeAsync(newTags, true);
                    existingTags.AddRange(newTags);
                }

                var tags = _tagRepository.GetEntity(t => tempTags.Contains(t.TagTitle)).ToList();

                var answerTags = tags.Select(tag => new QuestionTag // اسم موجود ولی برای Answer هم استفاده می‌شود
                {
                    EntityId = tempAnswer.Id,              // ✅ الان Id درست است
                    EntityName = nameof(Answer),           // بهتر از "Answer" به صورت string literal
                    TagId = tag.Id,
                    CreatedUserId = _accountService.GetUserId().ToString(),
                }).ToList();

                await _questionTagRepository.AddRangeAsync(answerTags, true);
            }

            // فایل‌ها بعد از ذخیره‌ی Answer تا EntityId داشته باشد
            if (answer.AnswerAttachments != null && answer.AnswerAttachments.Any())
                await _attachmentRepository.SaveAttachments(answer.AnswerAttachments, tempAnswer.GetType().Name, tempAnswer.Id, _fileSettings);

            // نوتیفیکیشن
            _notificationSender.SendNotification(new SendNotificationDto()
            {
                Entity = tempAnswer,
                NotificationType = NotificationTypeEnum.AnswerCreate,
                User = tempAnswer.User
            });

            var retVal = _mapper.Map<AnswerViewModel>(tempAnswer);
            return new OperationResult<AnswerViewModel>(true, retVal, nameof(Answer) + " پاسخ با موفقیت ایجاد شد.");
        }


        #endregion

        #region Like
        public async Task<OperationResult<LikeViewModel>> LikeQuestionAnswer(LikeViewModel qaLikeViewModel)
        {
            var errors = new List<ModelError>();
            var tempLike = _mapper.Map<Like>(qaLikeViewModel);


            if (qaLikeViewModel == null)
            {
                return new OperationResult<LikeViewModel>(false, null, nameof(Like) + " did not created.", errors);
            }

            if (!Enum.IsDefined(typeof(LikeEntityType), tempLike.EntityType))
            {
                string str = $"پارامتر نوع باید یکی از این دو مورد باشد: {LikeEntityType.Answer} ، {LikeEntityType.Question}";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }

            if (_userRepository.GetById(tempLike!.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            if (tempLike.EntityType == LikeEntityType.Answer.ToString())
            {
                if (_answerRepository.GetById(tempLike.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "پاسخ به درستی انتخاب نشده است"));
                }
            }

            if (qaLikeViewModel.EntityType == LikeEntityEnum.Question)
            {
                if (_questionRepository.GetById(tempLike.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "پرسش به درستی انتخاب نشده است"));
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

            #region Gamification

            var gamificationData = new CalculateScoreViewModel()
            {
                ActionName = ActionNameGamificationEnum.Like,
                GroupName =
                    tempLike.EntityType == GroupNameGamificationEnum.Question.ToString()
                        ? GroupNameGamificationEnum.Question
                        : (tempLike.EntityType == GroupNameGamificationEnum.Answer.ToString()
                            ? GroupNameGamificationEnum.Answer
                            : null!),
                Entity = tempLike
            };
            var scores = await _gamificationService.CalculateScores(gamificationData);

            #endregion Gamification
            return new OperationResult<LikeViewModel>(true, qaLikeViewModel, nameof(Like) + " لایک با موفقیت ایجاد شد.");
        }

        public async Task<OperationResult<LikeViewModel>> UnLikeQuestionAnswer(LikeViewModel qaLikeViewModel)
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
                string str = $"پارامتر نوع باید یکی از این دو مورد باشد: {LikeEntityType.Answer} ، {LikeEntityType.Question}";
                errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            }
            //if (!Enum.IsDefined(typeof(LikeEntityType), qaLikeViewModel!.EntityType))
            //{
            //	string str = $"پارامتر نوع باید یکی از این دو مورد باشد: {LikeEntityType.Answer} ، {LikeEntityType.Question}";
            //	errors.Add(new ModelError(nameof(tempLike.EntityType), str));
            //}

            if (_userRepository.GetById(qaLikeViewModel.UserId) == null)
            {
                errors.Add(new ModelError(nameof(tempLike.UserId), "کاربر لایک کننده به درستی انتخاب نشده است"));
            }

            if (qaLikeViewModel.EntityType == LikeEntityEnum.Answer)
            {
                if (_answerRepository.GetById(qaLikeViewModel.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "پاسخ به درستی انتخاب نشده است"));
                }
            }

            if (qaLikeViewModel.EntityType == LikeEntityEnum.Question)
            {
                if (_questionRepository.GetById(qaLikeViewModel.EntityId) == null)
                {
                    errors.Add(new ModelError(nameof(tempLike.EntityId), "پرسش به درستی انتخاب نشده است"));
                }
            }

            if (errors.Any())
            {
                return new OperationResult<LikeViewModel>(false, null!, "خطایی رخ داده است", errors);
            }

            await _likeRepository.DeleteAsync(tempLike!, true, true);

            return new OperationResult<LikeViewModel>(true, qaLikeViewModel, nameof(Like) + " حذف لایک با موفقیت انجام شد");
        }
        #endregion

        #region Admin

        public async Task<OperationResult<List<QuestionTypeViewModel>>> GetQuestionType()
        {
            var gamifications = _gamificationService.GetQuestionTypes().Data;

            if (gamifications == null)
            {
                return new OperationResult<List<QuestionTypeViewModel>>(false, null, "Question Type not found");

            }
            var questionTypes = _mapper.Map<List<QuestionTypeViewModel>>(gamifications);
            questionTypes.Add(new QuestionTypeViewModel()
            {
                Index = 0,
                Description = RejectQuestionString
            });
            questionTypes = questionTypes.OrderBy(a => a.Index).ToList();




            return new OperationResult<List<QuestionTypeViewModel>>(true, questionTypes, "Goal tree is here");

        }

        public async Task<OperationResult<List<QuestionsAdminConfirmViewModel>>> GetQuestionsForAdminConfirm()
        {
            var gamifications = _gamificationService.GetQuestionTypes().Data;
            var questionTypes = _mapper.Map<List<QuestionTypeViewModel>>(gamifications);

            questionTypes.Add(new QuestionTypeViewModel()
            {
                Index = 0,
                Description = RejectQuestionString
            });

            questionTypes = questionTypes.OrderBy(a => a.Index).ToList();

            var result = await _questionRepository.GetEntityAsNoTracking(false)
                .Where(q => q.QuestionType == null && !q.IsActive)
                .Select(q => new QuestionsAdminConfirmViewModel
                {
                    Id = q.Id,
                    GoalTiles = q.QuestionGoals.Select(g => g.Goal.GoalTitle).ToList(),
                    QuestionTitle = q.QuestionTitle,
                    QuestionText = q.QuestionText,
                    UserName = q.User.FullName,
                    IsDelete = q.IsDeleted,
                    CreatedDate = q.CreatedDate,
                    IsActive = q.IsActive,
                    QuestionTypes = questionTypes
                })
                .OrderByDescending(q => q.Id).ToListAsync();

            return new OperationResult<List<QuestionsAdminConfirmViewModel>>(true, result, "لیست سوالات تایید نشده");
        }

        public async Task<OperationResult<QuestionViewModel>> AcceptQuestion(int questionId, string index, int? goalId)
        {
            var question = _questionRepository.GetById(questionId);

            if (question == null)
                return new OperationResult<QuestionViewModel>(false, null, "Question not found");

            if (question.IsDeleted || !string.IsNullOrWhiteSpace(question.QuestionType) || question.IsActive)
                return new OperationResult<QuestionViewModel>(false, null, "Question not found");


            var tempQuestion = _mapper.Map<Question>(question);
            tempQuestion.Id = questionId;
            if (index == "0")
            {
                await _questionRepository.DeleteAsync(tempQuestion, false, true);
            }


            else
            {
                tempQuestion.QuestionType = index;
                tempQuestion.IsActive = true;
                await _questionRepository.UpdateAsync(tempQuestion, true);
            }
            if (goalId != null)
            {
                var questionGoals = await _questionGoalRepository.GetEntityAsNoTracking()
                    .FirstOrDefaultAsync(s => s.QuestionId == questionId);

                if (questionGoals != null)
                {
                    questionGoals.GoalId = (int)goalId;
                    await _questionGoalRepository.UpdateAsync(questionGoals, true);
                }


            }

            var gamificationData = new CalculateScoreViewModel()
            {
                GroupName = GroupNameGamificationEnum.Question,
                ActionName = ActionNameGamificationEnum.Create,
                Entity = tempQuestion
            };
            var scores = await _gamificationService.CalculateScores(gamificationData);

            //if (scores.Data != null && scores.IsSuccess && scores.Data.Any())
            // await _userScoreRepository.AddRangeAsync(scores.Data, true);

            var result = _mapper.Map<QuestionViewModel>(tempQuestion);
            return new OperationResult<QuestionViewModel>(true, result, nameof(Question) + $" رکورد {questionId} با موفقیت ویرایش شد");
        }

        public async Task<OperationResult<List<AnswersAdminConfirmViewModel>>> GetAnswersForAdminConfirm()
        {

            var gamifications = _gamificationService.GetAnswerTypes().Data;
            var answerTypes = _mapper.Map<List<AnswerTypeViewModel>>(gamifications);

            answerTypes.Add(new AnswerTypeViewModel
            {
                Index = 0,
                Description = RejectAnswerString
            });

            answerTypes = answerTypes.OrderBy(a => a.Index).ToList();

            var result = await _answerRepository.GetEntityAsNoTracking(false)
                .Where(a => a.AnswerType == null && !a.IsActive)
                .Select(a => new AnswersAdminConfirmViewModel
                {
                    Id = a.Id,
                    QuestionId = a.Question.Id,
                    QuestionTitle = a.Question.QuestionTitle,
                    AnswerText = a.AnswerText,
                    UserName = a.User.FullName,
                    IsDelete = a.IsDeleted,
                    IsActive = a.IsActive,
                    AnswerTypes = answerTypes
                })
                .OrderByDescending(a => a.Id).ToListAsync();

            return new OperationResult<List<AnswersAdminConfirmViewModel>>(true, result, "لیست پاسخ های تایید نشده");
        }


        public async Task<OperationResult<AnswerViewModel>> AcceptAnswer(int answerId, string index)
        {
            var answer = _answerRepository.GetById(answerId);

            if (answer == null)
                return new OperationResult<AnswerViewModel>(false, null, "Answer not found");

            if (answer.IsDeleted || !string.IsNullOrWhiteSpace(answer.AnswerType) || answer.IsActive)
                return new OperationResult<AnswerViewModel>(false, null, "Answer not found");

            var tempAnswer = _mapper.Map<Answer>(answer);
            tempAnswer.Id = answerId;
            if (index == "0")
            {
                await _answerRepository.DeleteAsync(tempAnswer, false, true);
            }
            else
            {
                tempAnswer.AnswerType = index;
                tempAnswer.IsActive = true;
                await _answerRepository.UpdateAsync(tempAnswer, true);
            }

            var gamificationData = new CalculateScoreViewModel()
            {
                GroupName = GroupNameGamificationEnum.Answer,
                ActionName = ActionNameGamificationEnum.Create,
                Entity = tempAnswer
            };
            var scores = await _gamificationService.CalculateScores(gamificationData);

            var question = _questionRepository.GetById(tempAnswer.QuestionId);
            var questioner = _userRepository.GetById(question.UserId);
            var notificationStatus = _notificationSender.SendNotification(new SendNotificationDto()
            {
                Entity = tempAnswer,
                NotificationType = NotificationTypeEnum.AcceptAnswer,
                User = questioner
            });


            var result = _mapper.Map<AnswerViewModel>(tempAnswer);
            return new OperationResult<AnswerViewModel>(true, result, nameof(Answer) + $" رکورد {answerId} با موفقیت ویرایش شد");

        }
        #endregion
    }
}

