using Kms.Application.ViewModels;
using Kms.Domain.Entities.Account;
using System;
using Kms.Domain.Core;

namespace Kms.Application.Senders
{
	public interface INotificationSender
	{
		Task<bool> SendNotificationAsync(int userId, string title, string description, int igtFrontRoute);
		bool SendNotificationAsync(IgtNotificationRequestViewModel data);

		//Task<List<IgtNotificationResponseViewModel>> SendNotification(SendNotificationDto data);
		List<IgtNotificationResponseViewModel> SendNotification(SendNotificationDto data);
	}

	public class SendNotificationDto
	{
		public User User { get; set; }
		public NotificationTypeEnum NotificationType { get; set; }
		public IEntity Entity { get; set; }
	}

	public enum NotificationTypeEnum
	{
		QuestionCreate = 1,
		QuestionMention = 2,
		Gamification = 3,
		KnowledgeContentStructureCreate = 4,
		ExpertLikeKnowledgeContent = 5,
		LikeKnowledgeContent = 6,
		ChanheKnowledgeContentToStructured = 7,
		ChangeKnowledgeContentToOfficial = 8,
		MedalChanged = 9,
		AnswerCreate = 10,
		AcceptAnswer = 11,
		AddUserToExpert = 12,
		CreateProposal = 13,
		CreateProject = 14,
		UnitDocumentationCreate = 15,
		AcceptDocumentation = 16
	}
}