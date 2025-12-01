using Common.Paging;

namespace Common.OperationResult
{
    public class OperationResult<TEntity> 
    {

        #region Properties
        public bool IsSuccess { get; set; }
        public TEntity? Data { get; set; }
        public string? Message { get; set; }
        public List<ModelError>? ModelErrors { get; set; }
        public BasePaging? PagingInfo { get; set; }

        #endregion Properties

        public OperationResult(bool isSuccess, TEntity? data, string? message, List<ModelError> modelErrors, BasePaging pagingInfo = null) : base()
        {
            // Just in case
	        if (typeof(TEntity).IsClass)
	        {

	        }
            IsSuccess = isSuccess;
            Message = message;
            Data = data!;
            PagingInfo = pagingInfo;
            ModelErrors = modelErrors;
        }
        public OperationResult(bool isSuccess, TEntity? data, string? message, ModelError? modelError = null,BasePaging pagingInfo=null) : base()
        {
            IsSuccess = isSuccess;
            Message = message;
            Data = data!;
            PagingInfo = pagingInfo;

            ModelErrors = modelError == null ? null : new List<ModelError>
            {
                modelError
            };
        }
    }
    public class ModelError
    {
        public ModelError(string modelPropertyName, string modelErrorMessage)
        {
            this.ModelPropertyName = modelPropertyName;
            this.ModelErrorMessage = modelErrorMessage;
        }

        public string ModelPropertyName { get; set; }
        public string ModelErrorMessage { get; set; }
    }
}