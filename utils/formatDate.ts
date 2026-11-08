/**
 * Formats a stored "YYYY-MM-DD" date for readers. The parts are read directly
 * instead of through `new Date(string)`, which treats the date as UTC and shows
 * the previous day in US time zones. Anything that is not a date is returned as is.
 */
export function formatArticleDate(value: string | undefined | null): string {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
