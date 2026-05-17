import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { StatsHeader } from '@/components/stats-header';
import { ProblemRow } from '@/components/problem-row';
import { AddCustomProblemDialog } from '@/components/add-custom-problem-dialog';
import { computeStreak } from '@/lib/stats';
import { todayInTz } from '@/lib/date';
import { formatInTimeZone } from 'date-fns-tz';
import type { Problem, UserProblem, Stats } from '@/lib/types';

export default async function ProblemsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('user_id', user.id)
    .single();
  const tz = profile?.timezone ?? 'America/Los_Angeles';

  const [{ data: problems }, { data: userProblems }, { data: reviews }] =
    await Promise.all([
      supabase
        .from('problems')
        .select('*')
        .order('topic_order', { ascending: true })
        .order('id', { ascending: true }),
      supabase
        .from('user_problems')
        .select('*')
        .eq('user_id', user.id),
      supabase
        .from('reviews')
        .select('reviewed_at')
        .eq('user_id', user.id),
    ]);

  const problemsList = (problems ?? []) as Problem[];
  const userProblemsList = (userProblems ?? []) as UserProblem[];

  // Build stats
  const solved = userProblemsList.length;
  const tracking = userProblemsList.filter((up) => up.status === 'learning').length;
  const graduated = userProblemsList.filter((up) => up.status === 'graduated').length;

  // Streak
  const activityDates: string[] = [];
  for (const up of userProblemsList) {
    activityDates.push(formatInTimeZone(new Date(up.first_solved_at), tz, 'yyyy-MM-dd'));
  }
  for (const r of reviews ?? []) {
    activityDates.push(formatInTimeZone(new Date(r.reviewed_at), tz, 'yyyy-MM-dd'));
  }
  const streak = computeStreak(activityDates, todayInTz(tz));

  const stats: Stats = { solved, tracking, graduated, streak };

  // Map userProblems by problem_id
  const upByProblemId = new Map<number, UserProblem>();
  for (const up of userProblemsList) {
    upByProblemId.set(up.problem_id, up);
  }

  // Group problems by topic
  const topicMap = new Map<string, { order: number; problems: Problem[] }>();
  for (const p of problemsList) {
    if (!topicMap.has(p.topic)) {
      topicMap.set(p.topic, { order: p.topic_order, problems: [] });
    }
    topicMap.get(p.topic)!.problems.push(p);
  }
  const topics = Array.from(topicMap.entries()).sort(
    ([, a], [, b]) => a.order - b.order
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <StatsHeader stats={stats} />

      <div className="flex justify-end">
        <AddCustomProblemDialog />
      </div>

      <div className="space-y-8">
        {topics.map(([topic, { problems: topicProblems }]) => {
          const solvedInTopic = topicProblems.filter((p) =>
            upByProblemId.has(p.id)
          ).length;
          return (
            <section key={topic}>
              <h2 className="text-base font-semibold mb-3">
                {topic}{' '}
                <span className="text-muted-foreground font-normal text-sm">
                  ({solvedInTopic}/{topicProblems.length} solved)
                </span>
              </h2>
              <div>
                {topicProblems.map((p) => (
                  <ProblemRow
                    key={p.id}
                    problem={p}
                    userProblem={upByProblemId.get(p.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
