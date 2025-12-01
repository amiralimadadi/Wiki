using Common.OperationResult;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace Common.File
{
    public static class FileJob
    {
        // اعتبارسنجی تک فایل
        public static bool Validation(IFormFile file, FileSettings fileSettings, out List<ModelError> errors)
        {
            var status = true;
            errors = new List<ModelError>();

            // بررسی خالی بودن فایل
            if (file == null || file.Length == 0)
            {
                errors.Add(new ModelError("", "فایل خالی است"));
                status = false;
            }

            // بررسی نوع فایل
            if (!fileSettings.AllowedExtensions.Contains(file.ContentType))
            {
                errors.Add(new ModelError("", "نوع فایل غیرمجاز است."));
                status = false;
            }

            // بررسی اندازه فایل
            if (file.Length > fileSettings.MaxSize * 1024 * 1024)
            {
                errors.Add(new ModelError("", "اندازه فایل بزرگتر از حد مجاز است. حداکثر اندازه مجاز 200 مگابایت است."));
                status = false;
            }

            return status;
        }

        // اعتبارسنجی لیست فایل‌ها
        public static bool Validation(List<IFormFile> files, FileSettings fileSettings, out List<ModelError> errors)
        {
            var status = true;
            errors = new List<ModelError>();
            foreach (var file in files)
            {
                if (!Validation(file, fileSettings, out var tempError))
                    errors.AddRange(tempError);
            }

            if (errors.Any())
                status = false;
            return status;
        }
        //ایجاد دایرکتوری‌ها در صورت عدم وجود
        private static void EnsureDirectoryExists(string path)
        {
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
        }
        // ذخیره تک فایل
        public static bool Save(IFormFile file, string filePath, out List<ModelError> errors)
        {
            var status = true;
            errors = new List<ModelError>();

            try
            {
                EnsureDirectoryExists(filePath);

                //var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", file.FileName);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    file.CopyTo(stream);
                }
            }
            catch (Exception ex)
            {
                errors.Add(new ModelError("Id", ex.Message));
                status = false;
            }

            //if (errors.Any())
            //    status = false;
            return status;
        }

        // ذخیره فایل به همراه اعتبارسنجی و تنظیمات
        public static FileJobResult Save(IFormFile file, FileSettings fileSetting, out List<ModelError> errors)
        {
            errors = new List<ModelError>();
            var result = new FileJobResult();

            try
            {
                if (!Validation(file, fileSetting, out errors))
                {
                    return new FileJobResult
                    {
                        Status = false,
                        Errors = errors,
                        Message = "File is Not valid"
                    };
                }

                result.FileSize = file.Length;
                result.FileType = Path.GetExtension(file.FileName);
                result.FileName = Guid.NewGuid().ToString("N") + result.FileType;

                // استفاده مستقیم از fileSetting.Address به جای Directory.GetCurrentDirectory()
                //var path = Path.Combine(fileSetting.Address, result.FileName);

                var projectRoot = Directory.GetCurrentDirectory();
                var wwwRootPath = Path.Combine(projectRoot, "wwwroot", fileSetting.Address);
                EnsureDirectoryExists(wwwRootPath);
                var path = Path.Combine(wwwRootPath, result.FileName);
               // var path = Path.Combine(projectRoot, fileSetting.Address, result.FileName);

                // استفاده از متد جدید برای اطمینان از موجود بودن مسیر
                //EnsureDirectoryExists(fileSetting.Address);
                EnsureDirectoryExists(Path.Combine(projectRoot, fileSetting.Address));

                using (var stream = new FileStream(path, FileMode.Create))
                {
                    file.CopyTo(stream);
                }

                result.Status = true;
                result.FullFilePath = path;
            }
            catch (Exception ex)
            {
                errors.Add(new ModelError("Id", ex.Message));
                result = new FileJobResult
                {
                    Status = false,
                    Errors = errors,
                    Message = "Something went wrong."
                };
            }

            return result;
        }

        // ذخیره مجموعه‌ای از فایل‌ها
        public static List<FileJobResult> SaveRange(List<IFormFile> files, FileSettings fileSetting, out List<ModelError> errors)
        {
            errors = new List<ModelError>();
            var results = new List<FileJobResult>();

            try
            {
                if (!Validation(files, fileSetting, out errors))
                {
                    results.Add(new FileJobResult
                    {
                        Status = false,
                        Errors = errors,
                        Message = "Files are not valid"
                    });
                    return results;
                }

                foreach (var file in files)
                {
                    // استفاده از متد Save برای هر فایل و اضافه کردن نتیجه به لیست نتایج
                    var tempResult = Save(file, fileSetting, out var tempErrors);
                    if (!tempResult.Status)
                    {
                        errors.AddRange(tempErrors);
                    }
                    results.Add(tempResult);
                }
            }
            catch (Exception ex)
            {
                errors.Add(new ModelError("Id", ex.Message));
                results.Add(new FileJobResult
                {
                    Status = false,
                    Errors = errors,
                    Message = "Something went wrong."
                });
            }

            return results;
        }

    }

    public class FileSettings
    {
        public string Address { get; set; } = "uploads";
        //public string FileName { get; set; }
        public int MaxSize { get; set; } = 200;
        public List<string> AllowedExtensions { get; set; } = new List<string>
        {
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "audio/mpeg",
            "video/mp4",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint", // PowerPoint (قدیمی)
            "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PowerPoint (جدید)
            "application/vnd.visio", // Visio (قدیمی)
            "application/vnd.ms-visio.drawing", // Visio (جدید)
        };
    }

    public struct FileJobResult
    {
        public bool Status { get; set; }
        public List<ModelError>? Errors { get; set; }
        public string Message { get; set; }
        public string? FileName { get; set; }
        public decimal? FileSize { get; set; }
        public string? FileType { get; set; }
        public string? FullFilePath { get; set; }
    }
}
