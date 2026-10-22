import {
  getCalendarDayDiff,
  getDueRelativeLabel,
  isDueWithin48Hours,
  isOverdue,
} from '../utils/dateUtils';

describe('Date & Timezone Handling ("The part that will take longer than you think")', () => {
  describe('getCalendarDayDiff - 23:30 vs 08:00 consistency', () => {
    it('must evaluate "due tomorrow" identically whether checked at 08:00 in the morning or 23:30 late night', () => {
      // Reference date: 2026-10-26 (Day 0)
      const morningRef = new Date(2026, 9, 26, 8, 0, 0); // 08:00
      const nightRef = new Date(2026, 9, 26, 23, 30, 0); // 23:30

      // Target deadline: tomorrow 2026-10-27 at 15:00
      const targetTomorrow = new Date(2026, 9, 27, 15, 0, 0);

      const diffFromMorning = getCalendarDayDiff(targetTomorrow, morningRef);
      const diffFromNight = getCalendarDayDiff(targetTomorrow, nightRef);

      expect(diffFromMorning).toBe(1);
      expect(diffFromNight).toBe(1);
      expect(diffFromMorning).toBe(diffFromNight);
    });

    it('must evaluate "due today" consistently whether checked at 01:00 or 23:00', () => {
      const earlyRef = new Date(2026, 9, 26, 1, 0, 0);
      const lateRef = new Date(2026, 9, 26, 23, 0, 0);

      const todayDeadline = new Date(2026, 9, 26, 23, 59, 0);

      expect(getCalendarDayDiff(todayDeadline, earlyRef)).toBe(0);
      expect(getCalendarDayDiff(todayDeadline, lateRef)).toBe(0);
    });

    it('must correctly calculate negative calendar day diff for overdue deadlines', () => {
      const now = new Date(2026, 9, 26, 12, 0, 0);
      const yesterday = new Date(2026, 9, 25, 23, 59, 0);
      const threeDaysAgo = new Date(2026, 9, 23, 10, 0, 0);

      expect(getCalendarDayDiff(yesterday, now)).toBe(-1);
      expect(getCalendarDayDiff(threeDaysAgo, now)).toBe(-3);
    });
  });

  describe('getDueRelativeLabel', () => {
    it('should return "Ngày mai..." for tomorrow deadline regardless of current hour', () => {
      const morningNow = new Date(2026, 9, 26, 8, 0, 0);
      const nightNow = new Date(2026, 9, 26, 23, 30, 0);
      const dueTomorrow = new Date(2026, 9, 27, 23, 59, 0).toISOString();

      const labelMorning = getDueRelativeLabel(dueTomorrow, morningNow);
      const labelNight = getDueRelativeLabel(dueTomorrow, nightNow);

      expect(labelMorning).toContain('Ngày mai');
      expect(labelNight).toContain('Ngày mai');
    });

    it('should return overdue message when deadline has passed', () => {
      const now = new Date(2026, 9, 26, 12, 0, 0);
      const pastDate = new Date(2026, 9, 23, 10, 0, 0).toISOString();

      const label = getDueRelativeLabel(pastDate, now);
      expect(label).toContain('Quá hạn 3 ngày');
    });
  });

  describe('isDueWithin48Hours', () => {
    it('should return true for a deadline within the next 48 hours', () => {
      const now = new Date(2026, 9, 26, 10, 0, 0);
      const in24Hours = new Date(2026, 9, 27, 10, 0, 0).toISOString();
      const in47Hours = new Date(2026, 9, 28, 9, 0, 0).toISOString();

      expect(isDueWithin48Hours(in24Hours, now)).toBe(true);
      expect(isDueWithin48Hours(in47Hours, now)).toBe(true);
    });

    it('should return false for deadlines beyond 48 hours or in the past', () => {
      const now = new Date(2026, 9, 26, 10, 0, 0);
      const in72Hours = new Date(2026, 9, 29, 10, 0, 0).toISOString();
      const yesterday = new Date(2026, 9, 25, 10, 0, 0).toISOString();

      expect(isDueWithin48Hours(in72Hours, now)).toBe(false);
      expect(isDueWithin48Hours(yesterday, now)).toBe(false);
    });
  });

  describe('isOverdue', () => {
    it('should accurately detect expired timestamps', () => {
      const now = new Date(2026, 9, 26, 12, 0, 0);
      const past = new Date(2026, 9, 26, 11, 59, 0).toISOString();
      const future = new Date(2026, 9, 26, 12, 0, 1).toISOString();

      expect(isOverdue(past, now)).toBe(true);
      expect(isOverdue(future, now)).toBe(false);
    });
  });
});
