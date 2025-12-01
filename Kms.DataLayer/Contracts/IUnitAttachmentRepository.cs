using Common.File;
using Common.OperationResult;
using Kms.Domain.Entities.UnitDocumentation;
using Microsoft.AspNetCore.Http;

namespace Kms.DataLayer.Contracts;

public interface IUnitAttachmentRepository : IGenericRepository<UnitAttachment>
{
    Task<OperationResult<UnitAttachment>> SaveAttachment(IFormFile file, int entityId, FileSettings fileSetting);
    Task<OperationResult<List<UnitAttachment>>> SaveAttachments(List<IFormFile> files, int entityId, FileSettings fileSetting);
    Task<OperationResult<bool>> ValidateFile(IFormFile file, FileSettings fileSetting);
    Task<OperationResult<bool>> ValidateFiles(List<IFormFile> files, FileSettings fileSetting);
}