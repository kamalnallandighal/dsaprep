'use client';

import { useTransition } from 'react';
import { DifficultyBadge, StageIndicator } from '@/components/status-badge';
import { markSolved } from '@/app/problems/actions';
import { formatDate } from '@/lib/date';
import type { Problem, UserProblem } from '@/lib/types';
import { toast } from 'sonner';

type Props = {
  problem: Problem;
  userProblem?: UserProblem;
};

export function ProblemRow({ problem, userProblem }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleMarkSolved() {
    startTransition(async () => {
      await markSolved(problem.id);
      toast.success(`Tracking: ${problem.title}`);
    });
  }

  return (
    <div className="group flex items-center justify-between py-3 border-b border-border/60 last:border-0 gap-3 transition-colors hover:bg-muted/30 px-2 -mx-2 rounded-lg cursor-default">
      <div className="flex items-center gap-3 min-w-0">
        {/* Status dot */}
        <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${
          !userProblem ? 'bg-muted' :
          userProblem.status === 'graduated' ? 'bg-primary shadow-[0_0_6px_oklch(0.72_0.20_145/0.8)]' :
          'bg-sky-400 shadow-[0_0_6px_oklch(0.6_0.18_230/0.6)]'
        }`} />
        <a
          href={problem.leetcode_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate cursor-pointer"
        >
          {problem.title}
        </a>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {!userProblem && (
          <button
            onClick={handleMarkSolved}
            disabled={isPending}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-50 cursor-pointer min-h-[36px]"
          >
            {isPending ? '…' : 'Mark Solved'}
          </button>
        )}
        {userProblem && userProblem.status === 'learning' && (
          <div className="flex items-center gap-2">
            <StageIndicator stage={userProblem.stage} />
            <span className="text-xs text-muted-foreground font-mono hidden sm:block">
              due {formatDate(userProblem.next_due_date)}
            </span>
          </div>
        )}
        {userProblem && userProblem.status === 'graduated' && (
          <span className="text-xs text-primary font-medium flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
            </svg>
            {userProblem.graduation_source === 'mastered' ? 'Mastered' : 'Graduated'}
          </span>
        )}
      </div>
    </div>
  );
}
