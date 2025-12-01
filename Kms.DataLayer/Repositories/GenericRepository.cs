using System.ComponentModel.DataAnnotations;
using System.Linq.Expressions;
using Common.OperationResult;
using Common.Paging;
using Common.UserService;
using Kms.DataLayer.Context;
using Kms.DataLayer.Contracts;
using Kms.Domain.Core;
using Microsoft.EntityFrameworkCore;

namespace Kms.DataLayer.Repositories
{
	public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class, IEntity
	{
		#region Constructor
		private readonly KmsDbContext _context;
		private readonly IAuthenticateService _authenticateService;
        public GenericRepository(KmsDbContext context,IAuthenticateService authenticateService)
		{
			_context = context;
			_authenticateService = authenticateService;
		}
		#endregion Constructor

		#region Create
		public async Task<TEntity> AddAsync(TEntity entity, bool saveNow = false)
		{
			await _context.AddAsync(entity);
			entity.CreatedDate = DateTime.Now;
            entity.CreatedUserId = _authenticateService.GetUserId();
			if (saveNow)
				await SaveAsync();
			return entity;
		}

		public async Task<List<TEntity>> AddRangeAsync(List<TEntity> entities, bool saveNow = false)
		{
			var currentUser = _authenticateService.GetUserId();
			entities.ForEach(e =>
            {
                e.CreatedDate = DateTime.Now;
				e.CreatedUserId = currentUser;
            });
			await _context.AddRangeAsync(entities);
			if (saveNow)

				//foreach (var entity in entities)
				//{
				//    await AddAsync(entity,true);
				//}

				await SaveAsync();
			return entities;
		}
		#endregion Create

		#region Read
		public IQueryable<TEntity> GetEntity(
			Expression<Func<TEntity, bool>>? where = null,
			bool justActive = false,
			bool includeDeleted = false)
		{
			IQueryable<TEntity> query = _context.Set<TEntity>();
			if (where != null)
				query = query.Where(where);
			if (justActive)
				query = query.Where(a => a.IsActive);
			if (!includeDeleted)
				query = query.Where(a => !a.IsDeleted);
			return query;
		}

        public IQueryable<TEntity> GetEntityAsNoTracking(bool justActive = true, bool includeDeleted = false)
        {
            IQueryable<TEntity> query = _context.Set<TEntity>();

            if (justActive)
                query = query.Where(a => a.IsActive);
            if (!includeDeleted)
                query = query.Where(a => !a.IsDeleted);
            return query.AsNoTracking();
        }
        public IQueryable<TEntity> GetAllEntityAsNoTracking(bool includeDeleted = false)
        {
            IQueryable<TEntity> query = _context.Set<TEntity>();

            if (!includeDeleted)
                query = query.Where(a => !a.IsDeleted);

            return query.AsNoTracking();
        }
        public TEntity? GetById(object id)
		{
			try
			{
				var entity = _context.Set<TEntity>().Find(id);
				return entity;
			}
			catch (Exception)
			{
				return null;
			}
		}

        public IQueryable<TEntity> GetAllAsNoTrackAsync(
	        Expression<Func<TEntity, bool>>? filter = null,
            Expression<Func<TEntity, object>>? orderBy = null,
	        Expression<Func<TEntity, object>>? orderByDesc = null,
			params string[] includeProperties)
        {
            IQueryable<TEntity> query = _context.Set<TEntity>();
            query = query.Where(a => a.IsActive && !a.IsDeleted);
            if (filter != null)
            {
                query = query.Where(filter);
            }

            //foreach (var includeProperty in includeProperties)
            //{
            //    query = query.Include(includeProperty);
            //}
            foreach (var includeProperty in includeProperties)
            {
                foreach (var property in includeProperty.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                {
                    query = query.Include(property);
                }
            }

            if (orderBy is not null)
            {
                query = query.OrderBy(orderBy);
            }

            if (orderByDesc is not null)
            {
                query = query.OrderByDescending(orderByDesc);
            }

            return  query.AsNoTrackingWithIdentityResolution();
        }

        public IQueryable<TEntity> GetAllAsNoTrackWithPagingAsync(
	        BasePaging pager,
			IQueryable<TEntity> query,
			Expression<Func<TEntity, object>>? orderBy = null,
	        Expression<Func<TEntity, object>>? orderByDesc = null,
            bool justActive = true,
            bool includeDeleted = false)
		{
            //query = query.Where(a => a.IsActive && !a.IsDeleted);

            query = query.Where(a => a.IsActive == justActive && a.IsDeleted == includeDeleted);

            if (orderBy is not null)
	        {
		        query = query.OrderBy(orderBy);
	        }

	        if (orderByDesc is not null)
	        {
		        query = query.OrderByDescending(orderByDesc);
	        }

	        if (orderBy is null && orderByDesc is null)
	        {
		        query = query.OrderByDescending(a=>a.CreatedDate);
	        }
	        query = query.Skip(pager.SkipEntity).Take(pager.TakeEntity);
	        return query;
        }

        public IQueryable<TEntity> AllAsNoTrackWithPagingAsync(
            BasePaging pager,
            IQueryable<TEntity> query,
            Expression<Func<TEntity, object>>? orderBy = null,
            Expression<Func<TEntity, object>>? orderByDesc = null,
           bool includeDeleted = false)
        {
            //query = query.Where(a => a.IsActive && !a.IsDeleted);

            query = query.Where(a => a.IsDeleted == includeDeleted);

            if (orderBy is not null)
            {
                query = query.OrderBy(orderBy);
            }

            if (orderByDesc is not null)
            {
                query = query.OrderByDescending(orderByDesc);
            }

            if (orderBy is null && orderByDesc is null)
            {
                query = query.OrderByDescending(a => a.CreatedDate);
            }
            query = query.Skip(pager.SkipEntity).Take(pager.TakeEntity);
            return query;
        }


        //public IQueryable<TEntity> GetAllNonDeletedAsNoTrackWithPagingAsync(
        //    BasePaging pager,
        //    IQueryable<TEntity> query,
        //    Expression<Func<TEntity, object>>? orderBy = null,
        //    Expression<Func<TEntity, object>>? orderByDesc = null)
        //{
        //    query = query.Where(a => !a.IsDeleted);


        //    if (orderBy is not null)
        //    {
        //        query = query.OrderBy(orderBy);
        //    }

        //    if (orderByDesc is not null)
        //    {
        //        query = query.OrderByDescending(orderByDesc);
        //    }

        //    if (orderBy is null && orderByDesc is null)
        //    {
        //        query = query.OrderByDescending(a => a.CreatedDate);
        //    }
        //    query = query.Skip(pager.SkipEntity).Take(pager.TakeEntity);
        //    return query;
        //}

        #endregion Read

        #region Update
        public async Task<TEntity> UpdateAsync(TEntity entity, bool saveNow = false)
		{
			entity.LastModifiedDate = DateTime.Now;
            entity.LastModifiedUserId = _authenticateService.GetUserId();
			_context.Update(entity);
			if (saveNow)
				await SaveAsync();
			return entity;
		}

		public async Task<List<TEntity>> UpdateRangeAsync(List<TEntity> entities, bool saveNow = false)
		{
			var currentUser = _authenticateService.GetUserId();
			entities.ForEach(e =>
            {
                e.LastModifiedDate = DateTime.Now;
                e.LastModifiedUserId = currentUser;
            });
			_context.UpdateRange(entities);
			if (saveNow)
				await SaveAsync();
			return entities;
		}
		#endregion Update

		#region Delete
		public async Task DeleteAsync(TEntity entity, bool hardDelete = false, bool saveNow = false)
		{
			if (hardDelete)
				_context.Remove(entity);

			else
			{
				entity.IsDeleted = true;
				entity.LastModifiedDate = DateTime.Now;
				entity.LastModifiedUserId = _authenticateService.GetUserId();

				await UpdateAsync(entity, false);
			}

			if (saveNow)
				await SaveAsync();
		}

		public async Task DeleteAsync(object id, bool hardDelete = false, bool saveNow = false)
		{
			var entity = GetById(id);
			if (entity == null)
				return;
			await DeleteAsync(entity, hardDelete, saveNow);
		}

		public async Task DeleteRangeAsync(List<TEntity> entities, bool hardDelete = false, bool saveNow = false)
		{
			var currentUser = _authenticateService.GetUserId();

			if (hardDelete)
				_context.RemoveRange(entities);
			else
			{
				entities.ForEach(e =>
				{
					e.IsDeleted = true;
					e.LastModifiedDate = DateTime.Now;
					e.LastModifiedUserId = currentUser;

				});
				await UpdateRangeAsync(entities, false);
			}

			if (saveNow)
				await SaveAsync();
		}


		#endregion Delete

		#region Save

		public async Task SaveAsync()
		{
			await _context.SaveChangesAsync();
		}
		
        public bool EntityValidation(TEntity entity, out List<ModelError> errors)
        {
			errors = new List<ModelError>();
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(entity);
            if (!Validator.TryValidateObject(entity, validationContext, validationResults, true)
                && validationResults.Any())
            {
                foreach (var e in validationResults)
                {
                    errors.Add(new ModelError(e.MemberNames.ToList()[0], e.ErrorMessage ?? ""));
                }
            }
            return !errors.Any();
        }



        #endregion Save
    }
}