import { formatInTimeZone } from 'date-fns-tz';
import { addDays, parseISO, format } from 'date-fns';

export function todayInTz(tz: string): string {
  return formatInTimeZone(new Date(), tz, 'yyyy-MM-dd');
}

export function tomorrowInTz(tz: string): string {
  const today = todayInTz(tz);
  return format(addDays(parseISO(today), 1), 'yyyy-MM-dd');
}

export function addDaysToTzDate(tz: string, days: number): string {
  const today = todayInTz(tz);
  return format(addDays(parseISO(today), days), 'yyyy-MM-dd');
}

export function formatDate(dateStr: string): string {
  // Format a yyyy-MM-dd date string as "Jun 18"
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
