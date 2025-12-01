using System.Security.Claims;
using System.Text;
using Kms.Application.ViewModel.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.WebSockets;

namespace Kms.Api.Extensions
{
	public class LoginService
	{
		private readonly JwtSetting _jwtSetting;
		public LoginService(JwtSetting jwtSetting)
		{
			_jwtSetting = jwtSetting;
		}

		public string LoginUserByJwt(string userId, string userName)
		{
			var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSetting.Key));
            var credential = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);
			var claims = new List<Claim>()
			{
				new( ClaimTypes.NameIdentifier, userId),
				new(ClaimTypes.Name, userName),
			};


			var token = new JwtSecurityToken(
				issuer: _jwtSetting.Issuer,
				audience: _jwtSetting.Issuer,
				claims: claims,
				notBefore: null,
				expires: DateTime.Now.AddDays(30),
                signingCredentials: credential
            );


            //throw new NotImplementedException();
			return new JwtSecurityTokenHandler().WriteToken(token);
		}
	}


	public static class RegisterAuthenticationService
	{
		public static void RegisterJwtAuthorize(this WebApplicationBuilder builder)
		{
			builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
				.AddCookie()
				.AddJwtBearer(options =>
				{
					var encryptionKey = Encoding.UTF8.GetBytes(builder.Configuration["JwtSetting:Encryption"]);

					options.SaveToken = true;
					options.RequireHttpsMetadata = false;
					options.TokenValidationParameters = new TokenValidationParameters()
					{
						ValidateIssuer = true,
						ValidateAudience = true,
						ValidateLifetime = true,
						ValidateIssuerSigningKey = true,
						ValidIssuer = builder.Configuration["JwtSetting:Issuer"],
						ValidAudience = builder.Configuration["JwtSetting:Issuer"],
						IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSetting:Key"])),
						TokenDecryptionKey = new SymmetricSecurityKey(encryptionKey)
					};
				});
		}
	}
}