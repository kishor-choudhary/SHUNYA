/** Shared formatting helpers — safe on both server and client. */

const DATE_LONG: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "2-digit",
  month: "short",
  year: "numeric",
};

const TIME: Intl.DateTimeFormatOptions = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

export function formatEventDate(iso: string, timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date to be announced";
  return new Intl.DateTimeFormat("en-GB", { ...DATE_LONG, timeZone }).format(date);
}

export function formatEventTime(iso: string, timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Time to be announced";
  return new Intl.DateTimeFormat("en-GB", { ...TIME, timeZone }).format(date);
}

export function formatDateTime(iso: string, timeZone?: string): string {
  return `${formatEventDate(iso, timeZone)} · ${formatEventTime(iso, timeZone)}`;
}

/** Short "12 APR" style stamp used on posters and cards. */
export function formatDayStamp(iso: string, timeZone?: string): { day: string; month: string; year: string } {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return { day: "--", month: "---", year: "----" };
  return {
    day: new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone }).format(date),
    month: new Intl.DateTimeFormat("en-GB", { month: "short", timeZone }).format(date).toUpperCase(),
    year: new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone }).format(date),
  };
}

/** ISO string for `<time datetime>` and calendar/structured data. */
export function toDateTimeAttribute(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

/** ISO date (YYYY-MM-DD) for date inputs. */
export function toDateInputValue(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

/**
 * Google Calendar URL built from confirmed event data only — no invented
 * details are added.
 */
export function googleCalendarUrl(event: {
  title: string;
  startDate: string;
  endDate?: string;
  description?: string;
  venue?: string;
  city?: string;
}): string {
  const start = new Date(event.startDate);
  const end = event.endDate
    ? new Date(event.endDate)
    : new Date(start.getTime() + 5 * 60 * 60 * 1000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: event.description ?? "",
    location: [event.venue, event.city].filter(Boolean).join(", "),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function relativeDayLabel(iso: string): string {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return "Date to be announced";
  const days = Math.ceil((target - Date.now()) / 86_400_000);
  if (days < 0) return "Past event";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 45) return `In ${days} days`;
  const months = Math.round(days / 30);
  return `In ~${months} month${months === 1 ? "" : "s"}`;
}

export function isPast(iso: string): boolean {
  const end = new Date(iso).getTime();
  return !Number.isNaN(end) && end < Date.now();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function truncate(text: string, length = 160): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).replace(/\s+\S*$/, "")}…`;
}
