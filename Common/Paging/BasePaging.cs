namespace Common.Paging
{
    public class BasePaging
    {
        public BasePaging()
        {
            PageId = 1;
            TakeEntity = 10;
            HowManyShowPageAfterAndBefore = 3;
        }

        public int PageId { get; set; }
        public int PageCount { get; set; }
        public int AllEntitiesCount { get; set; }
        public int StartPage { get; set; }
        public int EndPage { get; set; }
        public int TakeEntity { get; set; }
        public int SkipEntity { get; set; }
        public int GetLastPage()
        {
            return (int)Math.Ceiling(AllEntitiesCount / (double)TakeEntity);
        }
        public int HowManyShowPageAfterAndBefore { get; set; }
        public string GetCurrentPagingStatus()
        {
            var startItem = 1;
            var endItem = AllEntitiesCount;

            if (EndPage > 1)
            {
                startItem = (PageId - 1) * TakeEntity + 1;
                endItem = PageId * TakeEntity > AllEntitiesCount ? AllEntitiesCount : PageId * TakeEntity;
            }

            return $"نمایش {startItem} تا {endItem} از {AllEntitiesCount}";
        }
        public BasePaging GetCurrentPaging()
        {
            return this;
        }
       // public List<QuestionViewModel> Entities { get; set; }
    }
    public class PagedResult<T>
    {
        public BasePaging PagingInfo { get; set; }
        public List<T> Data { get; set; }
    }
}
