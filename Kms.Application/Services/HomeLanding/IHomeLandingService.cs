
using Common.OperationResult;
using Kms.Application.ViewModels;

namespace Kms.Application.Services.HomeLanding
{
    public interface IHomeLandingService
    {
        Task<OperationResult<List<HomeLandingContentsViewModel>>> GetTop50Contents();

        Task<OperationResult<List<HomeLandingContentsViewModel>>> GetmanualSearch(string search);

    }
}
