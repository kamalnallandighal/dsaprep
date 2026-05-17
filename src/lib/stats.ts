export type StreakResult = { current: number; longest: number };

export function computeStreak(
  activityDates: string[],
  todayStr: string
): StreakResult {
  if (activityDates.length === 0) return { current: 0, longest: 0 };

  // Deduplicate and sort
  const unique = Array.from(new Set(activityDates)).sort();

  // Find longest run
  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1]);
    const curr = new Date(unique[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
    if (diffDays === 1) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 1;
    }
  }

  // Find current streak (ending at today or yesterday)
  const today = new Date(todayStr);
  const yesterday = new Date(todayStr);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const lastDate = unique[unique.length - 1];
  if (lastDate !== todayStr && lastDate !== yesterdayStr) {
    return { current: 0, longest };
  }

  // Walk backwards from lastDate
  let current = 1;
  for (let i = unique.length - 2; i >= 0; i--) {
    const curr = new Date(unique[i + 1]);
    const prev = new Date(unique[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / 86400000;
    if (diffDays === 1) {
      current++;
    } else {
      break;
    }
  }

  return { current, longest };
}
