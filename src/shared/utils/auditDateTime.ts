const NAIVE_DATETIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?$/;

const hasTimezone = (value: string): boolean =>
  /(?:Z|[+-]\d{2}:\d{2}|[+-]\d{4})$/i.test(value);

const normalizeOffset = (value: string): string =>
  value.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");

export const parseAuditTimestamp = (
  value: string | null | undefined
): Date | null => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const naiveMatch = raw.match(NAIVE_DATETIME_RE);
  if (naiveMatch) {
    const [
      ,
      year,
      month,
      day,
      hour,
      minute,
      second = "0",
      fraction = "0",
    ] = naiveMatch;

    const ms = Number(fraction.padEnd(3, "0").slice(0, 3));
    const utcDate = new Date(
      Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
        ms
      )
    );
    if (!Number.isNaN(utcDate.getTime())) return utcDate;
  }

  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const candidate = hasTimezone(normalized)
    ? normalizeOffset(normalized)
    : `${normalized}Z`;

  const parsed = new Date(candidate);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

export const formatAuditTimestampLocal = (
  value: string | null | undefined
): string => {
  const date = parseAuditTimestamp(value);
  if (!date) return "—";

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
};

