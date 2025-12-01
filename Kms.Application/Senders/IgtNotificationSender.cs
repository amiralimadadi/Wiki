using Kms.Application.ViewModel.Options;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Common.Mentions;
using Kms.Application.Services.Account;
using Microsoft.Extensions.Options;
using Kms.Application.ViewModels;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.QuestionAndAnswer;
using Kms.Domain.Entities.Account;
using Azure;
using Kms.Application.Services.General;
using Kms.Domain.Entities.General;
using Kms.Domain.Entities.KnowledgeContentGroup;
using Kms.DataLayer.Repositories;
using Kms.Domain.Entities.ProjectAndProposal;
using Microsoft.EntityFrameworkCore;
using Kms.Domain.Entities.UnitDocumentation;

namespace Kms.Application.Senders
{
	public class IgtNotificationSender : INotificationSender
	{

		private readonly IUserRepository _userRepository;
		private readonly IAccountService _accountService;
		private readonly IgtSetting _igtSettings;
		private readonly IGeneralService _generalService;
        private readonly IgtFrontRouteId _igtFrontRouteId;
		private readonly IViewersRepository _viewersRepository;
		private readonly IUnitRepository _unitRepository;

		public IgtNotificationSender(
            IUserRepository userRepository,
            IAccountService accountService,
			IGeneralService generalService,
			IViewersRepository viewersRepository,
			IUnitRepository unitRepository,
            IOptions<IgtSetting> igtSettings,
            IOptions<IgtFrontRouteId> igtFrontRouteId
            )
		{
			_userRepository = userRepository;
			_accountService = accountService;
			_generalService	= generalService;
			_viewersRepository= viewersRepository;
			_unitRepository= unitRepository;
			_igtSettings = igtSettings.Value;
            _igtFrontRouteId = igtFrontRouteId.Value;
        }
		public async Task<bool> SendNotificationAsync(int userId, string title, string description, int igtFrontRoute)
		{
			var client = new HttpClient();

			var uri = $"{_igtSettings.ApiUrl}{_igtSettings.NotificationApi}";

			var authToken = _accountService.GetUserToken();
			if (string.IsNullOrEmpty(authToken))
			{
				throw new Exception("در عملیات ثبت ارجاعات خطا روی داده است. توکن احراز هویت یافت نشد");
			}

			client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", authToken);

			var requestBody = new
			{
				title = title,
				description = description,
				userId = userId,
                frontendRouteId = igtFrontRoute
			};

			var jsonContent = JsonSerializer.Serialize(requestBody);

			var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

			var response = await client.PostAsync(uri, content);
			response.EnsureSuccessStatusCode();
			string responseBody = await response.Content.ReadAsStringAsync();
			var igtResponse = JsonSerializer.Deserialize<IgtNotificationResponseViewModel>(responseBody);

			return response.IsSuccessStatusCode;

		}

		public bool SendNotificationAsync(IgtNotificationRequestViewModel data)
		{
			var client = new HttpClient();

			var uri = $"{_igtSettings.ApiUrl}{_igtSettings.NotificationApi}";

			var authToken = _accountService.GetUserToken();
			if (string.IsNullOrEmpty(authToken))
			{
				throw new Exception("در عملیات ثبت ارجاعات خطا روی داده است. توکن احراز هویت یافت نشد");
			}

			client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", authToken);



			var jsonContent = JsonSerializer.Serialize(data);

			var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

			var response = client.PostAsync(uri, content);
			//response.EnsureSuccessStatusCode();
			var responseBody = response.Result.Content.ReadAsStringAsync();
			var igtResponse = JsonSerializer.Deserialize<IgtNotificationResponseViewModel>(responseBody.Result);


			return response.Result.IsSuccessStatusCode;

		}

		//public async Task<List<IgtNotificationResponseViewModel>> SendNotification(SendNotificationDto data)
		public List<IgtNotificationResponseViewModel> SendNotification(SendNotificationDto data)

		{
			var result = new List<IgtNotificationResponseViewModel>();

			var client = new HttpClient();

			var uri = $"{_igtSettings.ApiUrl}{_igtSettings.NotificationApi}";

			var authToken = _accountService.GetUserToken();
			if (string.IsNullOrEmpty(authToken))
			{
				throw new Exception("در عملیات ثبت ارجاعات خطا روی داده است. توکن احراز هویت یافت نشد");
			}

			client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", authToken);

			var requestData = CreateVmForNotification(data);
			foreach (var req in requestData)
			{
				var jsonContent = JsonSerializer.Serialize(req);
				var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
				var response = client.PostAsync(uri, content);
				response.Result.EnsureSuccessStatusCode();
				var responseBody = response.Result.Content.ReadAsStringAsync();
				var igtResponse = JsonSerializer.Deserialize<IgtNotificationResponseViewModel>(responseBody.Result);
				if (igtResponse != null)
					result.Add(igtResponse);
			}

			return result;
		}

