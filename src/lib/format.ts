const nf = new Intl.NumberFormat("en-NG");

export const naira = (n: number) => `${n < 0 ? "−" : ""}₦${nf.format(Math.abs(Math.round(n)))}`;
export const plainNumber = (n: number) => nf.format(Math.round(n));
export const digitsOnly = (s: string) => parseInt(s.replace(/\D/g, ""), 10) || 0;

export const firstName = (name: string) => name.split(" ")[0];
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
export const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const pad = (n: number) => String(n).padStart(2, "0");
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Nigeria is on West Africa Time, UTC+1, all year (the helpers below say "lagos" for that time zone). */
const LAGOS_OFFSET_MS = 60 * 60 * 1000;
const lagos = (ts: number) => new Date(ts + LAGOS_OFFSET_MS);

export const clock = (ts: number) => {
  const d = lagos(ts);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};
export const clockSeconds = (ts: number) => `${clock(ts)}:${pad(lagos(ts).getUTCSeconds())}`;

/** YYYY-MM-DD in Nigerian time. */
export const lagosDate = (ts: number) => {
  const d = lagos(ts);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

export const dayLabel = (ts: number) => {
  const d = lagos(ts);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
};

export const daysAgo = (n: number, from = Date.now()) => from - n * 86_400_000;

export const msLeftToday = (now: number) => {
  const d = lagos(now);
  const end = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999) - LAGOS_OFFSET_MS;
  return Math.max(0, end - now);
};

export const hoursMinutes = (ms: number) => {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor(ms / 60_000) % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

/** 42 min, or 1 hr 5 min. */
export const minutesLabel = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ""}`);
export const minutesSeconds = (s: number) => `${Math.floor(s / 60)}:${pad(s % 60)}`;

export const partOfDay = (now: number) => {
  const h = lagos(now).getUTCHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
};

export const relativeTime = (ts: number, now: number) => {
  const s = Math.round((now - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return dayLabel(ts);
};
