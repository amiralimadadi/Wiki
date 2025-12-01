using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Entities.QuestionAndAnswer;

namespace Kms.DataLayer.Repositories
{
    public class AnswerRepository : GenericRepository<Answer>, IAnswerRepository
    {
        public AnswerRepository(KmsDbContext context, IAuthenticateService authenticateService) : base(context, authenticateService)
        {
        }
    }
}
