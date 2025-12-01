using Kms.Application.ViewModel.Options;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using Common.OperationResult;
using Serilog.Context;
using Serilog;
using System.Diagnostics;
using System.Net;
using System.Text.Json;

namespace Kms.Api.Middlewares
{
    public class GlobalExceptionHandlingMiddleware : IMiddleware
    {
        private readonly ErrorLoggingConfiguration _errorLogSetting;
        public GlobalExceptionHandlingMiddleware(IOptions<ErrorLoggingConfiguration> errorLogSetting)
        {
            _errorLogSetting = errorLogSetting.Value;
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {

            #region Set UserName

            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = context.User.FindFirstValue(ClaimTypes.Name);

            #endregion

            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                #region Log in file by Serilog

                var errorPath = _errorLogSetting.Address + _errorLogSetting.FileName;

                var tempStack = ex.StackTrace?.Split(Environment.NewLine);
                var firstStackTraceLine = tempStack?.FirstOrDefault();
                firstStackTraceLine = firstStackTraceLine?.Replace(Environment.NewLine, "")
                    .Replace(@"\", @"\\");

                var trace = new StackTrace(ex, true);
                var frame = trace.GetFrames().First();
                var lineNumber = frame.GetFileLineNumber();
                var fileName = frame.GetFileName();
                var methodName = frame.GetMethod()?.Name;


                var tempStringInterval = _errorLogSetting.RollingInterval ?? RollingInterval.Day.ToString();
                var tempRes = Enum.TryParse(tempStringInterval, out RollingInterval tempInterval);
                if (!tempRes)
                {
                    tempInterval = RollingInterval.Day;
                }

                Log.Logger = new LoggerConfiguration()
                    .Enrich.FromLogContext()
                    .MinimumLevel.Error()
                    .WriteTo.File(errorPath, rollingInterval: tempInterval
                    , outputTemplate: "{\n" +
                                      @"""time"":       ""{Timestamp:yyyy-MM-dd HH:mm:ss}""" + ",\n" +
                                      @"""userId"":     ""{UserId}""" + ",\n" +
                                      @"""userName"":   ""{UserName}""" + ",\n" +
                                      @"""message"":    ""{Message}""" + ",\n" +
                                      @"""class"":      ""{Class}""" + ",\n" +
                                      @"""method"":     ""{Method}""" + ",\n" +
                                      @"""line"":       ""{Line}""" + ",\n" +
                                      @"""stackTrace"": ""{StackTrace}""" +
                                      "\n},\n\n\n"
                    )
                    .CreateLogger();


                using (LogContext.PushProperty("UserId", userId ?? ""))
                using (LogContext.PushProperty("UserName", userName ?? ""))
                using (LogContext.PushProperty("Class", frame.GetMethod() == null ? fileName : frame.GetMethod()?.DeclaringType?.FullName))
                using (LogContext.PushProperty("Method", methodName ?? ""))
                using (LogContext.PushProperty("Line", lineNumber.ToString() ?? ""))
                using (LogContext.PushProperty("StackTrace", firstStackTraceLine?.Trim()))
                {
                    Log.Error(ex.Message);
                }
                Log.CloseAndFlush();
                #endregion

                #region Write in Response
                var operationResult = new OperationResult<string>
                    (false, "An unhandled error occurred in server, See log file.", ex.Message);

                var json = JsonSerializer.Serialize(operationResult);

                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                context.Response.ContentType = "application/json";
                context.Response.ContentLength = json.Length;

                await context.Response.WriteAsync(json);
                #endregion
            }
        }
    }
}
