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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('timezone').eq('user_id', user.id).single();
  const tz = profile?.timezone ?? 'America/Los_Angeles';

  const [{ data: problems }, { data: userProblems }, { data: reviews }] = await Promise.all([
    supabase.from('problems').select('*').order('topic_order', { ascending: true }).order('id', { ascending: true }),
    supabase.from('user_problems').select('*').eq('user_id', user.id),
    supabase.from('reviews').select('reviewed_at').eq('user_id', user.id),
  ]);

  const problemsList = (problems ?? []) as Problem[];
  const userProblemsList = (userProblems ?? []) as UserProblem[];

  const solved = userProblemsList.length;
  const tracking = userProblemsList.filter(up => up.status === 'learning').length;
  const graduated = userProblemsList.filter(up => up.status === 'graduated').length;

  const activityDates: string[] = [];
  for (const up of userProblemsList)
    activityDates.push(formatInTimeZone(new Date(up.first_solved_at), tz, 'yyyy-MM-dd'));
  for (const r of reviews ?? [])
    activityDates.push(formatInTimeZone(new Date(r.reviewed_at), tz, 'yyyy-MM-dd'));

  const streak = computeStreak(activityDates, todayInTz(tz));
  const stats: Stats = { solved, tracking, graduated, streak };

  const upByProblemId = new Map<number, UserProblem>();
  for (const up of userProblemsList) upByProblemId.set(up.problem_id, up);

  const topicMap = new Map<string, { order: number; problems: Problem[] }>();
  for (const p of problemsList) {
    if (!topicMap.has(p.topic)) topicMap.set(p.topic, { order: p.topic_order, problems: [] });
    topicMap.get(p.topic)!.problems.push(p);
  }
  const topics = Array.from(topicMap.entries()).sort(([, a], [, b]) => a.order - b.order);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground leading-none">
            Problems
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-body">
            NeetCode 150 · sorted by topic · {solved} solved
          </p>
        </div>
        <AddCustomProblemDialog />
      </div>

      {/* Stats */}
      <StatsHeader stats={stats} />

      {/* Problem list */}
      <div className="space-y-6">
        {topics.map(([topic, { problems: topicProblems }], idx) => {
          const solvedInTopic = topicProblems.filter(p => upByProblemId.has(p.id)).length;
          const pct = Math.round((solvedInTopic / topicProblems.length) * 100);

          return (
            <section key={topic}>
              {/* Topic header */}
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs text-muted-foreground w-5 text-right shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h2 className="font-display text-base font-semibold text-foreground leading-none">
                  {topic}
                </h2>
                <div className="flex-1 h-px bg-border" />
                {pct > 0 && (
                  <div className="w-16 h-1 rounded-full bg-muted overflow-hidden shrink-0">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${pct}%`,
                        boxShadow: '0 0 6px oklch(0.72 0.20 145 / 0.6)',
                      }}
                    />
                  </div>
                )}
                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  {solvedInTopic}/{topicProblems.length}
                </span>
              </div>

              <div className="rounded-xl border border-border bg-card px-4 py-1">
                {topicProblems.map(p => (
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
