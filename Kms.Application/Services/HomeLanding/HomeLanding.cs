

using Common.OperationResult;
using Kms.Application.ViewModels;

namespace Kms.Application.Services.HomeLanding
{
    public class HomeLanding : IHomeLanding
    {
        public Task<OperationResult<Top50ContentsViewModel>> GetmanualSearch(string search)
        {
            throw new NotImplementedException();
        }
    }
}
