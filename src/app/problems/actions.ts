'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { tomorrowInTz } from '@/lib/date';
import { parseLeetCodeUrl } from '@/lib/leetcode';

async function getUserAndTz() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('user_id', user.id)
    .single();
  return {
    supabase,
    user,
    tz: profile?.timezone ?? 'America/Los_Angeles',
  };
}

export async function markSolved(problemId: number) {
  const { supabase, user, tz } = await getUserAndTz();
  await supabase.from('user_problems').upsert(
    {
      user_id: user.id,
      problem_id: problemId,
      stage: 0,
      status: 'learning',
      next_due_date: tomorrowInTz(tz),
    },
    { onConflict: 'user_id,problem_id', ignoreDuplicates: true }
  );
  revalidatePath('/problems');
  revalidatePath('/today');
}

export async function addCustomProblem(input: {
  url: string;
  title?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic?: string;
}) {
  const parsed = parseLeetCodeUrl(input.url);
  if (!parsed) throw new Error('Invalid LeetCode URL');

  const { supabase, user, tz } = await getUserAndTz();

  const { data: existing } = await supabase
    .from('problems')
    .select('id')
    .eq('slug', parsed.slug)
    .maybeSingle();

  let problemId: number;
  if (existing) {
    problemId = existing.id;
  } else {
    const { data: inserted, error } = await supabase
      .from('problems')
      .insert({
        slug: parsed.slug,
        title: input.title?.trim() || parsed.titleGuess,
        leetcode_url: `https://leetcode.com/problems/${parsed.slug}/`,
        topic: input.topic?.trim() || 'Custom',
        topic_order: 99,
        difficulty: input.difficulty,
        source: 'custom',
        created_by: user.id,
      })
      .select('id')
      .single();
    if (error || !inserted) throw new Error('Failed to create problem');
    problemId = inserted.id;
  }

  await supabase.from('user_problems').upsert(
    {
      user_id: user.id,
      problem_id: problemId,
      stage: 0,
      status: 'learning',
      next_due_date: tomorrowInTz(tz),
    },
    { onConflict: 'user_id,problem_id', ignoreDuplicates: true }
  );

  revalidatePath('/problems');
  revalidatePath('/today');
}

export async function setTimezone(timezone: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('profiles').update({ timezone }).eq('user_id', user.id);
}