		private List<IgtNotificationRequestViewModel> CreateVmForNotification(SendNotificationDto data)
		{
			var result = new List<IgtNotificationRequestViewModel>();
			switch (data.NotificationType)
			{
				//  اعلان محتوی دانشی  
                case NotificationTypeEnum.KnowledgeContentStructureCreate:
                    var knowledgeContent = (KnowledgeContent)data.Entity;
                    result.Add(new IgtNotificationRequestViewModel()
                    {
                        UserId = data.User.Id,
                        Title = "ثبت محتوای دانشی جدید",
                        Description = $"{data.User.FullName} عزیز، محتوای دانشی شما در ویکی تیپاکس ثبت شد.",
                        FrontendRouteId = _igtFrontRouteId.WikiAllKnowledgeContent
                    });
                    var mentionUserIdsForKnowledge = MentionJob.ExtractUserIdsFromString(knowledgeContent.MentionUserIds!);
                    if (mentionUserIdsForKnowledge.Any())
                    {
                        var mentionUsersForKnowledge = _userRepository.GetAllAsNoTrackAsync(a => mentionUserIdsForKnowledge.Contains(a.Id))
                            .ToList();
                        foreach (var user in mentionUsersForKnowledge)
                        {
                            result.Add(new IgtNotificationRequestViewModel
                            {
                                UserId = user.Id,
                                Title = "ارجاع محتوای دانشی",
                                Description = $"{data.User.FullName} عزیز،محتوای دانشی شما در ویکی تیپاکس به {user.FirstName} ارسال شد.",
                                FrontendRouteId = _igtFrontRouteId.WikiMentionKnowledgeContent
                            });
                            result.Add(new IgtNotificationRequestViewModel
                            {
                                UserId = user.Id,
                                Title = "ارجاع محتوای دانشی",
                                Description = $"{user.FullName} عزیز، از طرف {data.User.FullName} برای شما محتوای دانشی ارسال شده است.",
                                FrontendRouteId = _igtFrontRouteId.WikiMentionKnowledgeContent
                            });
                        }

                    }
                    var unitIdList = _viewersRepository.GetEntityAsNoTracking()
                        .Where(a => a.Kind == "KnowledgeContent" && a.EntityId == knowledgeContent.Id)
                        .Select(a => a.UnitId).ToList();
                    if (unitIdList.Any())
                    {
                        var unitNames = _unitRepository.GetEntityAsNoTracking()
                            .Where(u => unitIdList.Contains(u.IgtDepartmentId))
                            .Select(u => u.UnitName)
                            .ToList();

                        var unitNameList = string.Join(", ", unitNames);
                        result.Add(new IgtNotificationRequestViewModel()
                        {
                            UserId = data.User.Id,
                            Title = "ارجاع به واحد",
                            Description = $"{data.User.FullName} عزیز، محتوای دانشی شما در ویکی تیپاکس برای واحد(های) {unitNameList} نمایش داده می‌شود.",
                            FrontendRouteId = _igtFrontRouteId.WikiAllKnowledgeContent

                        });
                    }
                    break;
                case NotificationTypeEnum.ExpertLikeKnowledgeContent:
                    result.Add(new IgtNotificationRequestViewModel()
                    {
                        UserId = data.User.Id,
                        Title = "تبدیل به ساختار یافته",
                        Description = $"{data.User.FullName} عزیز، محتوای دانشی ثبت شده شما مستعد ساختار یافته شدن است؛ در صورت تمایل جهت تبدیل محتوا به ساختار یافته روی کلید تبدیل کلیک کنید.",
                        FrontendRouteId = _igtFrontRouteId.WikiAllKnowledgeContent
                    });

                    break;
                case NotificationTypeEnum.LikeKnowledgeContent:
                    var knowledgeContentLiked = (KnowledgeContent)data.Entity;
                    var goalTitle = knowledgeContentLiked.Goal.GoalTitle;
                    result.Add(new IgtNotificationRequestViewModel()
                    {
                        UserId = data.User.Id,
                        Title = "تایید خبرگی",
                        Description = $"{data.User.FullName} عزیز، شما یک تایید خبرگی جهت قرار گرفتن در لیست خبرگان حوزه دانشی {goalTitle} دریافت کردید.",
                        FrontendRouteId = _igtFrontRouteId.WikiAllKnowledgeContent
                    });
                    break;
                case NotificationTypeEnum.ChanheKnowledgeContentToStructured:
                    result.Add(new IgtNotificationRequestViewModel
                    {
                        UserId = data.User.Id,
                        Title = "تبدیل محتوای دانشی",
                        Description = $"{data.User.FullName} عزیز،محتوای دانشی شما ساختار یافته گردید.",
                        FrontendRouteId = _igtFrontRouteId.WikiAllKnowledgeContent
                    });
                    break;
                case NotificationTypeEnum.ChangeKnowledgeContentToOfficial:
                    result.Add(new IgtNotificationRequestViewModel
                    {
                        UserId = data.User.Id,
                        Title = "تبدیل به درس آموخته",
                        Description = $"{data.User.FullName} عزیز،محتوای دانشی شما در گروه درس آموخته های سازمان قرار گرفت.",
                        FrontendRouteId = _igtFrontRouteId.WikiAllKnowledgeContent
                    });
                    break;

                //  اعلان پرسش و پاسخ
                case NotificationTypeEnum.QuestionCreate:
					var question = (Question)data.Entity;
					result.Add(new IgtNotificationRequestViewModel
					{
						UserId = question.UserId,
						Title = "ثبت پرسش جدید",
						Description = $"{data.User.FullName} عزیز، پرسش شما در ویکی تیپاکس ثبت شد. در صورت تأیید ادمین نمایش داده میشود.",
						FrontendRouteId = _igtFrontRouteId.WikiAllQuestion
					});

					var mentionUserIds = MentionJob.ExtractUserIdsFromString(question.MentionUserIds!);
					if (mentionUserIds.Any())
					{
						var mentionUsers = _userRepository.GetAllAsNoTrackAsync(a => mentionUserIds.Contains(a.Id))
							.ToList();
						foreach (var user in mentionUsers)
						{
							// TODO:  به نظر بعد از تأیید ادمین ارسال نوتیفیکیشن صحیح تر است
							result.Add(new IgtNotificationRequestViewModel()
							{
								UserId = question.UserId,
								Title = "ارجاع پرسش",
								Description = $"{data.User.FullName} عزیز پرسش شما در ویکی تیپاکس به {user.FullName} ارسال شد.",
								FrontendRouteId = _igtFrontRouteId.WikiMentionQuestion
							});

							result.Add(new IgtNotificationRequestViewModel()
							{
								UserId = user.Id,
								Title = "ارجاع پرسش",
								Description = $"{user.FullName} عزیز، از طرف {data.User.FullName} برای شما پرسشی ارسال شده است.",
								FrontendRouteId = _igtFrontRouteId.WikiMentionQuestion
							});
						}
					}
					break;
				case NotificationTypeEnum.AnswerCreate:
					var answer = (Answer)data.Entity;
					result.Add(new IgtNotificationRequestViewModel()
					{
						UserId = answer.UserId,
						Title = "ثبت پاسخ جدید",
						Description = $"{data.User.FullName} عزیز، پاسخ شما در ویکی تیپاکس ثبت شد. در صورت تأیید ادمین نمایش داده میشود.",
						//FrontendRouteId = _igtFrontRouteId.WikiAllQuestion
					});

					var mentionUserIdsForAnswer = MentionJob.ExtractUserIdsFromString(answer.MentionUserIds!);
					if (mentionUserIdsForAnswer.Any())
					{
						var mentionUsers = _userRepository.GetAllAsNoTrackAsync(a => mentionUserIdsForAnswer.Contains(a.Id))
							.ToList();
						foreach (var user in mentionUsers)
						{
							// TODO:  به نظر بعد از تأیید ادمین ارسال نوتیفیکیشن صحیح تر است
							result.Add(new IgtNotificationRequestViewModel()
							{
								UserId = answer.UserId,
								Title = "ارجاع پاسخ",
								Description = $"{data.User.FullName} عزیز پاسخ شما در ویکی تیپاکس به {user.FullName} ارسال شد.",
								//FrontendRouteId = _igtFrontRouteId.WikiMentionQuestion
							});

							result.Add(new IgtNotificationRequestViewModel()
							{
								UserId = user.Id,
								Title = "ارجاع پاسخ",
								Description = $"{user.FullName} عزیز، از طرف {data.User.FullName} برای شما پاسخی ارسال شده است.",
								FrontendRouteId = _igtFrontRouteId.WikiMentionQuestion
							});
						}
					}
					break;
				case NotificationTypeEnum.Gamification:
					var userScore = (UserScore)data.Entity;
                    if (userScore.ScoreAmount == 0 && !string.IsNullOrWhiteSpace(userScore.NotificationMessage))
                    {
                        result.Add(new IgtNotificationRequestViewModel()
                        {
                            UserId = data.User.Id,
                            Title = "تأیید پرسش",
                            Description = userScore.NotificationMessage
                        });
                    }

                    if (userScore.ScoreAmount != 0 && !string.IsNullOrWhiteSpace(userScore.NotificationMessage))
                    {
						result.Add(new IgtNotificationRequestViewModel()
						{
							UserId = data.User.Id,
							Title = "کسب امتیاز",
							Description = userScore.NotificationMessage
                        });
                    }
					break;
                case NotificationTypeEnum.MedalChanged:
                    var users = data.User;
                    var userWithMedal =  _userRepository.GetEntityAsNoTracking()
                        .Include(u => u.Medal) 
                        .FirstOrDefault(u => u.Id == users.Id);
                    if (userWithMedal != null)
                        result.Add(new IgtNotificationRequestViewModel()
                        {
                            UserId = users.Id,
                            Title = "تغییر مدال",
                            Description =
                                $"{userWithMedal.FullName} عزیز، مدال شما به {userWithMedal.Medal.Description} تغییر یافت.",
                        });
                    break;
				case NotificationTypeEnum.AcceptAnswer:
					var acceptedAnswer = (Answer) data.Entity;
					var answerer = _userRepository.GetById(acceptedAnswer.UserId);
					result.Add(new IgtNotificationRequestViewModel
					{
						UserId = data.User.Id,
						Title = "پاسخ جدید به پرسش شما",
						Description = $"{data.User.FullName} عزیز، از طرف {answerer.FullName} برای شما پاسخی ارسال شده است.",
					});
					break;
				case NotificationTypeEnum.CreateProposal:
					var createdProposal = (Proposal)data.Entity;
					var proposalCreator = _userRepository.GetById(createdProposal.UserId);
					result.Add(new IgtNotificationRequestViewModel
					{
						UserId = data.User.Id,
						Title = "ثبت طرح",
						Description = $"{data.User.FullName} عزیز، طرح شما با کد {createdProposal.Code} ثبت شد. در صورت تأیید ادمین نمایش داده می شود.",
                        FrontendRouteId = _igtFrontRouteId.wikiAllProposal
                    });
					break;
				case NotificationTypeEnum.CreateProject:
					var createdProject= (Project)data.Entity;
					var projectCreator = _userRepository.GetById(createdProject.UserId);
					result.Add(new IgtNotificationRequestViewModel
					{
						UserId = data.User.Id,
						Title = "ثبت پروژه",
						Description = $"{data.User.FullName} عزیز، پروژه شما با کد {createdProject.Code} ثبت شد. در صورت تأیید ادمین نمایش داده می شود.",
                        FrontendRouteId = _igtFrontRouteId.wikiAllProject
                    });
					break;

				case NotificationTypeEnum.AddUserToExpert:
                    var knowledgeContentExpert = (KnowledgeContent)data.Entity;
                    var goalTitleExpert = knowledgeContentExpert.Goal.GoalTitle;
                    result.Add(new IgtNotificationRequestViewModel
                    {
                        UserId = data.User.Id,
                        Title = "تایید خبرگی",
                        Description = $"{data.User.FullName} عزیز، شما در لیست خبرگان حوزه دانشی {goalTitleExpert} قرار گرفتید.",
                        //FrontendRouteId = _igtFrontRouteId.WikiAllKnowledgeContent
                    });
                    break;
                case NotificationTypeEnum.QuestionMention:
                    break;
                case NotificationTypeEnum.UnitDocumentationCreate:
                    var unitDocumentationCreate = (UnitDocumentation)data.Entity;
                    result.Add(new IgtNotificationRequestViewModel()
                    {
                        UserId = data.User.Id,
                        Title = "ثبت مستندات واحدی",
                        Description = $"{data.User.FullName} عزیز،مستند واحدی شما در ویکی تیپاکس ثبت شد، در صورت تایید ادمین واحد نمایش داده میشود.",
                        FrontendRouteId = _igtFrontRouteId.wikiAllDocumentation
                    });
                    break;
                case NotificationTypeEnum.AcceptDocumentation:
                    result.Add(new IgtNotificationRequestViewModel()
                    {
                        UserId = data.User.Id,
                        Title = "تایید مستندات واحدی",
                        Description = $"{data.User.FullName} عزیز، مستندات واحدی شما توسط ادمین واحد تایید شد.",
                        FrontendRouteId = _igtFrontRouteId.wikiApproveDocumentation
                    });
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
            return result;
		}
	}
}
