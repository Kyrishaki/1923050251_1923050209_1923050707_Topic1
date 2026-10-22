/**
 * Date and Timezone Utilities
 * 
 * Satisfies the critical requirement:
 * "Timezone and date handling. 'Due tomorrow' must mean the same thing at 23:30 as it does at 08:00."
 */

/**
 * Calculates the calendar day difference between two dates in local timezone.
 * Strips out hours, minutes, and seconds so that a date tomorrow at 08:00
 * evaluated from today at 23:30 yields strictly +1 day.
 */
export function getCalendarDayDiff(targetInput: Date | string, referenceInput: Date | string = new Date()): number {
  const target = typeof targetInput === 'string' ? new Date(targetInput) : targetInput;
  const ref = typeof referenceInput === 'string' ? new Date(referenceInput) : referenceInput;

  // Local midnight timestamps (00:00:00.000)
  const refMidnight = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate()).getTime();
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();

  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((targetMidnight - refMidnight) / MS_PER_DAY);
}

/**
 * Formats a human-readable relative deadline label based on local calendar days.
 * Consistent across all hours of the day.
 */
export function getDueRelativeLabel(dueAt: string, referenceDate: Date = new Date()): string {
  const target = new Date(dueAt);
  if (isNaN(target.getTime())) {
    return 'Không rõ thời hạn';
  }

  const diff = getCalendarDayDiff(target, referenceDate);
  const timeStr = formatTime(target);

  if (diff < -1) {
    return `Quá hạn ${Math.abs(diff)} ngày`;
  }
  if (diff === -1) {
    return `Quá hạn từ hôm qua (${timeStr})`;
  }
  if (diff === 0) {
    // Check if the exact hour/minute has already passed today
    if (target.getTime() < referenceDate.getTime()) {
      return `Quá hạn hôm nay (${timeStr})`;
    }
    return `Hôm nay lúc ${timeStr}`;
  }
  if (diff === 1) {
    return `Ngày mai lúc ${timeStr}`;
  }
  if (diff === 2) {
    return `Còn 2 ngày (${timeStr})`;
  }
  if (diff > 2 && diff <= 6) {
    return `${getDayOfWeekName(target)} (${timeStr})`;
  }

  return `${formatDate(target)} lúc ${timeStr}`;
}

/**
 * Checks if a deadline falls within the next 48 hours from the reference timestamp,
 * and has not already expired.
 */
export function isDueWithin48Hours(dueAt: string, referenceDate: Date = new Date()): boolean {
  const target = new Date(dueAt);
  if (isNaN(target.getTime())) return false;

  const now = referenceDate.getTime();
  const targetTime = target.getTime();
  const in48Hours = now + 48 * 60 * 60 * 1000;

  return targetTime >= now && targetTime <= in48Hours;
}

/**
 * Returns true if the deadline timestamp has strictly passed compared to referenceDate.
 */
export function isOverdue(dueAt: string, referenceDate: Date = new Date()): boolean {
  const target = new Date(dueAt);
  if (isNaN(target.getTime())) return false;
  return target.getTime() < referenceDate.getTime();
}

/**
 * Format date as DD/MM/YYYY
 */
export function formatDate(input: Date | string): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format time as HH:mm (24-hour format)
 */
export function formatTime(input: Date | string): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format both date and time as HH:mm DD/MM/YYYY
 */
export function formatDateTime(input: Date | string): string {
  return `${formatTime(input)} ${formatDate(input)}`;
}

/**
 * Vietnamese day of week name
 */
export function getDayOfWeekName(input: Date | string): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  const day = date.getDay(); // 0 is Sunday, 1 is Monday
  switch (day) {
    case 1:
      return 'Thứ Hai';
    case 2:
      return 'Thứ Ba';
    case 3:
      return 'Thứ Tư';
    case 4:
      return 'Thứ Năm';
    case 5:
      return 'Thứ Sáu';
    case 6:
      return 'Thứ Bảy';
    case 0:
    default:
      return 'Chủ Nhật';
  }
}

/**
 * Generates an array of 7 dates representing the current week (Monday to Sunday)
 */
export function getCurrentWeekDays(centerDate: Date = new Date()): Array<{ date: Date; label: string; dateStr: string; isToday: boolean }> {
  const curr = new Date(centerDate);
  const dayOfWeek = curr.getDay(); // 0 is Sun, 1 is Mon
  // Adjust so Monday is day 0
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate() + diffToMonday);

  const days = [];
  const today = new Date(centerDate.getFullYear(), centerDate.getMonth(), centerDate.getDate()).getTime();

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dayMidnight = d.getTime();
    days.push({
      date: d,
      label: getDayOfWeekName(d),
      dateStr: formatDate(d),
      isToday: dayMidnight === today,
    });
  }

  return days;
}
