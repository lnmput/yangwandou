const BIRTH_YEAR = 2018;
const BIRTH_MONTH = 11;
const BIRTH_DAY = 23;
const AGE_TIME_ZONE = "Asia/Tokyo";

const cnNumerals = [
  "零",
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
  "十一",
  "十二",
  "十三",
  "十四",
  "十五",
  "十六",
  "十七",
  "十八",
  "十九",
  "二十",
];

const enOrdinals = [
  "zeroth",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",
  "eleventh",
  "twelfth",
  "thirteenth",
  "fourteenth",
  "fifteenth",
  "sixteenth",
  "seventeenth",
  "eighteenth",
  "nineteenth",
  "twentieth",
];

const toRoman = (year: number) => {
  const numerals: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remaining = year;
  let result = "";

  for (const [value, numeral] of numerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result;
};

const formatOrdinal = (age: number) => {
  if (enOrdinals[age]) return enOrdinals[age];

  const mod10 = age % 10;
  const mod100 = age % 100;
  const suffix = mod10 === 1 && mod100 !== 11
    ? "st"
    : mod10 === 2 && mod100 !== 12
      ? "nd"
      : mod10 === 3 && mod100 !== 13
        ? "rd"
        : "th";

  return `${age}${suffix}`;
};

const formatCnAge = (age: number) => cnNumerals[age] ?? String(age);

const getDateParts = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: AGE_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
  };
};

export const getAgeInfo = (asOf = new Date()) => {
  const { year, month, day } = getDateParts(asOf);
  const hasHadBirthday = month > BIRTH_MONTH || (month === BIRTH_MONTH && day >= BIRTH_DAY);
  const age = year - BIRTH_YEAR - (hasHadBirthday ? 0 : 1);
  const safeAge = Math.max(0, age);

  return {
    age: safeAge,
    birthYear: BIRTH_YEAR,
    currentYear: year,
    currentYearRoman: toRoman(year),
    cnAge: formatCnAge(safeAge),
    enOrdinalAge: formatOrdinal(safeAge),
    timeZone: AGE_TIME_ZONE,
  };
};
