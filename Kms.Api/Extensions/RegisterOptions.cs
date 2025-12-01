using Common.File;
using Common.Paging;
using Kms.Application.ViewModel.Options;

namespace Kms.Api.Extensions
{
	public static class RegisterOptions
	{
		public static void RegisterOptionsInjection(this WebApplicationBuilder builder)
		{
			builder.Services.Configure<JwtSetting>(builder.Configuration.GetSection("JwtSetting"));
			builder.Services.Configure<ErrorLoggingConfiguration>(builder.Configuration.GetSection("ErrorLog"));
			builder.Services.Configure<FileSettings>(builder.Configuration.GetSection("FileSetting"));
			builder.Services.Configure<AttachmentSetting>(builder.Configuration.GetSection("AttachmentSetting"));
			builder.Services.Configure<IgtSetting>(builder.Configuration.GetSection("IgtSettings"));
            builder.Services.Configure<PagingOptions>(builder.Configuration.GetSection("PagingOptions"));
            builder.Services.Configure<IgtFrontRouteId>(builder.Configuration.GetSection("IgtFrontRouteId"));
            builder.Services.Configure<IgtTokenUnit>(builder.Configuration.GetSection("IgtTokenUnit"));
		}
	}
}