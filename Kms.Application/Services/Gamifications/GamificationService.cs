using Common.OperationResult;
using Common.Paging;
using Kms.Application.Senders;
using Kms.Application.Services.Account;
using Kms.Application.Services.General;
using Kms.Application.ViewModels;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.Account;
using Kms.Domain.Entities.General;
using Kms.Domain.Entities.QuestionAndAnswer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Kms.Domain.Entities.KnowledgeContentGroup;
using JsonSerializer = System.Text.Json.JsonSerializer;
using Kms.DataLayer.Repositories;
using Kms.Domain.Entities.ProjectAndProposal;
using Kms.Domain.Entities.UnitDocumentation;
using Microsoft.AspNetCore.Mvc.Diagnostics;
using Microsoft.OpenApi.Validations;
using AutoMapper;

namespace Kms.Application.Services.Gamifications
{
    #region Enums
    public enum GroupNameGamificationEnum
    {
        Question = 1,
        Answer = 2,
        KnowledgeContent = 3,
        Proposal = 4,
        Project = 5,
        Documentation = 6,
        Comment
    }

    public enum SubGroupNameGamificationEnum
    {
        StructuredKnowledgeContent = 1,
        NonStructuredKnowledgeContent = 2,
        LikeByExpert = 3,
        OfficialKnowledgeContent = 4,
        ChangeKnowledgeContent = 5
    }

    public enum ActionNameGamificationEnum
    {
        Create = 1,
        Search = 2,
        Like = 3,
        Confirm = 4,
        Official = 5,
        Change = 6,
        UnLike = 7,
        Deactivate = 8,
        Admin = 9,
        ChangeAttach = 10
    }

    public enum AccountForGamificationEnum
    {
        Owner = 1,
        Liker = 2,
        Liked = 3,
        Uploader = 4,
        ProposalAdmin = 5,
        ProjectAdmin = 6,
        UnLiker = 7

    }
    #endregion Enums

    public class GamificationService : IGamificationService
    {
        private readonly IScoreRepository _gamificationRepository;
        private readonly IUserScoreRepository _userScoreRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMedalRepository _medalRepository;
        private readonly IQuestionRepository _quesRepository;
        private readonly IAnswerRepository _answerRepository;
        private readonly IProcessProfessionalRepository _processProfessionalRepository;
        private readonly IQuestionGoalRepository _questionGoalRepository;
        private readonly IAdminRepository _adminRepository;
        private readonly IProposalRepository _proposalRepository;
        private readonly IKnowledgeContentRepository _KnowledgeContentRepository;
        private readonly IProjectRepository _projectRepository;
        private readonly IGeneralService _generalService;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IAccountService _accountService;
        private readonly INotificationSender _notificationSender;
        private readonly PagingOptions _pagingOptions;
        private readonly IMapper _mapper;
        #region Constructor

        public GamificationService(
            IScoreRepository gamificationRepository,
            IUserScoreRepository userScoreRepository,
            IMedalRepository medalRepository,
            IUserRepository userRepository,
            IGeneralService generalService,
            IQuestionRepository quesRepository,
            IAttachmentRepository attachmentRepository,
            IKnowledgeContentRepository knowledgeContentRepository,
            IAnswerRepository answerRepository,
            IProcessProfessionalRepository processProfessionalRepository,
            IQuestionGoalRepository questionGoalRepository,
            IProposalRepository proposalRepository,
            IProjectRepository projectRepository,
            IMapper mapper,
            IAdminRepository adminRepository,
            IAccountService accountService,
            INotificationSender notificationSender,
            IOptions<PagingOptions> pagingOptions)
        {
            _gamificationRepository = gamificationRepository;
            _userScoreRepository = userScoreRepository;
            _userRepository = userRepository;
            _generalService = generalService;
            _mapper = mapper;
            _quesRepository = quesRepository;
            _medalRepository = medalRepository;
            _attachmentRepository = attachmentRepository;
            _KnowledgeContentRepository = knowledgeContentRepository;
            _answerRepository = answerRepository;
            _processProfessionalRepository = processProfessionalRepository;
            _questionGoalRepository = questionGoalRepository;
            _adminRepository = adminRepository;
            _proposalRepository = proposalRepository;
            _projectRepository = projectRepository;
            _accountService = accountService;
            _notificationSender = notificationSender;
            _pagingOptions = pagingOptions.Value;
        }

        #endregion Constructor
        public async Task<OperationResult<List<UserScore>>> CalculateScores(
         CalculateScoreViewModel data,
         bool saveNow = true,
         bool sendNotification = true)
        {
            OperationResult<List<UserScore>> result;

            switch (data.GroupName)
            {
                case GroupNameGamificationEnum.Question:
                    result = await CalculateQuestionScore(data);
                    break;

                case GroupNameGamificationEnum.Answer:
                    result = await CalculateAnswerScore(data);
                    break;

                case GroupNameGamificationEnum.KnowledgeContent:
                    result = await CalculateKnowledgeContentScore(data);
                    break;
                case GroupNameGamificationEnum.Comment:
                    result = await CalculateCommentContentScore(data);
                    break;

                case GroupNameGamificationEnum.Proposal:
                    result = await CalculateProposalScore(data);
                    break;

                case GroupNameGamificationEnum.Project:
                    result = await CalculateProjectScore(data);
                    break;

                case GroupNameGamificationEnum.Documentation:
                    result = await CalculateDocumenationScore(data);
                    break;

                default:
                    result = new OperationResult<List<UserScore>>(false, null, "Type is not valid", new List<ModelError>());
                    break;
            }

            if (saveNow && result.IsSuccess && result.Data != null && result.Data.Any())
            {
                foreach (var score in result.Data)
                {
                    var totalScoreAmount = await _userScoreRepository.GetEntityAsNoTracking()
                        .Where(us => us.UserId == score.User.Id)
                        .SumAsync(us => us.ScoreAmount);


                    totalScoreAmount += score.ScoreAmount;


                    var newMedal = _generalService.GetMedalForScore(totalScoreAmount);

                    var medalChanged = newMedal?.Id != score.User.MedalId;

                    if (medalChanged)

                    {
                        score.User.MedalId = newMedal?.Id;
                        await _userRepository.UpdateAsync(score.User, true);
                        var medalNotificationData = new SendNotificationDto()
                        {
                            Entity = score,
                            NotificationType = NotificationTypeEnum.MedalChanged,
                            User = score.User
                        };

                        _notificationSender.SendNotification(medalNotificationData);
                    }

                    {
                        var gamificationNotificationData = new SendNotificationDto()
                        {
                            Entity = score,
                            NotificationType = NotificationTypeEnum.Gamification,
                            User = score.User
                        };

                        _notificationSender.SendNotification(gamificationNotificationData);
                    }
                }


                await _userScoreRepository.AddRangeAsync(result.Data, true);

            }

            return result;
        }
        public OperationResult<List<Score>> GetQuestionTypes()
        {
            var query = _gamificationRepository.GetEntity(a => a.GroupName == GroupNameGamificationEnum.Question.ToString() && a.ActionName == ActionNameGamificationEnum.Create.ToString(), true);
            return new OperationResult<List<Score>>(true, query.ToList(), string.Empty, new List<ModelError>());
        }
        public OperationResult<List<Score>> GetAnswerTypes()
        {
            var query = _gamificationRepository.GetEntity(a => a.GroupName == GroupNameGamificationEnum.Answer.ToString() && a.ActionName == ActionNameGamificationEnum.Create.ToString(), true);
            return new OperationResult<List<Score>>(true, query.ToList(), string.Empty, new List<ModelError>());
        }
        public async Task<OperationResult<List<UserScoreDetailsViewModel>>> GetUserScoreDetails(int userId, string? searchText, int? pageNo = null)
        {
            var user = _userRepository.GetById(userId);
            if (user == null)
                return new OperationResult<List<UserScoreDetailsViewModel>>(false, null!, "کاربر یافت نشد.", new List<ModelError>());

            var userScoresQuery = _userScoreRepository.GetEntityAsNoTracking().AsQueryable();

            #region Where
            userScoresQuery = userScoresQuery.Where(u => u.UserId == userId);
            if (!string.IsNullOrWhiteSpace(searchText))
            {
                // Nothing
            }

            #endregion Where

            #region Paging
            var totalEntitiesCount = await userScoresQuery.CountAsync();
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity,
                _pagingOptions.HowManyShowPageAfterAndBefore);

