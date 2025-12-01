
using System.ComponentModel.DataAnnotations;
using System.Reflection;


namespace Common.Extensions
{
    public static class CommonExtensions
    {
        public static string? GetDisplayName(this Enum enumValue)
        {
            var enumType = enumValue.GetType();
            var member = enumType.GetMember(enumValue.ToString());
            if (member.Length > 0)
            {
                var displayAttr = member[0].GetCustomAttribute<DisplayAttribute>();
                if (displayAttr != null)
                {
                    return displayAttr.Name;
                }
            }
            return enumValue.ToString(); 
        }

        public static string GenerateShortKey(int lenght = 6)
        {
            return Guid.NewGuid().ToString().Replace("-", "").Substring(0, lenght);
        }
    }
}
