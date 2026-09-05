export interface CalendarDay {
  date: string; // YYYY-MM-DD
  year: number;
  month: number; // 0-indexed (0 = Jan, 11 = Dec)
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface PresetRange {
  id: string;
  label: string;
  getRange: (referenceDate?: Date) => DateRange;
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const formatYmd = (year: number, monthIndex: number, day: number): string => {
  const y = String(year).padStart(4, "0");
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const parseYmd = (ymd: string): { year: number; month: number; day: number } | null => {
  if (!ymd) return null;
  const match = ymd.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
};

export const dateToYmd = (date: Date): string =>
  formatYmd(date.getFullYear(), date.getMonth(), date.getDate());

export const formatCalendarDisplayDate = (ymd: string): string => {
  const parsed = parseYmd(ymd);
  if (!parsed) return ymd;
  const monthName = MONTH_NAMES[parsed.month]?.slice(0, 3) ?? "";
  return `${parsed.day} ${monthName} ${parsed.year}`;
};

export const formatCalendarRangeDisplay = (startDate: string, endDate: string): string => {
  if (!startDate && !endDate) return "";
  if (startDate && !endDate) return formatCalendarDisplayDate(startDate);
  if (!startDate && endDate) return formatCalendarDisplayDate(endDate);
  if (startDate === endDate) return formatCalendarDisplayDate(startDate);
  return `${formatCalendarDisplayDate(startDate)} - ${formatCalendarDisplayDate(endDate)}`;
};

export const isSameDate = (d1?: string | null, d2?: string | null): boolean => {
  if (!d1 || !d2) return false;
  return d1.slice(0, 10) === d2.slice(0, 10);
};

export const isDateInRange = (
  date: string,
  start?: string | null,
  end?: string | null,
): boolean => {
  if (!date || !start || !end) return false;
  const target = date.slice(0, 10);
  const s = start.slice(0, 10);
  const e = end.slice(0, 10);
  const min = s <= e ? s : e;
  const max = s <= e ? e : s;
  return target >= min && target <= max;
};

export const isDateBefore = (d1: string, d2: string): boolean => d1.slice(0, 10) < d2.slice(0, 10);

export const isDateAfter = (d1: string, d2: string): boolean => d1.slice(0, 10) > d2.slice(0, 10);

export const getCalendarDays = (year: number, monthIndex: number): CalendarDay[] => {
  const todayYmd = dateToYmd(new Date());

  // First day of current month
  const firstDay = new Date(year, monthIndex, 1);
  // Day of week: 0 is Sunday, 1 is Monday... convert to Monday = 0, Sunday = 6
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;

  // Total days in current month
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Days in previous month
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();

  const days: CalendarDay[] = [];

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthYear = monthIndex === 0 ? year - 1 : year;
    const prevMonth = monthIndex === 0 ? 11 : monthIndex - 1;
    const ymd = formatYmd(prevMonthYear, prevMonth, day);
    const dayOfWeek = (new Date(prevMonthYear, prevMonth, day).getDay() + 6) % 7;

    days.push({
      date: ymd,
      year: prevMonthYear,
      month: prevMonth,
      day,
      isCurrentMonth: false,
      isToday: ymd === todayYmd,
      isWeekend: dayOfWeek === 5 || dayOfWeek === 6,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const ymd = formatYmd(year, monthIndex, d);
    const dayOfWeek = (new Date(year, monthIndex, d).getDay() + 6) % 7;

    days.push({
      date: ymd,
      year,
      month: monthIndex,
      day: d,
      isCurrentMonth: true,
      isToday: ymd === todayYmd,
      isWeekend: dayOfWeek === 5 || dayOfWeek === 6,
    });
  }

  // Next month leading days to fill 5 or 6 rows (multiple of 7, at least 35, up to 42)
  const totalSlots = days.length <= 35 ? 35 : 42;
  const remaining = totalSlots - days.length;
  for (let d = 1; d <= remaining; d++) {
    const nextMonthYear = monthIndex === 11 ? year + 1 : year;
    const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
    const ymd = formatYmd(nextMonthYear, nextMonth, d);
    const dayOfWeek = (new Date(nextMonthYear, nextMonth, d).getDay() + 6) % 7;

    days.push({
      date: ymd,
      year: nextMonthYear,
      month: nextMonth,
      day: d,
      isCurrentMonth: false,
      isToday: ymd === todayYmd,
      isWeekend: dayOfWeek === 5 || dayOfWeek === 6,
    });
  }

  return days;
};

export const PRESET_DATE_RANGES: PresetRange[] = [
  {
    id: "today",
    label: "Today",
    getRange: (ref = new Date()) => {
      const today = dateToYmd(ref);
      return { startDate: today, endDate: today };
    },
  },
  {
    id: "yesterday",
    label: "Yesterday",
    getRange: (ref = new Date()) => {
      const yesterday = new Date(ref);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = dateToYmd(yesterday);
      return { startDate: yStr, endDate: yStr };
    },
  },
  {
    id: "last7days",
    label: "Last 7 Days",
    getRange: (ref = new Date()) => {
      const start = new Date(ref);
      start.setDate(start.getDate() - 6);
      return { startDate: dateToYmd(start), endDate: dateToYmd(ref) };
    },
  },
  {
    id: "last30days",
    label: "Last 30 Days",
    getRange: (ref = new Date()) => {
      const start = new Date(ref);
      start.setDate(start.getDate() - 29);
      return { startDate: dateToYmd(start), endDate: dateToYmd(ref) };
    },
  },
  {
    id: "thisMonth",
    label: "This Month",
    getRange: (ref = new Date()) => {
      const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
      const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
      return { startDate: dateToYmd(start), endDate: dateToYmd(end) };
    },
  },
  {
    id: "lastMonth",
    label: "Last Month",
    getRange: (ref = new Date()) => {
      const start = new Date(ref.getFullYear(), ref.getMonth() - 1, 1);
      const end = new Date(ref.getFullYear(), ref.getMonth(), 0);
      return { startDate: dateToYmd(start), endDate: dateToYmd(end) };
    },
  },
  {
    id: "thisYear",
    label: "This Year",
    getRange: (ref = new Date()) => {
      const start = new Date(ref.getFullYear(), 0, 1);
      const end = new Date(ref.getFullYear(), 11, 31);
      return { startDate: dateToYmd(start), endDate: dateToYmd(end) };
    },
  },
];

export interface DateTimeParts {
  date: string; // YYYY-MM-DD
  hour24: number; // 0 - 23
  hour12: number; // 1 - 12
  minute: number; // 0 - 59
  period: "AM" | "PM";
}

export const parseDateTimeParts = (value?: string | null): DateTimeParts => {
  if (!value) {
    const now = new Date();
    const h24 = now.getHours();
    const m = now.getMinutes();
    const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      date: dateToYmd(now),
      hour24: h24,
      hour12: h12,
      minute: m,
      period,
    };
  }

  // Handle YYYY-MM-DDTHH:mm or ISO format
  if (value.includes("T")) {
    const [datePart, timePart] = value.split("T");
    const [hStr, mStr] = (timePart || "").split(":");
    const h24 = Math.min(23, Math.max(0, parseInt(hStr || "0", 10) || 0));
    const m = Math.min(59, Math.max(0, parseInt(mStr || "0", 10) || 0));
    const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      date: datePart,
      hour24: h24,
      hour12: h12,
      minute: m,
      period,
    };
  }

  // Value is date only (YYYY-MM-DD)
  return {
    date: value,
    hour24: 17, // default to 5:00 PM for task deadlines
    hour12: 5,
    minute: 0,
    period: "PM",
  };
};

export const buildDateTimeLocal = (
  date: string,
  hour12: number,
  minute: number,
  period: "AM" | "PM",
): string => {
  let h24 = hour12 % 12;
  if (period === "PM") {
    h24 += 12;
  }
  const hStr = String(h24).padStart(2, "0");
  const mStr = String(minute).padStart(2, "0");
  return `${date}T${hStr}:${mStr}`;
};

export const formatDateTimeDisplay = (value?: string | null): string => {
  if (!value) return "";
  const parts = parseDateTimeParts(value);
  const dateFormatted = formatCalendarDisplayDate(parts.date);
  const hStr = String(parts.hour12).padStart(2, "0");
  const mStr = String(parts.minute).padStart(2, "0");
  return `${dateFormatted}, ${hStr}:${mStr} ${parts.period}`;
};

export const getRelativeDayLabel = (dateYmd?: string | null): string | null => {
  if (!dateYmd) return null;
  const today = new Date();
  const todayYmd = dateToYmd(today);

  if (dateYmd === todayYmd) {
    return "Today";
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateYmd === dateToYmd(tomorrow)) {
    return "Tomorrow";
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateYmd === dateToYmd(yesterday)) {
    return "Yesterday";
  }

  // Calculate day difference
  const targetDate = new Date(dateYmd);
  const diffDays = Math.round(
    (targetDate.getTime() - new Date(todayYmd).getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays > 1 && diffDays <= 7) {
    return `In ${diffDays} days`;
  }
  if (diffDays < -1 && diffDays >= -7) {
    return `${Math.abs(diffDays)} days ago`;
  }

  return null;
};

