export function DifficultyBadge({
  difficulty,
}: {
  difficulty: 'Easy' | 'Medium' | 'Hard';
}) {
  const styles = {
    Easy: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
    Hard: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium font-mono ${styles[difficulty]}`}>
      {difficulty}
    </span>
  );
}

export function StageIndicator({ stage }: { stage: number }) {
  return (
    <span className="flex gap-1 items-center" aria-label={`Stage ${stage} of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-all ${
            i < stage
              ? 'bg-primary shadow-[0_0_6px_oklch(0.72_0.20_145/0.8)]'
              : 'bg-muted'
          }`}
        />
      ))}
    </span>
  );
}
