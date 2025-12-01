using Kms.Domain.Entities;

namespace Kms.DataLayer.Contracts
{
    public interface ICodeDescriptionRepository : IGenericRepository<CodeDescription>
    {
        IQueryable<CodeDescription> GetDescriptions(string typeCategory, int typeId);
    }
}
