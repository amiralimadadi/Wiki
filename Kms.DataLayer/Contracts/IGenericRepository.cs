using System.Linq.Expressions;
using Common.OperationResult;
using Common.Paging;
using Kms.Domain.Core;

namespace Kms.DataLayer.Contracts
{
	public interface IGenericRepository<TEntity> where TEntity : class, IEntity
	{
		#region Create
		Task<TEntity> AddAsync(TEntity entity, bool saveNow = false);
		Task<List<TEntity>> AddRangeAsync(List<TEntity> entities, bool saveNow = false);
		#endregion Create

		#region Read
		IQueryable<TEntity> GetEntity(
			Expression<Func<TEntity, bool>>? where = null,
			bool justActive = false,
			bool includeDeleted = false
		);
		IQueryable<TEntity> GetEntityAsNoTracking(
			bool justActive = true,
			bool includeDeleted = false
		);

        IQueryable<TEntity> GetAllEntityAsNoTracking(bool includeDeleted = false);

        TEntity? GetById(object id);

		IQueryable<TEntity> GetAllAsNoTrackAsync(
			Expression<Func<TEntity, bool>>? filter = null,
			Expression<Func<TEntity, object>>? orderBy = null,
			Expression<Func<TEntity, object>>? orderByDesc = null,
			params string[] includeProperties);

		public IQueryable<TEntity> GetAllAsNoTrackWithPagingAsync(
			BasePaging pager,
			IQueryable<TEntity> query,
			Expression<Func<TEntity, object>>? orderBy = null,
			Expression<Func<TEntity, object>>? orderByDesc = null,
			bool justActive = true,
            bool includeDeleted = false);

        public IQueryable<TEntity> AllAsNoTrackWithPagingAsync(
            BasePaging pager,
            IQueryable<TEntity> query,
            Expression<Func<TEntity, object>>? orderBy = null,
            Expression<Func<TEntity, object>>? orderByDesc = null,
            bool includeDeleted = false);

        /// <summary>
        /// Returns all Active and Deactivated elements
        /// </summary>
        /// <param name="pager"></param>
        /// <param name="query"></param>
        /// <param name="orderBy"></param>
        /// <param name="orderByDesc"></param>
        /// <returns></returns>
        //public IQueryable<TEntity> GetAllNonDeletedAsNoTrackWithPagingAsync(
        //    BasePaging pager,
        //    IQueryable<TEntity> query,
        //    Expression<Func<TEntity, object>>? orderBy = null,
        //    Expression<Func<TEntity, object>>? orderByDesc = null);


        #endregion Read

        #region Update
        Task<TEntity> UpdateAsync(TEntity entity, bool saveNow = false);
		Task<List<TEntity>> UpdateRangeAsync(List<TEntity> entities, bool saveNow = false);
		#endregion Update

		#region Delete
		Task DeleteAsync(TEntity entity, bool hardDelete = false, bool saveNow = false);
		Task DeleteAsync(object id, bool hardDelete = false, bool saveNow = false);

		Task DeleteRangeAsync(List<TEntity> entities, bool hardDelete = false, bool saveNow = false);
		#endregion Delete

		#region Save
		Task SaveAsync();
		#endregion Save

		#region Entity Validation
		bool EntityValidation(TEntity entity, out List<ModelError> errors);
		#endregion Entity Validation
	}
}