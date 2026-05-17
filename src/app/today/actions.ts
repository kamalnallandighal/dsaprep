'use server';

import { createClient } from '@/lib/supabase/server';
import { applyReview, applyMasteryReview, MASTERY_CALIBRATION_DAYS, type Rating } from '@/lib/scheduler';
import { revalidatePath } from 'next/cache';
import { addDaysToTzDate } from '@/lib/date';

export async function reviewProblem(userProblemId: number, rating: Rating) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: up } = await supabase
    .from('user_problems')
    .select('id, stage, status, user_id')
    .eq('id', userProblemId)
    .eq('user_id', user.id)
    .single();
  if (!up) throw new Error('Problem not found');

  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('user_id', user.id)
    .single();
  const tz = profile?.timezone ?? 'America/Los_Angeles';

  // Route calibration reviews (graduated problems due today) through applyMasteryReview
  const result =
    up.status === 'graduated'
      ? applyMasteryReview(rating)
      : applyReview(up.stage, rating);

  const nextDueStr = addDaysToTzDate(tz, result.daysUntilDue);

  const updatePayload: Record<string, unknown> = {
    stage: result.nextStage,
    status: result.status,
    next_due_date: nextDueStr,
    last_reviewed: new Date().toISOString(),
  };

  // If a mastered problem fails calibration and re-enters learning, clear graduation_source
  if (up.status === 'graduated' && result.status === 'learning') {
    updatePayload.graduation_source = null;
  }

  const { data: updated } = await supabase
    .from('user_problems')
    .update(updatePayload)
    .eq('id', userProblemId)
    .eq('stage', up.stage)
    .select('id')
    .single();

  if (!updated) {
    revalidatePath('/today');
    return; // already reviewed; no-op
  }

  await supabase.from('reviews').insert({
    user_id: user.id,
    user_problem_id: userProblemId,
    rating,
    prev_stage: up.stage,
    next_stage: result.nextStage,
  });

  revalidatePath('/today');
  revalidatePath('/problems');
}

export async function markMastered(userProblemId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: up } = await supabase
    .from('user_problems')
    .select('id, stage, status, user_id')
    .eq('id', userProblemId)
    .eq('user_id', user.id)
    .single();
  if (!up) throw new Error('Problem not found');
  if (up.stage < 2) throw new Error('Problem must be at stage 2 or higher to mark as mastered');

  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('user_id', user.id)
    .single();
  const tz = profile?.timezone ?? 'America/Los_Angeles';

  const nextDueStr = addDaysToTzDate(tz, MASTERY_CALIBRATION_DAYS);

  const { data: updated } = await supabase
    .from('user_problems')
    .update({
      stage: 5,
      status: 'graduated',
      next_due_date: nextDueStr,
      last_reviewed: new Date().toISOString(),
      graduation_source: 'mastered',
    })
    .eq('id', userProblemId)
    .eq('stage', up.stage)
    .select('id')
    .single();

  if (!updated) {
    revalidatePath('/today');
    return; // concurrent update; no-op
  }

  await supabase.from('reviews').insert({
    user_id: user.id,
    user_problem_id: userProblemId,
    rating: 'mastered',
    prev_stage: up.stage,
    next_stage: 5,
  });

  revalidatePath('/today');
  revalidatePath('/problems');
}
