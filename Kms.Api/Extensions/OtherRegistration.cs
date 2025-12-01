using Kms.Api.Middlewares;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Kms.Api.Extensions
{
    public static class OtherRegistration
	{
		public static void RegisterOtherInjection(this WebApplicationBuilder builder)
		{
            //Global Error Handler added
            builder.Services.AddSingleton<GlobalExceptionHandlingMiddleware>();
            builder.Services.AddScoped<IgtAuthenticationMiddleware>();

            
            //SeriLog added
            //var tempLogging = builder.Configuration.GetSection("ErrorLog").Get<ErrorLoggingConfiguration>();
            //var tempPath = tempLogging.Address + tempLogging.FileName;
            //var tempStringInterval = tempLogging.RollingInterval ?? RollingInterval.Day.ToString();
            //Enum.TryParse(tempStringInterval, out RollingInterval tempInterval);
            //var _logger = new LoggerConfiguration()
            //    .MinimumLevel.Information()
            //    .WriteTo.File(tempPath, rollingInterval: tempInterval)
            //    .CreateLogger();
            //builder.Logging.AddSerilog(_logger);
        }

        public static void RegisterSwagger(this WebApplicationBuilder builder)
        {
            builder.Services.AddSwaggerGen(c => {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Tipax Wiki Api",
                    Version = "v1"
                });
				// For Show Enum as string
                c.SchemaGeneratorOptions = new SchemaGeneratorOptions
                {
	                SchemaFilters = { new EnumSchemaFilter() }
                };

				//c.OperationFilter<FileUploadOperationFilter>();
				c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 1safsfsdfdfd\"",
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement {
                    {
                        new OpenApiSecurityScheme {
                            Reference = new OpenApiReference {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });
                c.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, "Kms.Api.xml"),true);
                c.EnableAnnotations();
            });


        }

	}

	// this class is required to show enum as string instead on index
    public class EnumSchemaFilter : ISchemaFilter
    {
	    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
	    {
		    if (context.Type.IsEnum)
		    {
			    schema.Type = "string";
			    schema.Enum.Clear();
			    foreach (var name in Enum.GetNames(context.Type))
			    {
				    schema.Enum.Add(new OpenApiString(name));
			    }
		    }
	    }
    }


    //public class FileUploadOperationFilter : IOperationFilter
		//{
		//	public void Apply(OpenApiOperation operation, OperationFilterContext context)
		//	{
		//		var uploadFileParams = context.MethodInfo.GetParameters()
		//			.FirstOrDefault(p => p.ParameterType == typeof(QuestionViewModel));

		//		if (uploadFileParams != null)
		//		{
		//			operation.RequestBody = new OpenApiRequestBody
		//			{
		//				Content = new Dictionary<string, OpenApiMediaType>
		//				{
		//					["multipart/form-data"] = new OpenApiMediaType
		//					{
		//						Schema = new OpenApiSchema
		//						{
		//							Type = "object",
		//							Properties = new Dictionary<string, OpenApiSchema>
		//							{
		//								["goalIds"] = new OpenApiSchema
		//								{
		//									Type = "array",
		//									Items = new OpenApiSchema
		//									{
		//										Type = "integer",
		//										Format = "int32"
		//									}
		//								},
		//								["questionTitle"] = new OpenApiSchema
		//								{
		//									Type = "string"
		//								},
		//								["questionText"] = new OpenApiSchema
		//								{
		//									Type = "string"
		//								},
		//								["tags"] = new OpenApiSchema
		//								{
		//									Type = "array",
		//									Items = new OpenApiSchema
		//									{
		//										Type = "string"
		//									}
		//								},
		//								["mentionUserId"] = new OpenApiSchema
		//								{
		//									Type = "array",
		//									Items = new OpenApiSchema
		//									{
		//										Type = "integer",
		//										Format = "int32"
		//									}
		//								},
		//								["questionAttachments"] = new OpenApiSchema
		//								{
		//									Type = "array",
		//									Items = new OpenApiSchema
		//									{
		//										Type = "string",
		//										Format = "binary"
		//									}
		//								}
		//							}
		//						}
		//					}
		//				}
		//			};
		//		}
		//	}
		//}

	}
