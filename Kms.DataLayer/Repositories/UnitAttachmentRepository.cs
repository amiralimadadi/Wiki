
using Common.File;
using Common.OperationResult;
using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.General;
using Kms.Domain.Entities.UnitDocumentation;
using Microsoft.AspNetCore.Http;

namespace Kms.DataLayer.Repositories
{
    public class UnitAttachmentRepository : GenericRepository<UnitAttachment>, IUnitAttachmentRepository
    {
        public UnitAttachmentRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
        {
        }

        public async Task<OperationResult<UnitAttachment>> SaveAttachment(IFormFile file, int entityId, FileSettings fileSetting)
        {
            if (file == null)
            {
                return new OperationResult<UnitAttachment>(true, null, "Success", new List<ModelError>());
            }
            var validations = await ValidateFile(file, fileSetting);
            if (!validations.IsSuccess)
                return new OperationResult<UnitAttachment>(false, null, validations.Message, validations.ModelErrors);

            var saveRes = FileJob.Save(file, fileSetting, out var errors);
            if (!saveRes.Status)
                return new OperationResult<UnitAttachment>(false, null, saveRes.Message, saveRes.Errors);

            var attachment = new UnitAttachment()
            {
                Name = file.FileName,
                EntityId = entityId,
                Address = "/uploads/" + saveRes.FileName!,
                FileName = saveRes.FileName!
            };
            attachment = await AddAsync(attachment, true);
            return new OperationResult<UnitAttachment>(true, attachment, "Success", new List<ModelError>());
        }

        public async Task<OperationResult<List<UnitAttachment>>> SaveAttachments(List<IFormFile> files, int entityId, FileSettings fileSetting)
        {

            if (!files.Any())
            {
                return new OperationResult<List<UnitAttachment>>(true, null, "Success", new List<ModelError>());
            }

            var validations = await ValidateFiles(files, fileSetting);
            if (!validations.IsSuccess)
                return new OperationResult<List<UnitAttachment>>(false, null, validations.Message, validations.ModelErrors);

            var saveRes = FileJob.SaveRange(files, fileSetting, out var errors);
            if (saveRes.Any(a => !a.Status))
            {
                var messages = saveRes.Where(a => !a.Status).Select(a => a.Message).ToList();
                var tempErrors = saveRes.Where(a => !a.Status).Select(a => a.Errors).ToList();
                var allErrors = new List<ModelError>();
                foreach (var e in tempErrors)
                {
                    allErrors.AddRange(e);
                }
                return new OperationResult<List<UnitAttachment>>(false, null, string.Join(",", messages), allErrors);
            }

            var attachments = saveRes.Select((t, i) => new UnitAttachment()
                {
                    Name = files[i].FileName,
                    
                    EntityId = entityId,
                    Address = "/uploads/" + t.FileName!,
                    FileName = t.FileName!
                })
                .ToList();

            attachments = await AddRangeAsync(attachments, true);
            return new OperationResult<List<UnitAttachment>>(true, attachments, "Success", new List<ModelError>());
        }

        public async Task<OperationResult<bool>> ValidateFile(IFormFile file, FileSettings fileSetting)
        {
            if (file == null)
            {
                return new OperationResult<bool>(true, true, "File is valid", new List<ModelError>());
            }
            FileJob.Validation(file, fileSetting, out var errors);
            if (errors.Any())
                return new OperationResult<bool>(false, false, "File is not Valid", errors);
            return new OperationResult<bool>(true, true, "File is valid", new List<ModelError>());
        }

        public async Task<OperationResult<bool>> ValidateFiles(List<IFormFile> files, FileSettings fileSetting)
        {
            var allErrors = new List<ModelError>();


            if (!files.Any())
            {
                return new OperationResult<bool>(true, true, "File is valid", new List<ModelError>());
            }
            foreach (var file in files)
            {
                FileJob.Validation(file, fileSetting, out var errors);
                allErrors.AddRange(errors);
            }

            if (allErrors.Any())
                return new OperationResult<bool>(false, false, "File is not Valid", allErrors);
            return new OperationResult<bool>(true, true, "File is valid", new List<ModelError>());
        }
    }
}
