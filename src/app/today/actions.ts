'use server';

import { createClient } from '@/lib/supabase/server';
import { applyReview, type Rating } from '@/lib/scheduler';
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
    .select('id, stage, user_id')
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

  const result = applyReview(up.stage, rating);
  const nextDueStr = addDaysToTzDate(tz, result.daysUntilDue);

  const { data: updated } = await supabase
    .from('user_problems')
    .update({
      stage: result.nextStage,
      status: result.status,
      next_due_date: nextDueStr,
      last_reviewed: new Date().toISOString(),
    })
    .eq('id', userProblemId)
    .eq('stage', up.stage)
    .select('id')
    .single();

  if (!updated) {
    revalidatePath('/today');
    return;
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
