import { describe, it, expect } from 'vitest';
import { computeStreak } from './stats';

describe('computeStreak', () => {
  it('returns 0/0 for no activity', () => {
    expect(computeStreak([], '2026-06-15')).toEqual({ current: 0, longest: 0 });
  });
  it('returns 1/1 for activity today only', () => {
    expect(computeStreak(['2026-06-15'], '2026-06-15')).toEqual({ current: 1, longest: 1 });
  });
  it('returns 1/1 for activity yesterday only (streak alive)', () => {
    expect(computeStreak(['2026-06-14'], '2026-06-15')).toEqual({ current: 1, longest: 1 });
  });
  it('returns 0/3 if last activity was 2+ days ago', () => {
    expect(
      computeStreak(['2026-06-10', '2026-06-11', '2026-06-12'], '2026-06-15')
    ).toEqual({ current: 0, longest: 3 });
  });
  it('counts consecutive days ending today', () => {
    expect(
      computeStreak(['2026-06-13', '2026-06-14', '2026-06-15'], '2026-06-15')
    ).toEqual({ current: 3, longest: 3 });
  });
  it('handles duplicates (multiple activities per day = 1 day)', () => {
    expect(
      computeStreak(['2026-06-15', '2026-06-15', '2026-06-15'], '2026-06-15')
    ).toEqual({ current: 1, longest: 1 });
  });
  it('longest streak from earlier run', () => {
    expect(
      computeStreak(
        ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-15'],
        '2026-06-15'
      )
    ).toEqual({ current: 1, longest: 5 });
  });
});
