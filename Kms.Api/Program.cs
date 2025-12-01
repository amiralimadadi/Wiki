using AutoMapper;
using Kms.Api.Extensions;
using Kms.Api.Middlewares;
using Kms.Application.ViewModel.Options;
using Kms.IoC.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
	//.AddNewtonsoftJson(options =>
	//{
	//	options.SerializerSettings.Converters.Add(new Newtonsoft.Json.Converters.StringEnumConverter());
	//})
	//;
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();
builder.RegisterSwagger();

builder.Services.AddHttpContextAccessor();

builder.RegisterOptionsInjection();
builder.RegisterJwtAuthorize();
builder.RegisterOtherInjection();
builder.ConfigDatabase();
builder.Services.RegisterRepositories();
builder.Services.RegisterServices();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   //.WithMethods("GET", "POST", "DELETE", "PUT")
                   .AllowAnyHeader();
        });
});

// Auto Mapper Configurations
var mapperConfig = new MapperConfiguration(mc =>
{
	mc.AddProfile(new MappingProfile());
});
IMapper mapper = mapperConfig.CreateMapper();
builder.Services.AddSingleton(mapper);

var app = builder.Build();

//if (app.Environment.IsProduction())
//{
app.UseSwagger();
app.UseSwaggerUI(o =>
{
	o.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.None);
});
//}

app.UseCors("AllowAllOrigins");

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
app.UseMiddleware<IgtAuthenticationMiddleware>();

app.MapControllers();


app.Run();
