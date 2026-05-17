'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
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
      toast(`Marked solved: ${problem.title}`);
    });
  }

  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <a
          href={problem.leetcode_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline truncate"
        >
          {problem.title}
        </a>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {!userProblem && (
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] text-xs"
            onClick={handleMarkSolved}
            disabled={isPending}
          >
            Mark Solved
          </Button>
        )}
        {userProblem && userProblem.status === 'learning' && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <StageIndicator stage={userProblem.stage} />
            <span>Stage {userProblem.stage} · due {formatDate(userProblem.next_due_date)}</span>
          </div>
        )}
        {userProblem && userProblem.status === 'graduated' && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            ✓ Graduated
          </span>
        )}
      </div>
    </div>
  );
}