            userScoresQuery = _userScoreRepository.GetAllAsNoTrackWithPagingAsync(paging, userScoresQuery)
                //.Include(a => a.QuestionAnswers)!.ThenInclude(a => a.User)
                .Include(a => a.User)
                .Include(a => a.Score);


            #endregion Paging

            #region Description
            var result = new List<UserScoreDetailsViewModel>();
            foreach (var item in userScoresQuery)
            {
                var tempUserScore = new UserScoreDetailsViewModel()
                {
                    UserId = item.UserId,
                    Date = item.CreatedDate,
                    UserName = item.User.UserName,
                    FullName = item.User.FullName,
                    ScoreAmount = item.ScoreAmount,
                };
                switch (item.EntityName)
                {
                    case "Question":
                        tempUserScore.GroupName = @"پرسش";
                        break;
                    case "Answer":
                        tempUserScore.GroupName = @"پاسخ";
                        break;
                }
                switch (item.Score.ActionName)
                {
                    case "Create":
                        tempUserScore.ActionName = @"ثبت ";
                        break;
                }
                result.Add(tempUserScore);
            }
            #endregion Description

            return new OperationResult<List<UserScoreDetailsViewModel>>(true, result, string.Empty,
                new List<ModelError>(), paging);
        }
        public async Task<OperationResult<List<UserScoreAggregate>>> GetUserScoreAggregate(List<int>? userIds, int? pageNo = null)
        {
            var usersQuery = _userScoreRepository.GetEntityAsNoTracking().AsQueryable();

            #region Where
            if (userIds != null && userIds.Any())
                usersQuery = usersQuery.Where(a => userIds.Contains(a.UserId));
            #endregion Where

            #region Paging
            var groupByQuery =
                (from score in usersQuery
                 group score by score.User
                into scoreGroup
                 select new UserScore()
                 {
                     User = scoreGroup.Key,
                     UserId = scoreGroup.Key.Id,
                     ScoreAmount = scoreGroup.Sum(a => a.ScoreAmount),
                 }).OrderByDescending(a => a.ScoreAmount).ThenByDescending(a => a.UserId).AsQueryable();

            var totalEntitiesCount = await groupByQuery.CountAsync(); ;
            var paging = Pager.Build(pageNo ?? _pagingOptions.PageId, totalEntitiesCount, _pagingOptions.TakeEntity, _pagingOptions.HowManyShowPageAfterAndBefore);
            if (userIds == null || !userIds.Any())
                groupByQuery = groupByQuery.Skip(paging.SkipEntity).Take(paging.TakeEntity);
            #endregion Paging

            var result =
                (from res in groupByQuery
                 select new UserScoreAggregate()
                 {
                     UserId = res.UserId,
                     FullName = res.User.FullName,
                     UserName = res.User.UserName,
                     TotalScoreAmount = res.ScoreAmount
                 }).ToList();

            return new OperationResult<List<UserScoreAggregate>>(true, result, string.Empty, new List<ModelError>(),
                paging);
        }



        public async Task<OperationResult<List<ScoreViewModel>>> GetAllScore()
        {

            var groupNameTranslations = new Dictionary<string, string>
            {
                { "Question", "پرسش" },
                { "Answer", "پاسخ" },
                { "KnowledgeContent", "محتوای دانشی" },
                { "Proposal", "طرح" },
                { "Project", "پروژه" },
                { "Documentation", "مستندات واحدی" },
                { "Comment", "نظر" }
            };

            var actionNameTranslations = new Dictionary<string, string>
            {
                { "Create", "ایجاد" },
                { "Search", "جستجو" },
                { "Like", "لایک" },
                { "Confirm", "تایید" },
                { "Official", "درس آموخته" },
                { "Change", "تغییر" },
                { "UnLike", "برداشتن لایک" },
                { "Deactivate", "غیر فعال کردن" },
                { "Admin", "تایید ادمین" },
                { "ChangeAttach", "تبدیل به ساختار یافته" }
            };

            var scores = await _gamificationRepository.GetEntity(null, true).ToListAsync();

            var mappedScores = _mapper.Map<List<ScoreViewModel>>(scores);

            foreach (var score in mappedScores)
            {
                if (groupNameTranslations.TryGetValue(score.GroupName, out var translation))
                {
                    score.GroupName = translation;
                }
                if (actionNameTranslations.TryGetValue(score.ActionName, out var actionTranslation))
                {
                    score.ActionName = actionTranslation;
                }

                score.ScoreAmount += " امتیاز ";
            }

            var sortedResult = mappedScores.ToList();

            return new OperationResult<List<ScoreViewModel>>(true, sortedResult, "Score tree is here");
        }

        public async Task<OperationResult<List<UserScoreViewModel>>> GetAllUserScore()
        {
            var userScore = await _userScoreRepository.GetEntityAsNoTracking()
                .Include(s => s.User)
                .Include(s => s.Score)
                .OrderByDescending(s => s.Id)
                .ToListAsync();
            var result = userScore.Select(s => new UserScoreViewModel()
            {
                Id = s.Id,
                User = new UserViewerViewModel()
                {
                    UserId = Convert.ToInt32(s.User.IgtUserId),
                    FullName = s.User.FullName
                },
                EntityName = s.EntityName,
                ScoreAmount = s.ScoreAmount,
                Description = s.Description,
                CreateDate = s.CreatedDate,

            });
            return new OperationResult<List<UserScoreViewModel>>(true, result.ToList(), "User Score is here.");
        }
        #region Private Methods
        private async Task<OperationResult<List<UserScore>>> CalculateQuestionScore(CalculateScoreViewModel data)
        {
            var result = new OperationResult<List<UserScore>>(false, new List<UserScore>(), string.Empty, new List<ModelError>());
            var query = _gamificationRepository.GetEntity(a => a.GroupName == GroupNameGamificationEnum.Question.ToString(), true);
            var user = new User();
            Score? tempScore;
            switch (data.ActionName)
            {
                case ActionNameGamificationEnum.Create:
                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Create.ToString() &&
                        a.Index == int.Parse(((Question)data.Entity!).QuestionType!));
                    if (tempScore == null) break;

                    // Questioner
                    var question = (Question)data.Entity!;
                    user = _userRepository.GetById(question.UserId);

                    result.Data?.Add(new UserScore()
                    {
                        UserId = user!.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.Question.ToString(),
                        EntityId = (question.Id).ToString(),
                        Description = $@"امتیاز کسب شده به واسطه ثبت و تأیید و پرسش با عنوان {question.QuestionTitle}",
                        NotificationMessage =
                            tempScore.ScoreAmount != 0
                                ? $@"{user.FullName} عزیز پرسش شما با عنوان {question.QuestionTitle} توسط ادمین تأیید و {tempScore.ScoreAmount} امتیاز دریافت کردید. "
                                : "",
                        User = user
                    });
                    break;

                case ActionNameGamificationEnum.Search:

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Search.ToString());
                    if (tempScore == null) break;

