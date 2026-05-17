'use client';

import { useState, useTransition } from 'react';
import { reviewProblem } from '@/app/today/actions';
import type { Rating } from '@/lib/types';

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

export function ReviewButtons({ userProblemId }: { userProblemId: number }) {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  function handleReview(rating: Rating) {
    if (submitted) return;
    setSubmitted(true);
    startTransition(async () => {
      await reviewProblem(userProblemId, rating);
    });
  }

  return (
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
  );
}
