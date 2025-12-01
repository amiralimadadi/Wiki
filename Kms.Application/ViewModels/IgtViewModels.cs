using System;

namespace Kms.Application.ViewModels
{
	public class IgtResponse
	{
		public bool? isSuccess { get; set; }
		public string? statusCode { get; set; }
		public string? message { get; set; }
		public int? totalItemCount { get; set; }
		public int? pageNumber { get; set; }
		public int? pageSize { get; set; }
	}


	#region Notification


	public class IgtNotificationRequestViewModel
	{
		public string Title { get; set; }
		public string Description { get; set; }
		public int UserId { get; set; }
		//public int ContextId { get; set; }
		//public string PersonId { get; set; }
		public int? FrontendRouteId { get; set; }
	}

	public class IgtNotificationDataViewModel
	{
		public string title { get; set; }
		public string description { get; set; }
		public int contextId { get; set; }
		public bool sendSMS { get; set; }
		public bool sendInApp { get; set; }
		public string sendDate { get; set; }
		public bool seen { get; set; }
		public string creator { get; set; }
        public string FrontendRouteId { get; set; }
    }

	public class IgtNotificationResponseViewModel : IgtResponse
	{
		public IgtNotificationDataViewModel data { get; set; }
	}



	#endregion Notification

}