                    user = _userRepository.GetById(_accountService.GetUserId());

                    result.Data?.Add(new UserScore()
                    {
                        UserId = user.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id!,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.Question.ToString(),
                        EntityId = string.Empty,
                        Description = $@"امتیاز کسب شده با جستجو در بین پرسش ها با عبارت:""{data.SearchText}""",
                        NotificationMessage = $@"{user.FullName} عزیز با جستجو در میان پرسش ها {tempScore.ScoreAmount} امتیاز دریافت کردید.",
                        User = user
                    });

                    break;

                case ActionNameGamificationEnum.Like:
                    var like = (Like)data.Entity!;
                    var likerUser = _userRepository.GetById(like.UserId);
                    var likedQuestion = _quesRepository.GetById(like.EntityId);
                    var likedUser = _userRepository.GetById(likedQuestion.UserId);
                    var questionGoals = await _questionGoalRepository.GetGoalsForAQuestion(likedQuestion.Id);
                    // Liker
                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Like.ToString()
                        && a.AccountFor == AccountForGamificationEnum.Liker.ToString());
                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = likerUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id!,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.Question.ToString(),
                            EntityId = likedQuestion.Id.ToString(),
                            Description = $@"لایک پرسش با عنوان {likedQuestion.QuestionTitle} مربوط به {likedUser.FullName}",
                            NotificationMessage = $@"{likerUser.FullName} عزیز با لایک پرسش با عنوان {likedQuestion.QuestionTitle} مربوط به {likedUser.FullName} مقدار {tempScore.ScoreAmount} امتیاز دریافت کردید.",
                            User = likerUser
                        });

                    // Liked
                    var isLikerExpert = false;
                    if (questionGoals.Any())
                    {
                        foreach (var goal in questionGoals)
                        {
                            isLikerExpert = await _processProfessionalRepository.CheckIfUserIsExpert(likerUser.Id, goal);
                            if (isLikerExpert) break;
                        }
                        if (isLikerExpert)
                        {
                            tempScore = query.FirstOrDefault(a =>
                                a.ActionName == ActionNameGamificationEnum.Like.ToString()
                                && a.AccountFor == AccountForGamificationEnum.Liked.ToString()
                                && a.SubGroupName == SubGroupNameGamificationEnum.LikeByExpert.ToString());
                        }
                        else
                        {
                            tempScore = query.FirstOrDefault(a =>
                                a.ActionName == ActionNameGamificationEnum.Like.ToString()
                                && a.AccountFor == AccountForGamificationEnum.Liked.ToString()
                                && a.SubGroupName == null);

                        }
                    }


                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = likedUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id!,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.Question.ToString(),
                            EntityId = likedQuestion.Id.ToString(),
                            Description = $@"با لایک شدن پرسش با عنوان {likedQuestion.QuestionTitle} توسط کاربر {likerUser.FullName}",
                            NotificationMessage = $@"{likedUser.FullName} عزیز پرسش شما با عنوان {likedQuestion.QuestionTitle} توسط {likerUser.FullName} لایک شد و {tempScore.ScoreAmount} امتیاز بابت آن دریافت کردید.",
                            User = likedUser
                        });

                    break;
                default:
                    // Nothing
                    break;

            }

            if (!result.Data.Any())
            {
                result.IsSuccess = false;
                result.Data = null!;
                result.Message = "Something went wrong";
                return result;
            }

            result.IsSuccess = true;
            result.Message = string.Empty;
            return result;
        }
        private async Task<OperationResult<List<UserScore>>> CalculateAnswerScore(CalculateScoreViewModel data)
        {
            OperationResult<List<UserScore>> result = new OperationResult<List<UserScore>>(false, new List<UserScore>(), string.Empty, new List<ModelError>());
            var tempScore = new Score();

            var query = _gamificationRepository.GetEntity(
                a => a.GroupName == GroupNameGamificationEnum.Answer.ToString(), true);
            List<Score> scores = null!;
            Question question;
            Answer answer;
            switch (data.ActionName)
            {
                case ActionNameGamificationEnum.Create:
                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Create.ToString() &&
                        a.Index == int.Parse(((Answer)data.Entity!).AnswerType!));
                    answer = (Answer)data.Entity!;
                    question = _quesRepository.GetById(answer.QuestionId)!;
                    var answerUser = _userRepository.GetById(answer.UserId);
                    result.Data?.Add(new UserScore()
                    {
                        UserId = answer.UserId,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore!.Id,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.Answer.ToString(),
                        EntityId = answer.Id.ToString(),
                        Description = $@"امتیاز کسب شده به واسطه ثبت و تأیید و پاسخ با متن {answer.AnswerText}",
                        NotificationMessage =
                            tempScore.ScoreAmount != 0
                                ? $@"{answerUser!.FullName} عزیز پاسخ شما به پرسش {question.QuestionTitle} توسط ادمین تأیید و {tempScore.ScoreAmount} امتیاز دریافت کردید. "
                                : "",
                        User = answerUser!
                    });
                    break;

                case ActionNameGamificationEnum.Like:
                    var like = (Like)data.Entity!;
                    var likerUser = _userRepository.GetById(like.UserId)!;
                    var likedAnswer = _answerRepository.GetById(like.EntityId);
                    var likedUser = _userRepository.GetById(likedAnswer!.UserId);
                    var questionGoals = await _questionGoalRepository.GetGoalsForAQuestion(likedAnswer.QuestionId);

                    var answerShortText = likedAnswer.AnswerText;
                    if (likedAnswer.AnswerText.Length > 20)
                        answerShortText = likedAnswer.AnswerText.Substring(0, 20) + " ...";

                    // Liker
                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Like.ToString()
                        && a.AccountFor == AccountForGamificationEnum.Liker.ToString())!;
                    result.Data?.Add(new UserScore()
                    {
                        UserId = likerUser.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.Question.ToString(),
                        EntityId = likedAnswer.Id.ToString(),
                        Description = $@"امتیاز کسب شده به واسطه لایک پاسخ {answerShortText} پاسخ داده شده توسط {likerUser.FullName}",
                        NotificationMessage =
                            tempScore.ScoreAmount != 0
                                ? $@"{likerUser.FullName} عزیز با لایک پاسخ {answerShortText} پاسخ داده شده توسط {likedUser.FullName} مقدار {tempScore.ScoreAmount} امتیاز دریافت کردید. "
                                : "",
                        User = likerUser
                    });

                    // Liked
                    var isLikerExpert = false;
                    if (questionGoals.Any())
                    {
                        foreach (var goal in questionGoals)
                        {
                            isLikerExpert = await _processProfessionalRepository.CheckIfUserIsExpert(likerUser.Id, goal);
                            if (isLikerExpert) break;
                        }
                        if (isLikerExpert)
                            tempScore = query.FirstOrDefault(a =>
                                a.ActionName == ActionNameGamificationEnum.Like.ToString()
                                && a.AccountFor == AccountForGamificationEnum.Liked.ToString()
                                && a.SubGroupName == SubGroupNameGamificationEnum.LikeByExpert.ToString());
                        else
                            tempScore = query.FirstOrDefault(a =>
                                a.ActionName == ActionNameGamificationEnum.Like.ToString()
                                && a.AccountFor == AccountForGamificationEnum.Liked.ToString()
                                && a.SubGroupName == null);
                    }

                    result.Data?.Add(new UserScore()
                    {
                        UserId = likedUser.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id!,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.Question.ToString(),
                        EntityId = likedAnswer.Id.ToString(),
                        Description = $@"امتیاز کسب شده به واسطه لایک پاسخ توسط {likerUser.FullName} مربوط به پاسخ {answerShortText}",
                        NotificationMessage =
                            tempScore.ScoreAmount != 0
                                ? $@"{likedUser.FullName} عزیز با لایک پاسخ شما توسط {likerUser.FullName} مقدار {tempScore.ScoreAmount} امتیاز دریافت کردید."
                                : "",
                        User = likedUser
                    });

                    break;


                default:
                    // Nothing
                    break;

            }

            if (!result.Data.Any())
            {
                result.IsSuccess = false;
                result.Data = null!;
                result.Message = "Something went wrong";
                return result;
            }

            result.IsSuccess = true;
            result.Message = string.Empty;
            return result;
        }

        private async Task<OperationResult<List<UserScore>>> CalculateCommentContentScore(CalculateScoreViewModel data)
        {
            OperationResult<List<UserScore>> result = new OperationResult<List<UserScore>>(false, new List<UserScore>(), string.Empty, new List<ModelError>());
            var tempScore = new Score();

            var query = _gamificationRepository.GetEntity(
                a => a.GroupName == GroupNameGamificationEnum.Comment.ToString(), true);
            List<Score> scores = null!;
            KnowledgeContent knowledgeContent;
            Comment comment;
            switch (data.ActionName)
            {
                case ActionNameGamificationEnum.Create:

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Create.ToString());

                    comment = (Comment)data.Entity!;
                    knowledgeContent = _KnowledgeContentRepository.GetById(comment.KnowledgeContentId)!;
                    var commentUser = _userRepository.GetById(comment.UserId);
                    result.Data?.Add(new UserScore()
                    {
                        UserId = comment.UserId,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore!.Id,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.Comment.ToString(),
                        EntityId = comment.Id.ToString(),
                        Description = $@"امتیاز کسب شده به واسطه ثبت پاسخ به محتوای دانشی ",
                        NotificationMessage =
                            tempScore.ScoreAmount != 0
                                ? $@"{commentUser!.FullName} عزیز پاسخ شما به محتوای دانشی {knowledgeContent.Title} ثبت و {tempScore.ScoreAmount} امتیاز دریافت کردید. "
                                : "",
                        User = commentUser!
                    });
                    break;

                default:
                    // Nothing
                    break;

            }

            if (!result.Data.Any())
            {
                result.IsSuccess = false;
                result.Data = null!;
                result.Message = "Something went wrong";
                return result;
            }

            result.IsSuccess = true;
            result.Message = string.Empty;
            return result;

        }
        private async Task<OperationResult<List<UserScore>>> CalculateKnowledgeContentScore(CalculateScoreViewModel data)
        {
            OperationResult<List<UserScore>> result = new OperationResult<List<UserScore>>(false, new List<UserScore>(), string.Empty, new List<ModelError>());
            var tempScore = new Score();

            var query = _gamificationRepository.GetEntity(
                a => a.GroupName == GroupNameGamificationEnum.KnowledgeContent.ToString(), true).Select(a => new DeserializedGamification()
                {
                    Id = a.Id,
                    Description = a.Description,
                    ScoreAmount = a.ScoreAmount,
                    GroupName = a.GroupName,
                    ActionName = a.ActionName,
                    CreatedDate = a.CreatedDate,
                    CreatedUserId = a.CreatedUserId,
                    IsDeleted = a.IsDeleted,
                    SubGroupName = a.SubGroupName,
                    AccountFor = a.AccountFor,
                    Guid = a.Guid,
                    LastModifiedUserId = a.LastModifiedUserId,
                    LastModifiedDate = a.LastModifiedDate,
                    IsActive = a.IsActive,
                    JsonCondition = a.JsonCondition,
                    Index = a.Index,
                    Type = a.Type,
                    Note = a.Note,
                    Condition = DeserializeGamificationCondition(a.JsonCondition!)
                }).ToList();

            List<Score> scores = null!;

            switch (data.ActionName)
            {
                case ActionNameGamificationEnum.Create:
                    var knowledgeContent = (KnowledgeContent)data.Entity!;
                    if (knowledgeContent == null)
                    {
                        result.IsSuccess = false;
                        result.Message = "Knowledge content is null.";
                        return result;
                    }
                    var wordCount = knowledgeContent?.Text.Split(' ', ',', '.').Count();
                    var charCount = knowledgeContent?.Text.Length;


                    query = query.Where(a =>
                        a.ActionName == ActionNameGamificationEnum.Create.ToString()).ToList();


                    if (data.SubGroupName == SubGroupNameGamificationEnum.StructuredKnowledgeContent)
                    {
                        query = query.Where(a =>
                            a.SubGroupName == SubGroupNameGamificationEnum.StructuredKnowledgeContent.ToString()).ToList();

                        tempScore = query.FirstOrDefault(a =>
                                 a.SubGroupName == SubGroupNameGamificationEnum.StructuredKnowledgeContent.ToString()
                                 && ((a.Condition!.UOM == "Word" && a.Condition.Min <= wordCount &&
                                      (a.Condition.Max == null || a.Condition.Max >= wordCount)) // اصلاح شرط برای Max که می‌تواند null باشد
                                     || (a.Condition!.UOM == "Character" && a.Condition.Min <= charCount &&
                                         (a.Condition.Max == null || a.Condition.Max >= charCount)) // مشابه برای تعداد کاراکترها
                                 ));

                        if (tempScore == null)
                        {
                            result.IsSuccess = false;
                            result.Message = "No score found for the given conditions.";
                            return result;
                        }
                        var user = _userRepository.GetById(knowledgeContent.UserId);
                        if (user == null)
                        {
                            result.IsSuccess = false;
                            result.Message = "User not found.";
                            return result;
                        }
                        result.Data.Add(new UserScore()
                        {
                            UserId = user!.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                            EntityId = (knowledgeContent.Id).ToString(),
                            Description = $@"امتیاز کسب شده به واسطه ثبت و تأیید و محتوای دانشی ساختار یافته با عنوان {knowledgeContent.Title}",
                            NotificationMessage =
                                    tempScore.ScoreAmount != 0
                                        ? $@"{user.FullName} عزیز محتوای ساختار یافته شما با عنوان {knowledgeContent.Title} ثبت و به واسطه آن  {tempScore.ScoreAmount.ToString("##,###")} امتیاز دریافت کردید."
                                        : "",
                            User = user
                        });
                    }

                    if (data.SubGroupName == SubGroupNameGamificationEnum.NonStructuredKnowledgeContent)
                    {
                        var isAttachment = await _attachmentRepository.GetEntityAsNoTracking().AnyAsync(s =>
                            s.EntityId == knowledgeContent.Id && s.EntityName == "KnowledgeContent");
                        query = query.Where(a =>
                            a.SubGroupName == SubGroupNameGamificationEnum.NonStructuredKnowledgeContent.ToString()).ToList();


                        //var isAttachment = true;
                        tempScore = query.FirstOrDefault(a =>
                            a.SubGroupName == SubGroupNameGamificationEnum.NonStructuredKnowledgeContent.ToString()
                            && (
                                (isAttachment && a.Condition!.UOM == "File" && a.Condition.Min <= wordCount &&
                                 (a.Condition.Max == null || a.Condition.Max >= wordCount)) // اصلاح شرط برای Max که می‌تواند null باشد
                                || (!isAttachment && a.Condition!.UOM == "Character" && a.Condition.Min <= charCount &&
                                    (a.Condition.Max == null || a.Condition.Max >= charCount)) // مشابه برای تعداد کاراکترها
                            )
                            );

                        if (tempScore == null)
                        {
                            result.IsSuccess = false;
                            result.Message = "No score found for the given conditions.";
                            return result;
                        }
                        var user = _userRepository.GetById(knowledgeContent.UserId);
                        if (user == null)
                        {
                            result.IsSuccess = false;
                            result.Message = "User not found.";
                            return result;
                        }



                        result.Data.Add(new UserScore()
                        {
                            UserId = user!.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                            EntityId = (knowledgeContent.Id).ToString(),
                            Description = $@"امتیاز کسب شده به واسطه ثبت و تأیید و محتوای دانشی غیر ساختار یافته با عنوان {knowledgeContent.Title}",
                            NotificationMessage =
                                tempScore.ScoreAmount != 0
                                    ? $@"{user.FullName} عزیز محتوای غیر ساختار یافته شما با عنوان {knowledgeContent.Title} ثبت و به واسطه آن  {tempScore.ScoreAmount.ToString("##,###")} امتیاز دریافت کردید."
                                    : "",
                            User = user
                        });




                    }
                    break;
                case ActionNameGamificationEnum.Search:

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Search.ToString());
                    if (tempScore == null) break;

                    var searcher = _userRepository.GetById(_accountService.GetUserId());

                    result.Data?.Add(new UserScore()
                    {
                        UserId = searcher.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id!,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                        EntityId = string.Empty,
                        Description = $@"امتیاز کسب شده با جستجو در بین پروژه ها با عبارت:""{data.SearchText}""",
                        NotificationMessage = $@"{searcher.FullName} عزیز با جستجو در میان محتوی دانشی {tempScore.ScoreAmount} امتیاز دریافت کردید.",
                        User = searcher
                    });
                    break;
                case ActionNameGamificationEnum.Like:
                    var like = (Like)data.Entity!;
                    var likerUser = _userRepository.GetById(like.UserId);
                    knowledgeContent = _KnowledgeContentRepository.GetById(like.EntityId);
                    var likedUser = _userRepository.GetById(knowledgeContent.UserId);
                    // Liker
                    var isLikerExpert = await _processProfessionalRepository.CheckIfUserIsExpert(likerUser!.Id, knowledgeContent.GoalId);

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Like.ToString()
                        && a.AccountFor == AccountForGamificationEnum.Liked.ToString()
                        && a.SubGroupName == null);

                    if (isLikerExpert)
                    {
                        tempScore = query.FirstOrDefault(a =>
                            a.ActionName == ActionNameGamificationEnum.Like.ToString()
                            && a.AccountFor == AccountForGamificationEnum.Liked.ToString()
                            && a.SubGroupName == SubGroupNameGamificationEnum.LikeByExpert.ToString());
                    }
                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = likedUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                            EntityId = knowledgeContent.Id.ToString(),
                            Description = $@"با لایک شدن محتوای دانشی با عنوان {knowledgeContent.Title} توسط کاربر {likerUser.FullName}",
                            NotificationMessage = $@"{likedUser.FullName} عزیز محتوای دانشی شما با عنوان {knowledgeContent.Title} توسط {likerUser.FullName} لایک شد و {tempScore.ScoreAmount} امتیاز بابت آن دریافت کردید.",
                            User = likedUser
                        });


                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Like.ToString()
                        && a.AccountFor == AccountForGamificationEnum.Liker.ToString()
                        && a.SubGroupName == null);
                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = likerUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id!,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                            EntityId = knowledgeContent.Id.ToString(),
                            Description = $@"لایک محتوی دانشی با عنوان {knowledgeContent.Title} مربوط به {likedUser.FullName}",
                            NotificationMessage = $@"{likerUser.FullName} عزیز با لایک محتوی دانشی با عنوان {knowledgeContent.Title} مربوط به {likedUser.FullName} مقدار {tempScore.ScoreAmount} امتیاز دریافت کردید.",
                            User = likerUser
                        });
                    break;
                case ActionNameGamificationEnum.Official:

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Official.ToString());
                    if (tempScore == null) break;
                    var knowledgeContentOfficial = (KnowledgeContent)data.Entity!;
                    if (knowledgeContentOfficial == null)
                    {
                        result.IsSuccess = false;
                        result.Message = "Knowledge content is null.";
                        return result;
                    }

                    var official = _userRepository.GetById(knowledgeContentOfficial.UserId);

                    if (official != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = official.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id!,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                            EntityId = string.Empty,
                            Description = @"تبدیل به سند دانشی",
                            NotificationMessage =
                                $@"{official.FullName} عزیز با تبدیل محتوای دانشی به درس آموخته {tempScore.ScoreAmount} امتیاز دریافت کردید.",
                            User = official
                        });
                    break;
                case ActionNameGamificationEnum.Change:

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Change.ToString());
                    if (tempScore == null) break;

                    var changeUser = _userRepository.GetById(_accountService.GetUserId());

                    result.Data?.Add(new UserScore()
                    {
                        UserId = changeUser.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id!,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                        EntityId = string.Empty,
                        Description = @"امتیاز کسب شده با تبدیل محتوای دانشی",
                        NotificationMessage = $@"{changeUser.FullName} عزیز با تبدیل محتوی دانشی به ساختار یافته {tempScore.ScoreAmount} امتیاز دریافت کردید.",
                        User = changeUser
                    });
                    break;
                case ActionNameGamificationEnum.ChangeAttach:

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.ChangeAttach.ToString());
                    if (tempScore == null) break;

                    var changeAttachUser = _userRepository.GetById(_accountService.GetUserId());

                    result.Data?.Add(new UserScore()
                    {
                        UserId = changeAttachUser.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id!,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                        EntityId = string.Empty,
                        Description = @"امتیاز کسب شده با تبدیل محتوای دانشی",
                        NotificationMessage = $@"{changeAttachUser.FullName} عزیز با تبدیل محتوی دانشی به ساختار یافته {tempScore.ScoreAmount} امتیاز دریافت کردید.",
                        User = changeAttachUser
                    });
                    break;
                case ActionNameGamificationEnum.UnLike:
                    var unLike = (Like)data.Entity!;
                    var unLikeUser = _userRepository.GetById(unLike.UserId);
                    knowledgeContent = _KnowledgeContentRepository.GetById(unLike.EntityId);

                    tempScore = query.FirstOrDefault(a =>
                             a.ActionName == ActionNameGamificationEnum.UnLike.ToString()
                             && a.AccountFor == AccountForGamificationEnum.UnLiker.ToString()
                             && a.SubGroupName == null);
                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = unLikeUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                            EntityId = knowledgeContent.Id.ToString(),
                            Description = $@"برداشتن لایک محتوای دانشی با عنوان {knowledgeContent.Title} توسط کاربر {unLikeUser.FullName}",
                            NotificationMessage = $@"{unLikeUser.FullName} عزیز لایک محتوای دانشی شما با عنوان {knowledgeContent.Title} برداشته شد و {tempScore.ScoreAmount} امتیاز بابت آن کسر گردید..",
                            User = unLikeUser
                        });
                    break;
                case ActionNameGamificationEnum.Deactivate:
                    var knowledgeContentDeactive = (KnowledgeContent)data.Entity!;
                    if (knowledgeContentDeactive == null)
                    {
                        result.IsSuccess = false;
                        result.Message = "Knowledge content is null.";
                        return result;
                    }

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Deactivate.ToString());
                    if (tempScore == null) break;


                    var deactiveUser = _userRepository.GetById(knowledgeContentDeactive.UserId);

                    if (deactiveUser != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = deactiveUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id!,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                            EntityId = string.Empty,
                            Description = @"غیر فعال کردن محتوای دانشی",
                            NotificationMessage =
                                $@"{deactiveUser.FullName} عزیز با غیر فعال شدن محتوای دانشی توسط ادمین {tempScore.ScoreAmount} امتیاز از شما کسر گردید.",
                            User = deactiveUser
                        });
                    break;
            }

            if (!result.Data.Any())
            {
                result.IsSuccess = false;
                result.Data = null!;
                result.Message = "Something went wrong";
                return result;
            }

            result.IsSuccess = true;
            result.Message = string.Empty;
            return result;
        }
        private async Task<OperationResult<List<UserScore>>> CalculateProposalScore(CalculateScoreViewModel data)
        {
            OperationResult<List<UserScore>> result = new OperationResult<List<UserScore>>(false, new List<UserScore>(), string.Empty, new List<ModelError>());
            var tempScore = new Score();

            var query = _gamificationRepository.GetEntity(
                a => a.GroupName == GroupNameGamificationEnum.Proposal.ToString(), true).ToList();
            List<Score> scores = null!;
            Proposal? proposal;
            switch (data.ActionName)
            {
                case ActionNameGamificationEnum.Confirm:
                    query = query.Where(a =>
                        a.ActionName == ActionNameGamificationEnum.Confirm.ToString()).ToList();

                    // Uploader
                    tempScore = query.FirstOrDefault(a =>
                        a.AccountFor == AccountForGamificationEnum.Uploader.ToString());
                    proposal = (Proposal)data.Entity!;
                    var promisor = _userRepository.GetById(proposal.UserId);
                    result.Data?.Add(new UserScore()
                    {
                        UserId = promisor.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id!,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.Proposal.ToString(),
                        EntityId = proposal.Id.ToString(),
                        Description = $@"امتیاز کسب شده به واسطه آپلود طرح با عنوان {proposal.Title}",
                        NotificationMessage =
                            tempScore.ScoreAmount != 0
                                ? $@"{promisor.FullName} عزیز طرح شما با عنوان {proposal.Title} در ویکی تیپاکس با کد {proposal.Code} توسط ادمین تأیید شد و {tempScore.ScoreAmount} امتیاز دریافت کردید."
                                : "",
                        User = promisor
                    });

                    // admin
                    tempScore = query.FirstOrDefault(a =>
                        a.AccountFor == AccountForGamificationEnum.ProposalAdmin.ToString());
                    var currentUser = _userRepository.GetById(_accountService.GetUserId());
                    var isAdmin = _adminRepository.GetAllAsNoTrackAsync(a =>
                        a.UserId == currentUser.Id && a.Kind == GroupNameGamificationEnum.Proposal.ToString()).Any();
                    if (isAdmin)
                    {
                        result.Data?.Add(new UserScore()
                        {
                            UserId = currentUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id!,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.Proposal.ToString(),
                            EntityId = proposal.Id.ToString(),
                            Description = $@"امتیاز کسب شده به واسطه تأیید طرح با عنوان {proposal.Title} به عنوان ادمین",
                            NotificationMessage =
                                tempScore.ScoreAmount != 0
                                    ? $@"{currentUser.FullName} عزیز بابت تأیید طرح با عنوان {proposal.Title} به میزان {tempScore.ScoreAmount} امتیاز دریافت کردید."
                                    : "",
                            User = currentUser
                        });
                    }

                    break;

                case ActionNameGamificationEnum.Like:
                    var like = (Like)data.Entity!;
                    var likerUser = _userRepository.GetById(like.UserId);
                    proposal = _proposalRepository.GetById(like.EntityId);
                    var likedUser = _userRepository.GetById(proposal.UserId);
                    // Liker
                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Like.ToString()
                        && a.AccountFor == AccountForGamificationEnum.Liker.ToString());
                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = likerUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id!,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.Proposal.ToString(),
                            EntityId = proposal.Id.ToString(),
                            Description = $@"لایک طرح با عنوان {proposal.Title} مربوط به {likedUser.FullName}",
                            NotificationMessage = $@"{likerUser.FullName} عزیز با لایک طرح با عنوان {proposal.Title} مربوط به {likedUser.FullName} مقدار {tempScore.ScoreAmount} امتیاز دریافت کردید.",
                            User = likerUser
                        });

                    // Liked

                    var isLikerExpert = await _processProfessionalRepository.CheckIfUserIsExpert(likerUser!.Id, proposal.GoalId);

                    if (isLikerExpert)
                    {
                        tempScore = query.FirstOrDefault(a =>
                            a.ActionName == ActionNameGamificationEnum.Like.ToString()
                            && a.AccountFor == AccountForGamificationEnum.Liked.ToString()
                            && a.SubGroupName == SubGroupNameGamificationEnum.LikeByExpert.ToString());
                    }
                    else
                    {
                        tempScore = query.FirstOrDefault(a =>
                            a.ActionName == ActionNameGamificationEnum.Like.ToString()
                            && a.AccountFor == AccountForGamificationEnum.Liked.ToString()
                            && a.SubGroupName == null);

                    }

                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = likedUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id!,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.Proposal.ToString(),
                            EntityId = proposal.Id.ToString(),
                            Description = $@"با لایک شدن طرح با عنوان {proposal.Title} توسط کاربر {likerUser.FullName}",
                            NotificationMessage = $@"{likedUser.FullName} عزیز طرح شما با عنوان {proposal.Title} توسط {likerUser.FullName} لایک شد و {tempScore.ScoreAmount} امتیاز بابت آن دریافت کردید.",
                            User = likedUser
                        });
                    break;

                case ActionNameGamificationEnum.Search:

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Search.ToString());
                    if (tempScore == null) break;

                    var searcher = _userRepository.GetById(_accountService.GetUserId());

                    result.Data?.Add(new UserScore()
                    {
                        UserId = searcher.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id!,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.Proposal.ToString(),
                        EntityId = string.Empty,
                        Description = $@"امتیاز کسب شده با جستجو در بین طرح ها با عبارت:""{data.SearchText}""",
                        NotificationMessage = $@"{searcher.FullName} عزیز با جستجو در میان طرح ها {tempScore.ScoreAmount} امتیاز دریافت کردید.",
                        User = searcher
                    });
                    break;

                case ActionNameGamificationEnum.UnLike:
                    var unLike = (Like)data.Entity!;
                    var unLikeUser = _userRepository.GetById(unLike.UserId);
                    proposal = _proposalRepository.GetById(unLike.EntityId);

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.UnLike.ToString()
                        && a.AccountFor == AccountForGamificationEnum.UnLiker.ToString()
                        && a.SubGroupName == null);
                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = unLikeUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                            EntityId = proposal.Id.ToString(),
                            Description = $@"برداشتن لایک طرح با عنوان {proposal.Title} توسط کاربر {unLikeUser.FullName}",
                            NotificationMessage = $@"{unLikeUser.FullName} عزیز لایک طرح شما با عنوان {proposal.Title} برداشته شد و {tempScore.ScoreAmount} امتیاز بابت آن کسر گردید..",
                            User = unLikeUser
                        });
                    break;

                case ActionNameGamificationEnum.Admin:
                    var proposalAdmin = (Proposal)data.Entity!;
                    var proposalUser = _userRepository.GetById(proposalAdmin.UserId);

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Admin.ToString()
                        && a.AccountFor == AccountForGamificationEnum.Owner.ToString()
                        && a.SubGroupName == null);
                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = proposalUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                            EntityId = proposalAdmin.Id.ToString(),
                            Description = $@"ثبت طرح با عنوان {proposalAdmin.Title} توسط کاربر {proposalUser.FullName}",
                            NotificationMessage = $@"{proposalUser.FullName} عزیز طرح شما با عنوان {proposalAdmin.Title} ثبت شد و {tempScore.ScoreAmount} امتیاز بابت آن کسب گردید.",
                            User = proposalUser
                        });
                    break;
            }

            if (!result.Data.Any())
            {
                result.IsSuccess = false;
                result.Data = null!;
                result.Message = "Something went wrong";
                return result;
            }





            result.IsSuccess = true;
            result.Message = string.Empty;
            return result;

        }
        private async Task<OperationResult<List<UserScore>>> CalculateProjectScore(CalculateScoreViewModel data)
        {
            var result = new OperationResult<List<UserScore>>(false, new List<UserScore>(), string.Empty, new List<ModelError>());
            var tempScore = new Score();

            var query = _gamificationRepository.GetEntity(
                a => a.GroupName == GroupNameGamificationEnum.Project.ToString(), true).ToList();
            List<Score> scores = null!;
            Project? project;
            switch (data.ActionName)
            {
                case ActionNameGamificationEnum.Confirm:
                    query = query.Where(a =>
                        a.ActionName == ActionNameGamificationEnum.Confirm.ToString()).ToList();

                    // Uploader
                    tempScore = query.FirstOrDefault(a =>
                        a.AccountFor == AccountForGamificationEnum.Uploader.ToString());
                    project = (Project)data.Entity!;
                    var promisor = _userRepository.GetById(project.UserId);
                    result.Data?.Add(new UserScore()
                    {
                        UserId = promisor.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id!,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.Project.ToString(),
                        EntityId = project.Id.ToString(),
                        Description = $@"امتیاز کسب شده به واسطه آپلود پروژخ با عنوان {project.Title}",
                        NotificationMessage =
                            tempScore.ScoreAmount != 0
                                ? $@"{promisor.FullName} عزیز پروژه شما با عنوان {project.Title} در ویکی تیپاکس با کد {project.Code} توسط ادمین تأیید شد و {tempScore.ScoreAmount} امتیاز دریافت کردید."
                                : "",
                        User = promisor
                    });

                    // admin
                    tempScore = query.FirstOrDefault(a =>
                        a.AccountFor == AccountForGamificationEnum.ProjectAdmin.ToString());
                    var currentUser = _userRepository.GetById(_accountService.GetUserId());
                    var isAdmin = _adminRepository.GetAllAsNoTrackAsync(a =>
                        a.UserId == currentUser.Id && a.Kind == GroupNameGamificationEnum.Project.ToString()).Any();
                    if (isAdmin)
                    {
                        result.Data?.Add(new UserScore()
                        {
                            UserId = currentUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id!,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.Project.ToString(),
                            EntityId = project.Id.ToString(),
                            Description = $@"امتیاز کسب شده به واسطه تأیید پروژه با عنوان {project.Title} به عنوان ادمین",
                            NotificationMessage =
                                tempScore.ScoreAmount != 0
                                    ? $@"{currentUser.FullName} عزیز بابت تأیید پروژه با عنوان {project.Title} به میزان {tempScore.ScoreAmount} امتیاز دریافت کردید."
                                    : "",
                            User = currentUser
                        });
                    }

                    break;
                case ActionNameGamificationEnum.Like:
                    var like = (Like)data.Entity!;
                    var likerUser = _userRepository.GetById(like.UserId);
                    project = _projectRepository.GetById(like.EntityId);
                    var likedUser = _userRepository.GetById(project.UserId);
                    // Liker
                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Like.ToString()
                        && a.AccountFor == AccountForGamificationEnum.Liker.ToString());
                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = likerUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id!,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.Project.ToString(),
                            EntityId = project.Id.ToString(),
                            Description = $@"لایک پروژه با عنوان {project.Title} مربوط به {likedUser.FullName}",
                            NotificationMessage = $@"{likerUser.FullName} عزیز با لایک پروژه با عنوان {project.Title} مربوط به {likedUser.FullName} مقدار {tempScore.ScoreAmount} امتیاز دریافت کردید.",
                            User = likerUser
                        });

                    // Liked

                    var isLikerExpert = await _processProfessionalRepository.CheckIfUserIsExpert(likerUser!.Id, project.GoalId);

                    if (isLikerExpert)
                    {
                        tempScore = query.FirstOrDefault(a =>
                            a.ActionName == ActionNameGamificationEnum.Like.ToString()
                            && a.AccountFor == AccountForGamificationEnum.Liked.ToString()
                            && a.SubGroupName == SubGroupNameGamificationEnum.LikeByExpert.ToString());
                    }
                    else
                    {
                        tempScore = query.FirstOrDefault(a =>
                            a.ActionName == ActionNameGamificationEnum.Like.ToString()
                            && a.AccountFor == AccountForGamificationEnum.Liked.ToString()
                            && a.SubGroupName == null);

                    }

                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = likedUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id!,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.Project.ToString(),
                            EntityId = project.Id.ToString(),
                            Description = $@"با لایک شدن پروژه با عنوان {project.Title} توسط کاربر {likerUser.FullName}",
                            NotificationMessage = $@"{likedUser.FullName} عزیز پروژه شما با عنوان {project.Title} توسط {likerUser.FullName} لایک شد و {tempScore.ScoreAmount} امتیاز بابت آن دریافت کردید.",
                            User = likedUser
                        });
                    break;
                case ActionNameGamificationEnum.Search:

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Search.ToString());
                    if (tempScore == null) break;

                    var searcher = _userRepository.GetById(_accountService.GetUserId());

                    result.Data?.Add(new UserScore()
                    {
                        UserId = searcher.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id!,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.Project.ToString(),
                        EntityId = string.Empty,
                        Description = $@"امتیاز کسب شده با جستجو در بین پروژه ها با عبارت:""{data.SearchText}""",
                        NotificationMessage = $@"{searcher.FullName} عزیز با جستجو در میان پروژه ها {tempScore.ScoreAmount} امتیاز دریافت کردید.",
                        User = searcher
                    });
                    break;
                case ActionNameGamificationEnum.UnLike:
                    var unLike = (Like)data.Entity!;
                    var unLikeUser = _userRepository.GetById(unLike.UserId);
                    project = _projectRepository.GetById(unLike.EntityId);

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.UnLike.ToString()
                        && a.AccountFor == AccountForGamificationEnum.UnLiker.ToString()
                        && a.SubGroupName == null);
                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = unLikeUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                            EntityId = project.Id.ToString(),
                            Description = $@"برداشتن لایک پروژه با عنوان {project.Title} توسط کاربر {unLikeUser.FullName}",
                            NotificationMessage = $@"{unLikeUser.FullName} عزیز لایک پروژه شما با عنوان {project.Title} برداشته شد و {tempScore.ScoreAmount} امتیاز بابت آن کسر گردید..",
                            User = unLikeUser
                        });
                    break;
                case ActionNameGamificationEnum.Admin:
                    var projectAdmin = (Project)data.Entity!;
                    var projectUser = _userRepository.GetById(projectAdmin.UserId);

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Admin.ToString()
                        && a.AccountFor == AccountForGamificationEnum.Owner.ToString()
                        && a.SubGroupName == null);
                    if (tempScore != null)
                        result.Data?.Add(new UserScore()
                        {
                            UserId = projectUser.Id,
                            GamificationDetail = JsonConvert.SerializeObject(tempScore),
                            ScoreId = tempScore.Id,
                            ScoreAmount = tempScore.ScoreAmount,
                            EntityName = GroupNameGamificationEnum.KnowledgeContent.ToString(),
                            EntityId = projectAdmin.Id.ToString(),
                            Description = $@"ثبت پروژه با عنوان {projectAdmin.Title} توسط کاربر {projectUser.FullName}",
                            NotificationMessage = $@"{projectUser.FullName} عزیز پروژه شما با عنوان {projectAdmin.Title} ثبت شد و {tempScore.ScoreAmount} امتیاز بابت آن کسب گردید.",
                            User = projectUser
                        });
                    break;

            }

            if (!result.Data.Any())
            {
                result.IsSuccess = false;
                result.Data = null!;
                result.Message = "Something went wrong";
                return result;
            }





            result.IsSuccess = true;
            result.Message = string.Empty;
            return result;

        }
        private async Task<OperationResult<List<UserScore>>> CalculateDocumenationScore(CalculateScoreViewModel data)
        {
            var result = new OperationResult<List<UserScore>>(false, new List<UserScore>(), string.Empty, new List<ModelError>());
            var tempScore = new Score();

            var query = _gamificationRepository.GetEntity(
                a => a.GroupName == GroupNameGamificationEnum.Documentation.ToString(), true).ToList();
            List<Score> scores = null!;
            UnitDocumentation document;
            switch (data.ActionName)
            {
                case ActionNameGamificationEnum.Confirm:
                    query = query.Where(a =>
                        a.ActionName == ActionNameGamificationEnum.Confirm.ToString()).ToList();

                    // Uploader
                    tempScore = query.FirstOrDefault(a =>
                        a.AccountFor == AccountForGamificationEnum.Owner.ToString());
                    document = (UnitDocumentation)data.Entity!;
                    var promisor = _userRepository.GetById(document.UserId);
                    result.Data?.Add(new UserScore()
                    {
                        UserId = promisor.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id!,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.Documentation.ToString(),
                        EntityId = document.Id.ToString(),
                        Description = $@"امتیاز کسب شده به واسطه تایید مستند واحدی توسط ادمین با عنوان {document.Title}",
                        NotificationMessage =
                            tempScore.ScoreAmount != 0
                                ? $@"{promisor.FullName} عزیز مستند واحدی شما با عنوان {document.Title} در ویکی تیپاکس توسط ادمین تأیید شد و {tempScore.ScoreAmount} امتیاز دریافت کردید."
                                : "",
                        User = promisor
                    });

                    //		// admin
                    //		tempScore = query.FirstOrDefault(a =>
                    //			a.AccountFor == AccountForGamificationEnum.ProjectAdmin.ToString());
                    //		var currentUser = _userRepository.GetById(_accountService.GetUserId());
                    //		var isAdmin = _adminRepository.GetAllAsNoTrackAsync(a =>
                    //			a.UserId == currentUser.Id && a.Kind == GroupNameGamificationEnum.Project.ToString()).Any();
                    //		if (isAdmin)
                    //		{
                    //			result.Data?.Add(new UserScore()
                    //			{
                    //				UserId = currentUser.Id,
                    //				GamificationDetail = JsonConvert.SerializeObject(tempScore),
                    //				ScoreId = tempScore.Id!,
                    //				ScoreAmount = tempScore.ScoreAmount,
                    //				EntityName = GroupNameGamificationEnum.Proposal.ToString(),
                    //				EntityId = project.Id.ToString(),
                    //				Description = $@"امتیاز کسب شده به واسطه تأیید پروژه با عنوان {project.Title} به عنوان ادمین",
                    //				NotificationMessage =
                    //					tempScore.ScoreAmount != 0
                    //						? $@"{currentUser.FullName} عزیز بابت تأیید پروژه با عنوان {project.Title} به میزان {tempScore.ScoreAmount} امتیاز دریافت کردید."
                    //						: "",
                    //				User = promisor
                    //			});
                    //		}

                    break;
                case ActionNameGamificationEnum.Search:

                    tempScore = query.FirstOrDefault(a =>
                        a.ActionName == ActionNameGamificationEnum.Search.ToString());
                    if (tempScore == null) break;

                    var searcher = _userRepository.GetById(_accountService.GetUserId());

                    result.Data?.Add(new UserScore()
                    {
                        UserId = searcher.Id,
                        GamificationDetail = JsonConvert.SerializeObject(tempScore),
                        ScoreId = tempScore.Id!,
                        ScoreAmount = tempScore.ScoreAmount,
                        EntityName = GroupNameGamificationEnum.Documentation.ToString(),
                        EntityId = string.Empty,
                        Description = $@"امتیاز کسب شده با جستجو در بین پروژه ها با عبارت:""{data.SearchText}""",
                        NotificationMessage = $@"{searcher.FullName} عزیز با جستجو در میان مستندات {tempScore.ScoreAmount} امتیاز دریافت کردید.",
                        User = searcher
                    });
                    break;

            }

            if (!result.Data.Any())
            {
                result.IsSuccess = false;
                result.Data = null!;
                result.Message = "Something went wrong";
                return result;
            }





            result.IsSuccess = true;
            result.Message = string.Empty;
            return result;

        }
        private static GamificationCondition DeserializeGamificationCondition(string? condition)
        {
            if (string.IsNullOrEmpty(condition))
            {
                // در صورت null بودن json، مقدار null را برگردانید
                return null;
            }
            return JsonSerializer.Deserialize<GamificationCondition>(condition);
        }

        #endregion Private Methods
    }
}