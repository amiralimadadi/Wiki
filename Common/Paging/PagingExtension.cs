namespace Common.Paging
{
    public static class PagingExtension
    {
        public static IQueryable<T> Paging<T>(this IQueryable<T> query, BasePaging paging)
        {
            return query.Skip(paging.SkipEntity).Take(paging.TakeEntity);
        }
        public static IEnumerable<T> EPaging<T>(this IEnumerable<T> query, BasePaging paging)
        {
            return query.Skip(paging.SkipEntity).Take(paging.TakeEntity);
        }
    }

    public class PagingOptions
    {
        public int PageId { get; set; }
        public int TakeEntity { get; set; }
        public int HowManyShowPageAfterAndBefore { get; set; }
    }

    
}
