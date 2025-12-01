using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities;

namespace Kms.DataLayer.Repositories
{
    public class CodeDescriptionRepository : GenericRepository<CodeDescription>, ICodeDescriptionRepository
    {
       public CodeDescriptionRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
        {
        }

        public IQueryable<CodeDescription> GetDescriptions(string typeCategory, int typeId)
        {
            var result = GetEntity(a => a.TypeCategory == typeCategory && a.TypeId == typeId);
            return result;
        }
    }
}
