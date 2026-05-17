import type { Stats } from '@/lib/types';

const statConfigs = [
  {
    key: 'solved' as const,
    label: 'Solved',
    sub: 'of 150 NeetCode',
    numColor: 'text-primary',
    glowColor: 'oklch(0.72 0.20 145 / 0.10)',
    borderColor: 'oklch(0.72 0.20 145 / 0.18)',
  },
  {
    key: 'tracking' as const,
    label: 'Tracking',
    sub: 'in review queue',
    numColor: 'text-sky-400',
    glowColor: 'oklch(0.60 0.18 230 / 0.10)',
    borderColor: 'oklch(0.60 0.18 230 / 0.18)',
  },
  {
    key: 'graduated' as const,
    label: 'Graduated',
    sub: 'long-term memory',
    numColor: 'text-violet-400',
    glowColor: 'oklch(0.60 0.22 280 / 0.10)',
    borderColor: 'oklch(0.60 0.22 280 / 0.18)',
  },
  {
    key: 'streak' as const,
    label: 'Streak',
    sub: (longest: number) => `longest: ${longest} days`,
    numColor: 'text-amber-400',
    glowColor: 'oklch(0.78 0.18 80 / 0.10)',
    borderColor: 'oklch(0.78 0.18 80 / 0.18)',
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
          className="rounded-xl bg-card p-5 transition-all"
          style={{
            border: `1px solid ${cfg.borderColor}`,
            boxShadow: `0 0 28px ${cfg.glowColor}`,
          }}
        >
          <p className={`font-display text-4xl font-bold leading-none tracking-tight ${cfg.numColor}`}>
            {values[cfg.key]}
          </p>
          <p className="text-sm font-medium text-foreground mt-2 font-body">{cfg.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5 font-body">
            {cfg.key === 'streak'
              ? (cfg.sub as (n: number) => string)(stats.streak.longest)
              : cfg.sub as string}
          </p>
        </div>
      ))}
    </div>
  );
}
