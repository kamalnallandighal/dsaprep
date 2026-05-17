import type { Stats } from '@/lib/types';

const statConfigs = [
  {
    key: 'solved' as const,
    label: 'Solved',
    sub: 'of 150 NeetCode',
    color: 'text-primary',
    glow: 'shadow-[0_0_20px_oklch(0.72_0.20_145/0.12)]',
    accent: 'border-primary/20',
  },
  {
    key: 'tracking' as const,
    label: 'Tracking',
    sub: 'in review queue',
    color: 'text-sky-400',
    glow: 'shadow-[0_0_20px_oklch(0.6_0.18_230/0.12)]',
    accent: 'border-sky-500/20',
  },
  {
    key: 'graduated' as const,
    label: 'Graduated',
    sub: 'long-term memory',
    color: 'text-violet-400',
    glow: 'shadow-[0_0_20px_oklch(0.6_0.22_280/0.12)]',
    accent: 'border-violet-500/20',
  },
  {
    key: 'streak' as const,
    label: 'Streak',
    sub: (longest: number) => `longest: ${longest} days`,
    color: 'text-amber-400',
    glow: 'shadow-[0_0_20px_oklch(0.78_0.18_80/0.12)]',
    accent: 'border-amber-500/20',
  },
];

export function StatsHeader({ stats }: { stats: Stats }) {
  const values = {
    solved: stats.solved,
    tracking: stats.tracking,
    graduated: stats.graduated,
    streak: stats.streak.current,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {statConfigs.map((cfg) => (
        <div
          key={cfg.key}
          className={`rounded-xl border ${cfg.accent} bg-card p-4 transition-all hover:border-opacity-60 ${cfg.glow}`}
        >
          <p className={`text-3xl font-bold font-mono tracking-tight ${cfg.color}`}>
            {values[cfg.key]}
          </p>
          <p className="text-sm font-medium text-foreground mt-1">{cfg.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {cfg.key === 'streak'
              ? cfg.sub(stats.streak.longest)
              : cfg.sub as string}
          </p>
        </div>
      ))}
    </div>
  );
}
