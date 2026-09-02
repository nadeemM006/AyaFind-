import { parseCareRequest, parseTimeOfDay, formatTimeOfDay, formatTimeRange } from './parseCareRequest';

describe('parseTimeOfDay / formatTimeOfDay', () => {
  test('parses "8:14:15 AM" (12h with seconds)', () => {
    expect(formatTimeOfDay('8:14:15 AM')).toBe('8:14 AM');
  });

  test('parses "08:37:18" (24h with seconds)', () => {
    expect(formatTimeOfDay('08:37:18')).toBe('8:37 AM');
  });

  test('parses "14:00" (24h)', () => {
    expect(formatTimeOfDay('14:00')).toBe('2:00 PM');
  });

  test('parses "6:00 PM"', () => {
    expect(formatTimeOfDay('6:00 PM')).toBe('6:00 PM');
  });

  test('parses "12:30 AM" as half past midnight', () => {
    expect(formatTimeOfDay('12:30 AM')).toBe('12:30 AM');
    expect(parseTimeOfDay('12:30 AM')).toBe(30);
  });

  test('returns null for non-times', () => {
    expect(formatTimeOfDay('later')).toBeNull();
    expect(formatTimeOfDay('')).toBeNull();
    expect(formatTimeOfDay(null)).toBeNull();
  });
});

describe('formatTimeRange', () => {
  test('start time plus whole-hour duration', () => {
    expect(formatTimeRange('5:00 PM', 4)).toBe('5:00 PM – 9:00 PM');
  });

  test('24h stored time with seconds', () => {
    expect(formatTimeRange('14:00:00', 2)).toBe('2:00 PM – 4:00 PM');
  });

  test('range crossing midnight wraps', () => {
    expect(formatTimeRange('11:00 PM', 4)).toBe('11:00 PM – 3:00 AM');
  });

  test('missing or zero duration returns the start time only', () => {
    expect(formatTimeRange('6:00 PM')).toBe('6:00 PM');
    expect(formatTimeRange('6:00 PM', 0)).toBe('6:00 PM');
  });

  test('unparseable time returns null', () => {
    expect(formatTimeRange('flexible', 4)).toBeNull();
    expect(formatTimeRange(null, 4)).toBeNull();
  });
});

describe('parseCareRequest', () => {
  test('full natural sentence from the product example', () => {
    const r = parseCareRequest('I need an Urdu-speaking Aya for my 3-year-old tomorrow from 6–10 PM.');
    expect(r.age).toBe(3);
    expect(r.language).toBe('urdu');
    expect(r.dateLabel).toBe('Tomorrow');
    expect(r.timeLabel).toBe('6:00 PM – 10:00 PM');
    expect(r.chips).toContain('3-year-old');
    expect(r.chips).toContain('Urdu');
    expect(r.chips).toContain('6:00 PM – 10:00 PM');
  });

  test('single evening time and duration', () => {
    const r = parseCareRequest('Need someone tonight at 8pm for 3 hours');
    expect(r.timeLabel).toBe('8:00 PM');
    expect(r.durationHours).toBe(3);
  });

  test('language, weekend and budget', () => {
    const r = parseCareRequest('Punjabi speaking aya this weekend, budget pkr 600');
    expect(r.language).toBe('punjabi');
    expect(r.dateLabel).toBe('This weekend');
    expect(r.budget).toBe(600);
    expect(r.chips).toContain('PKR 600/hr');
  });

  test('infant detected and mapped to infant care', () => {
    const r = parseCareRequest('Experienced aya for my infant');
    expect(r.ageWord).toBe('infant');
    expect(r.specialNeeds).toBe('Infant care');
    expect(r.chips).toContain('Infant');
  });

  test('toddler and part of day', () => {
    const r = parseCareRequest('Aya for toddler on weekday mornings');
    expect(r.ageWord).toBe('toddler');
    expect(r.timeLabel).toBe('Morning');
  });

  test('range with "until"', () => {
    const r = parseCareRequest('from 2 until 5 pm tomorrow');
    expect(r.timeLabel).toBe('2:00 PM – 5:00 PM');
    expect(r.dateLabel).toBe('Tomorrow');
  });

  test('unambiguous 24-hour time', () => {
    const r = parseCareRequest('need aya at 18:00');
    expect(r.timeLabel).toBe('6:00 PM');
  });

  test('"2-3 hours" is a duration, not a time range', () => {
    const r = parseCareRequest('aya for 2-3 hours tomorrow');
    expect(r.timeLabel).toBeNull();
    expect(r.durationHours).toBe(3);
    expect(r.dateLabel).toBe('Tomorrow');
  });

  test('special needs keywords', () => {
    expect(parseCareRequest('aya for special needs child').specialNeeds).toBe('Special needs child');
    expect(parseCareRequest('aya experienced with medical needs').specialNeeds).toBe('Medical needs');
    expect(parseCareRequest('aya for twins tomorrow').specialNeeds).toBe('Multiple children');
  });

  test('empty or unrelated text yields no chips', () => {
    const r = parseCareRequest('');
    expect(r.chips).toEqual([]);
    expect(r.age).toBeNull();
    expect(r.timeLabel).toBeNull();

    const r2 = parseCareRequest('hello there');
    expect(r2.chips).toEqual([]);
  });
});
