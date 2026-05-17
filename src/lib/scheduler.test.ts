import { describe, it, expect } from 'vitest';
import { applyReview, applyMasteryReview, MASTERY_REFRESH_DAYS } from './scheduler';

describe('applyReview', () => {
  it('new problem + good -> stage 1, +3 days', () => {
    expect(applyReview(0, 'good')).toEqual({
      nextStage: 1, daysUntilDue: 3, status: 'learning'
    });
  });
  it('new problem + again -> stays at stage 0, +1 day', () => {
    expect(applyReview(0, 'again')).toEqual({
      nextStage: 0, daysUntilDue: 1, status: 'learning'
    });
  });
  it('new problem + easy -> stage 2, +7 days', () => {
    expect(applyReview(0, 'easy')).toEqual({
      nextStage: 2, daysUntilDue: 7, status: 'learning'
    });
  });
  it('stage 4 + good -> graduates', () => {
    expect(applyReview(4, 'good')).toEqual({
      nextStage: 5, daysUntilDue: 365, status: 'graduated'
    });
  });
  it('stage 3 + easy -> graduates (skips stage 4)', () => {
    expect(applyReview(3, 'easy')).toEqual({
      nextStage: 5, daysUntilDue: 365, status: 'graduated'
    });
  });
  it('stage 2 + again -> drops to stage 1, +3 days', () => {
    expect(applyReview(2, 'again')).toEqual({
      nextStage: 1, daysUntilDue: 3, status: 'learning'
    });
  });
  it('throws on invalid stage', () => {
    expect(() => applyReview(-1, 'good')).toThrow();
    expect(() => applyReview(6, 'good')).toThrow();
  });
});

describe('applyMasteryReview', () => {
  it('good -> stays graduated, +180 days', () => {
    expect(applyMasteryReview('good')).toEqual({
      nextStage: 5, daysUntilDue: MASTERY_REFRESH_DAYS, status: 'graduated'
    });
  });
  it('easy -> stays graduated, +180 days', () => {
    expect(applyMasteryReview('easy')).toEqual({
      nextStage: 5, daysUntilDue: MASTERY_REFRESH_DAYS, status: 'graduated'
    });
  });
  it('again -> drops to stage 2, status learning, +1 day', () => {
    expect(applyMasteryReview('again')).toEqual({
      nextStage: 2, daysUntilDue: 1, status: 'learning'
    });
  });
});
