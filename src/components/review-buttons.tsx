'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { reviewProblem } from '@/app/today/actions';
import type { Rating } from '@/lib/types';

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
      <Button
        variant="destructive"
        size="sm"
        className="flex-1 min-h-[44px]"
        onClick={() => handleReview('again')}
        disabled={isPending || submitted}
      >
        Again
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 min-h-[44px]"
        onClick={() => handleReview('good')}
        disabled={isPending || submitted}
      >
        Good
      </Button>
      <Button
        variant="default"
        size="sm"
        className="flex-1 min-h-[44px] bg-green-600 hover:bg-green-700 text-white"
        onClick={() => handleReview('easy')}
        disabled={isPending || submitted}
      >
        Easy
      </Button>
    </div>
  );
}
