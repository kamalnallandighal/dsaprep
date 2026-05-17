'use client';

import { useState, useTransition } from 'react';
import { reviewProblem, markMastered } from '@/app/today/actions';
import type { Rating } from '@/lib/scheduler';

const buttons: { rating: Rating; label: string; style: string }[] = [
  {
    rating: 'again',
    label: 'Again',
    style:
      'bg-red-500/10 text-red-400 ring-1 ring-red-500/20 hover:bg-red-500/20 hover:ring-red-500/40',
  },
  {
    rating: 'good',
    label: 'Good',
    style:
      'bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20 hover:bg-sky-500/20 hover:ring-sky-500/40',
  },
  {
    rating: 'easy',
    label: 'Easy',
    style:
      'bg-primary/10 text-primary ring-1 ring-primary/20 hover:bg-primary/20 hover:ring-primary/40',
  },
];

type Props = {
  userProblemId: number;
  stage: number;
  status: 'learning' | 'graduated';
};

export function ReviewButtons({ userProblemId, stage, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  function handleReview(rating: Rating) {
    if (submitted) return;
    setSubmitted(true);
    startTransition(async () => {
      await reviewProblem(userProblemId, rating);
    });
  }

  function handleMastered() {
    if (submitted) return;
    setSubmitted(true);
    startTransition(async () => {
      await markMastered(userProblemId);
    });
  }

  const showMasteredLink = stage >= 2 && status === 'learning';

  return (
    <div className="space-y-2">
      <div className="flex gap-2 w-full">
        {buttons.map(({ rating, label, style }) => (
          <button
            key={rating}
            onClick={() => handleReview(rating)}
            disabled={isPending || submitted}
            className={`flex-1 min-h-[44px] rounded-lg text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${style}`}
          >
            {isPending && submitted ? '…' : label}
          </button>
        ))}
      </div>

      {showMasteredLink && (
        <div className="flex justify-center">
          <button
            onClick={handleMastered}
            disabled={isPending || submitted}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer py-1 px-2"
          >
            Mastered →
          </button>
        </div>
      )}
    </div>
  );
}
