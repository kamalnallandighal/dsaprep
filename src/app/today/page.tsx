import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ReviewButtons } from '@/components/review-buttons';
import { DifficultyBadge, StageIndicator } from '@/components/status-badge';
import { todayInTz } from '@/lib/date';
import type { Problem } from '@/lib/types';

const QUEUE_CAP = 15;

export default async function TodayPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('timezone').eq('user_id', user.id).single();
  const tz = profile?.timezone ?? 'America/Los_Angeles';
  const today = todayInTz(tz);

  const { data: dueRows } = await supabase
    .from('user_problems')
    .select('id, stage, added_at, problem_id, next_due_date, problems(*)')
    .eq('user_id', user.id)
    .eq('status', 'learning')
    .lte('next_due_date', today)
    .order('next_due_date', { ascending: true })
    .order('added_at', { ascending: true });

  type DueRow = {
    id: number; stage: number; added_at: string;
    problem_id: number; next_due_date: string; problems: Problem;
  };
  const allDue = (dueRows ?? []) as unknown as DueRow[];
  const totalDue = allDue.length;
  const visible = allDue.slice(0, QUEUE_CAP);
  const overflow = totalDue - visible.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground leading-none">
          Today
        </h1>
        {totalDue > 0 ? (
          <p className="text-sm text-muted-foreground mt-2 font-body">
            <span className="font-mono text-foreground">{totalDue}</span> problems due · work through them one at a time
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mt-2 font-body">Your review queue is empty</p>
        )}
      </div>

      {totalDue === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="font-display text-2xl font-bold text-foreground mb-1">All caught up.</p>
          <p className="text-sm text-muted-foreground mb-6 font-body">
            Nothing due today. Mark more problems solved to build your queue.
          </p>
          <Link
            href="/problems"
            className="text-sm font-medium text-primary hover:opacity-80 transition-opacity cursor-pointer font-body"
          >
            Browse problems →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((row) => (
            <div key={row.id} className="rounded-xl border border-border bg-card p-5 space-y-4 card-hover">
              {/* Title row */}
              <div className="flex items-start justify-between gap-3">
                <a
                  href={row.problems.leetcode_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display font-semibold text-base text-foreground hover:text-primary transition-colors leading-snug cursor-pointer"
                >
                  {row.problems.title}
                </a>
                <DifficultyBadge difficulty={row.problems.difficulty} />
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground font-body">{row.problems.topic}</span>
                <div className="flex items-center gap-2">
                  <StageIndicator stage={row.stage} />
                  <span className="text-xs font-mono text-muted-foreground">
                    stage {row.stage}
                  </span>
                </div>
              </div>

              <ReviewButtons userProblemId={row.id} />
            </div>
          ))}

          {overflow > 0 && (
            <p className="text-center text-xs text-muted-foreground font-mono py-2">
              +{overflow} more rolling over to tomorrow
            </p>
          )}
        </div>
      )}
    </div>
  );
}
