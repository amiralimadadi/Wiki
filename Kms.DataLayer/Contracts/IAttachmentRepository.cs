using Common.File;
using Common.OperationResult;
using Kms.Domain.Entities.General;
using Microsoft.AspNetCore.Http;

namespace Kms.DataLayer.Contracts
{
    public interface IAttachmentRepository : IGenericRepository<Attachment>
    {
        //Task<OperationResult<Attachment>> ValidateAndSaveAttachments(List<IFormFile> files, string entityName, int entityId, FileSettings fileSettings);
        Task<OperationResult<Attachment>> SaveAttachment(IFormFile file, string entityName, int entityId, FileSettings fileSetting);
        Task<OperationResult<List<Attachment>>> SaveAttachments(List<IFormFile> files, string entityName, int entityId, FileSettings fileSetting);
        Task<OperationResult<bool>> ValidateFile(IFormFile file, FileSettings fileSetting);
        Task<OperationResult<bool>> ValidateFiles(List<IFormFile> files, FileSettings fileSetting);
    }
}