using System.Globalization;

namespace Common.Date
{
	public static class PersianDate
	{
		public static string PersianDateRegularExpression = @"^[1-4]\d{3}/(0[1-6]/(0[1-9]|[12]\d|3[01])|0[7-9]/(0[1-9]|[12]\d|30)|(1[0-1]/(0[1-9]|[12]\d|30)|12/(0[1-9]|[12]\d)))";

        public static string ToPersianDate(this DateTime date, string delimiter = "/")
		{
			var pc = new PersianCalendar();
			var persianDate
				= pc.GetYear(date).ToString("D4") + delimiter
				+ pc.GetMonth(date).ToString("D2") + delimiter
				+ pc.GetDayOfMonth(date).ToString("D2");
			return persianDate;
		}
		public static bool TryMiladiParse(string persianDate, out DateTime miladiDate)
		{
			miladiDate = new DateTime();
			var pc = new PersianCalendar();
			var gc = new GregorianCalendar();

			var dateParts = new string[3];
			var persianDateWithoutDelimiters = new string(persianDate.Where(char.IsDigit).ToArray()) ?? "";
			if (string.IsNullOrWhiteSpace(persianDateWithoutDelimiters))
				return false;

			dateParts[0] = persianDateWithoutDelimiters.Substring(0, 4);
			dateParts[1] = persianDateWithoutDelimiters.Substring(4, 2);
			dateParts[2] = persianDateWithoutDelimiters.Substring(6, 2);

			var date =
				pc.ToDateTime(
					int.Parse(dateParts[0]),
					int.Parse(dateParts[1]),
					int.Parse(dateParts[2]),
					0, 0, 0, 0, 0);
			var miladiYear = int.Parse(gc.GetYear(date).ToString());
			var miladiMonth = int.Parse(gc.GetMonth(date).ToString());
			var miladiDay = int.Parse(gc.GetDayOfMonth(date).ToString());
			try
			{
				miladiDate = DateTime.Parse(
					miladiYear + "-" + miladiMonth + "-" + miladiDay).Date;

			}
			catch (Exception)
			{
				return false;
			}
			return true;
		}
    }
}
