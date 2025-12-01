using Kms.DataLayer.Context;
using Microsoft.EntityFrameworkCore;

namespace Kms.Api.Extensions
{
	public static class RegisterDatabase
	{
		public static void ConfigDatabase(this WebApplicationBuilder builder)
		{
            builder.Services.AddDbContext<KmsDbContext>(options =>
            {
                options.UseSqlServer(builder.Configuration.GetConnectionString("KmsDbConnectionString"));
            });
        }
	}
}
