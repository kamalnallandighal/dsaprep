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
    id: number;
    stage: number;
    added_at: string;
    problem_id: number;
    next_due_date: string;
    problems: Problem;
  };
  const allDue = (dueRows ?? []) as unknown as DueRow[];

  const totalDue = allDue.length;
  const visible = allDue.slice(0, QUEUE_CAP);
  const overflow = totalDue - visible.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-xl font-semibold">Today</h1>
        {totalDue > 0 && (
          <span className="text-sm text-muted-foreground">{totalDue} due</span>
        )}
      </div>

      {totalDue === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-2">Nothing due today.</p>
          <Link href="/problems" className="text-sm underline">
            Go mark some problems solved →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((row) => (
            <div key={row.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={row.problems.leetcode_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-sm hover:underline"
                >
                  {row.problems.title}
                </a>
                <DifficultyBadge difficulty={row.problems.difficulty} />
              </div>
              <p className="text-xs text-muted-foreground">{row.problems.topic}</p>
              <StageIndicator stage={row.stage} />
              <ReviewButtons userProblemId={row.id} />
            </div>
          ))}

          {overflow > 0 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              {overflow} more due, rolling over to tomorrow
            </p>
          )}
        </div>
      )}
    </div>
  );
}
