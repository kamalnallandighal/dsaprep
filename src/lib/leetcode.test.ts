import { describe, it, expect } from 'vitest';
import { parseLeetCodeUrl } from './leetcode';

describe('parseLeetCodeUrl', () => {
  it('parses standard URL with trailing slash', () => {
    expect(parseLeetCodeUrl('https://leetcode.com/problems/two-sum/')).toEqual({
      slug: 'two-sum',
      titleGuess: 'Two Sum',
    });
  });
  it('parses URL without trailing slash', () => {
    expect(parseLeetCodeUrl('https://leetcode.com/problems/two-sum')).toEqual({
      slug: 'two-sum',
      titleGuess: 'Two Sum',
    });
  });
  it('parses www subdomain URL', () => {
    expect(parseLeetCodeUrl('https://www.leetcode.com/problems/two-sum/')).toEqual({
      slug: 'two-sum',
      titleGuess: 'Two Sum',
    });
  });
  it('parses URL with extra path segment', () => {
    expect(parseLeetCodeUrl('https://leetcode.com/problems/two-sum/description/')).toEqual({
      slug: 'two-sum',
      titleGuess: 'Two Sum',
    });
  });
  it('returns null for contest URL', () => {
    expect(parseLeetCodeUrl('https://leetcode.com/contest/weekly-contest-123')).toBeNull();
  });
  it('returns null for non-leetcode URL', () => {
    expect(parseLeetCodeUrl('https://example.com/problems/two-sum/')).toBeNull();
  });
  it('returns null for garbage input', () => {
    expect(parseLeetCodeUrl('garbage')).toBeNull();
  });
});
