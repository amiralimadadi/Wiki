using System.Diagnostics.CodeAnalysis;

namespace Common.Mentions
{
    public static class MentionJob
    {
        private const string TextJoinCharacter = "__";
        public static string CreateMentionString(List<int> mentionUserIds)
        {
            if (mentionUserIds == null || !mentionUserIds.Any())
                return string.Empty;

            return TextJoinCharacter + string.Join(TextJoinCharacter + "," + TextJoinCharacter, mentionUserIds) + TextJoinCharacter;
        }

        public static List<int> ExtractUserIdsFromString(string mentionString)
        {
            List<int> result = new List<int>();
            if (string.IsNullOrWhiteSpace(mentionString))
            {
                return result;
            }
            result = mentionString
                    .Split(new[] {$"{MentionJob.TextJoinCharacter},{MentionJob.TextJoinCharacter}" }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(id => int.Parse(id.Replace($"{MentionJob.TextJoinCharacter}", "")))
                    .ToList();

            return result; 
        }
    }
}
