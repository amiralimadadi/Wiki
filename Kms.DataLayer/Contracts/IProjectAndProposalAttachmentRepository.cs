using Common.File;
using Common.OperationResult;
using Kms.Domain.Entities.ProjectAndProposal;
using Microsoft.AspNetCore.Http;

namespace Kms.DataLayer.Contracts;

public interface IProjectAndProposalAttachmentRepository : IGenericRepository<ProjectAndProposalAttachment>
{
    Task<OperationResult<ProjectAndProposalAttachment>> SaveAttachment(IFormFile file, string entityName, int entityId, FileSettings fileSetting);
    Task<OperationResult<List<ProjectAndProposalAttachment>>> SaveAttachments(List<IFormFile> files, string entityName, int entityId, FileSettings fileSetting);
    Task<OperationResult<bool>> ValidateFile(IFormFile file, FileSettings fileSetting);
    Task<OperationResult<bool>> ValidateFiles(List<IFormFile> files, FileSettings fileSetting);
}