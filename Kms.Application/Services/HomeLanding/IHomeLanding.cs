
using Common.OperationResult;
using Kms.Application.ViewModels;

namespace Kms.Application.Services.HomeLanding
{
    public interface IHomeLanding
    {
        Task<OperationResult<Top50ContentsViewModel>> GetmanualSearch(string search);

    }
}
