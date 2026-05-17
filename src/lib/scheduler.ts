export const INTERVALS_DAYS = [1, 3, 7, 21, 60] as const;
export type Rating = 'again' | 'good' | 'easy';
export type ReviewResult = {
  nextStage: number;
  daysUntilDue: number;
  status: 'learning' | 'graduated';
};

export function applyReview(prevStage: number, rating: Rating): ReviewResult {
  if (prevStage < 0 || prevStage > 5) {
    throw new Error(`Invalid prevStage: ${prevStage}`);
  }
  let nextStage: number;
  if (rating === 'again') nextStage = Math.max(0, prevStage - 1);
  else if (rating === 'good') nextStage = prevStage + 1;
  else nextStage = prevStage + 2;

  if (nextStage >= 5) {
    return { nextStage: 5, daysUntilDue: 365, status: 'graduated' };
  }
  return {
    nextStage,
    daysUntilDue: INTERVALS_DAYS[nextStage],
    status: 'learning',
  };
}
