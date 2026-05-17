import { Card, CardContent } from '@/components/ui/card';
import type { Stats } from '@/lib/types';

export function StatsHeader({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card>
        <CardContent className="pt-4 pb-4">
          <p className="text-3xl font-bold">{stats.solved}</p>
          <p className="text-sm text-muted-foreground">Solved</p>
          <p className="text-xs text-muted-foreground">of 150 NeetCode</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-4">
          <p className="text-3xl font-bold">{stats.tracking}</p>
          <p className="text-sm text-muted-foreground">Tracking</p>
          <p className="text-xs text-muted-foreground">in review queue</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-4">
          <p className="text-3xl font-bold">{stats.graduated}</p>
          <p className="text-sm text-muted-foreground">Graduated</p>
          <p className="text-xs text-muted-foreground">long-term memory</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4 pb-4">
          <p className="text-3xl font-bold">{stats.streak.current}</p>
          <p className="text-sm text-muted-foreground">Streak</p>
          <p className="text-xs text-muted-foreground">
            longest: {stats.streak.longest} days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
