import { Badge } from '@/components/ui/badge';

export function DifficultyBadge({
  difficulty,
}: {
  difficulty: 'Easy' | 'Medium' | 'Hard';
}) {
  const colors = {
    Easy: 'bg-green-100 text-green-800 hover:bg-green-100',
    Medium: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
    Hard: 'bg-red-100 text-red-800 hover:bg-red-100',
  };
  return (
    <Badge variant="secondary" className={colors[difficulty]}>
      {difficulty}
    </Badge>
  );
}

export function StageIndicator({ stage }: { stage: number }) {
  return (
    <span className="flex gap-1 items-center" aria-label={`Stage ${stage}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={
            i < stage
              ? 'text-primary text-base leading-none'
              : 'text-muted-foreground text-base leading-none'
          }
        >
          {i < stage ? '●' : '○'}
        </span>
      ))}
    </span>
  );
}
