namespace Common.SqlDto;

public class Top50ContentsSqlRow
{
    public string EntityType { get; set; } = default!;
    public int EntityId { get; set; }
    public int PageViewCount { get; set; }
    public string Title { get; set; } = "";
    public string? Text { get; set; }
    public DateTime CreatedDate { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }

    // User columns
    public int? UserId { get; set; }
    public string? FullName { get; set; }
    public bool IsLiked { get; set; }



}