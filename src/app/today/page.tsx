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
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Today</h1>
          {totalDue > 0 && (
            <span className="text-sm font-mono text-muted-foreground">
              {totalDue} due
            </span>
          )}
        </div>
        {totalDue > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            Work through your review queue — take it one at a time.
          </p>
        )}
      </div>

      {totalDue === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-primary/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-primary" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">All caught up!</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Nothing due today. Keep the streak alive by marking more problems solved.
          </p>
          <Link
            href="/problems"
            className="text-sm font-medium text-primary hover:opacity-80 transition-opacity cursor-pointer"
          >
            Browse problems →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((row, i) => (
            <div
              key={row.id}
              className="rounded-xl border border-border bg-card p-5 space-y-4 card-hover"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Problem title + badge */}
              <div className="flex items-start justify-between gap-3">
                <a
                  href={row.problems.leetcode_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sm text-foreground hover:text-primary transition-colors leading-snug cursor-pointer"
                >
                  {row.problems.title}
                </a>
                <DifficultyBadge difficulty={row.problems.difficulty} />
              </div>

              {/* Topic + stage */}
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">{row.problems.topic}</span>
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
            <div className="text-center py-3">
              <p className="text-sm text-muted-foreground font-mono">
                +{overflow} more rolling over to tomorrow
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
