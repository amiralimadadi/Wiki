function toPersianDigits(input: string | number): string {
  return input.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);
}

function gregorianToJalali(gDate: string): string {
  const [year, month, day] = gDate.split("T")[0].split("-").map(Number);

  const gy = year;
  const gm = month;
  const gd = day;

  // آرایه تعداد روزهای ماه‌های میلادی
  const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // بررسی سال کبیسه میلادی
  if ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) {
    g_days_in_month[1] = 29;
  }

  let jy = gy - 621;
  let jm, jd;

  // محاسبه روز از ابتدای سال
  let g_day_no = 0;
  for (let i = 0; i < gm - 1; i++) {
    g_day_no += g_days_in_month[i];
  }
  g_day_no += gd;

  // بررسی کبیسه بودن سال جلالی
  const leap = ((jy - 1) % 33) % 4 === 0;

  // آرایه تعداد روزهای ماه‌های جلالی
  const j_days_in_month = [
    31,
    31,
    31,
    31,
    31,
    31,
    30,
    30,
    30,
    30,
    30,
    leap ? 30 : 29,
  ];

  if (g_day_no <= 79) {
    // در ابتدای سال جلالی
    if (g_day_no <= 79) {
      jy--;
      g_day_no += leap ? 11 : 10;
    } else {
      g_day_no -= 79;
    }
  } else {
    g_day_no -= 79;
  }

  // پیدا کردن ماه و روز جلالی
  let i = 0;
  while (g_day_no > j_days_in_month[i]) {
    g_day_no -= j_days_in_month[i];
    i++;
  }

  jm = i + 1;
  jd = g_day_no;

  return `${toPersianDigits(jy)}/${toPersianDigits(jm)}/${toPersianDigits(jd)}`;
}

export default gregorianToJalali;
