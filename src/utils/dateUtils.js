/**
 * Parse a YYYY-MM-DD string as a local date (not UTC).
 * Avoids the timezone offset bug where `new Date("2026-06-18")` is treated as UTC midnight,
 * which shifts the date back by one day in timezones like Chile (UTC-3/UTC-4).
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a Date or YYYY-MM-DD string to a locale date string safely.
 * Parses the date string as local before formatting.
 */
export function formatLocalDate(dateStr, locale = 'es-CL', options = {}) {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString(locale, options);
}

/**
 * Get today's date as a YYYY-MM-DD string in local timezone.
 * Avoids the bug where `new Date().toISOString().split('T')[0]` can return
 * the next day's date when the local time is late in the evening.
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
