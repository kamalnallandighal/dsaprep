export const INTERVALS_DAYS = [1, 3, 7, 21, 60] as const;
export const MASTERY_CALIBRATION_DAYS = 30;
export const MASTERY_REFRESH_DAYS = 180;

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

// Called when a graduated problem surfaces for calibration review.
// Again drops back to learning at stage 2 (due tomorrow for fast recovery).
// Good/Easy extends the graduation shelf-life by MASTERY_REFRESH_DAYS.
export function applyMasteryReview(rating: Rating): ReviewResult {
  if (rating === 'again') {
    return { nextStage: 2, daysUntilDue: 1, status: 'learning' };
  }
  return { nextStage: 5, daysUntilDue: MASTERY_REFRESH_DAYS, status: 'graduated' };
}
