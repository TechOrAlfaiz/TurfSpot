import {
  parse,
  addHours,
  format,
  isEqual,
  parseISO,
  isValid,
  isBefore,
  isAfter,
  addDays,
} from "date-fns";

/**
 * Checks if a value is a valid Date instance
 */
export const isValidDate = (d) => {
  return d instanceof Date && !isNaN(d.getTime());
};

/**
 * Safely parses any date input into a valid Date object or null
 * Rules: null, undefined, empty string, malformed string -> null
 */
export const parseSafeDate = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  if (typeof value === "number") {
    const d = new Date(value);
    return isValidDate(d) ? d : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    // YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const parsed = parse(trimmed, "yyyy-MM-dd", new Date());
      if (isValidDate(parsed)) return parsed;
    }

    // ISO timestamp
    const parsedIso = parseISO(trimmed);
    if (isValidDate(parsedIso)) return parsedIso;

    // Fallback standard Date parse
    const fallback = new Date(trimmed);
    if (isValidDate(fallback)) return fallback;
  }

  return null;
};

/**
 * Safely formats a date value with fallback
 */
export const formatSafeDate = (dateValue, formatStr = "yyyy-MM-dd", fallback = "") => {
  const d = parseSafeDate(dateValue);
  if (!d) return fallback;
  try {
    return format(d, formatStr);
  } catch (e) {
    return fallback;
  }
};

/**
 * Safely parses a time string in any format ("06:00", "18:00", "06:00 AM", "6:00 PM")
 * Anchors the time to baseDate if provided, or today
 */
export const parseTimeStr = (timeStr, baseDate = null) => {
  if (!timeStr || typeof timeStr !== "string") return null;
  const trimmed = timeStr.trim();
  if (!trimmed) return null;

  const anchorDate = parseSafeDate(baseDate) || new Date();
  const base = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), anchorDate.getDate(), 0, 0, 0, 0);

  // Try "hh:mm a" or "h:mm a" (e.g. "06:00 PM", "6:00 AM")
  if (/(am|pm)/i.test(trimmed)) {
    const cleaned = trimmed.replace(/\s+/g, " ").toUpperCase();
    let parsed = parse(cleaned, "hh:mm a", base);
    if (isValidDate(parsed)) return parsed;
    parsed = parse(cleaned, "h:mm a", base);
    if (isValidDate(parsed)) return parsed;
    parsed = parse(cleaned, "h a", base);
    if (isValidDate(parsed)) return parsed;
  }

  // Try 24-hour "HH:mm" (e.g. "18:00", "06:00")
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const parts = trimmed.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      const d = new Date(base);
      d.setHours(hours, minutes, 0, 0);
      return d;
    }
  }

  return null;
};

export const parseTime = parseTimeStr;

/**
 * Formats any time string into standard display format "06:00 PM"
 */
export const formatTimeDisplay = (timeStr) => {
  const parsed = parseTimeStr(timeStr);
  if (!parsed) return timeStr || "";
  return format(parsed, "hh:mm a");
};

export const formatTime = (date) => {
  const d = parseSafeDate(date);
  if (!d) return "";
  return format(d, "hh:mm a");
};

/**
 * Calculates end time after adding duration hours to startTimeStr
 */
export const getEndTime = (startTimeStr, durationHours = 1) => {
  if (!startTimeStr) return "";
  const start = parseTimeStr(startTimeStr);
  if (!start) return "";
  const end = addHours(start, durationHours);
  return format(end, "hh:mm a");
};

/**
 * Compares two time strings for equality
 */
export const isSameTime = (time1, time2) => {
  const t1 = parseTimeStr(time1);
  const t2 = parseTimeStr(time2);
  if (!t1 || !t2) return false;
  return t1.getHours() === t2.getHours() && t1.getMinutes() === t2.getMinutes();
};
