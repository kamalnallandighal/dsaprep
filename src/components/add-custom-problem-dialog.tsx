'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { addCustomProblem } from '@/app/problems/actions';
import { toast } from 'sonner';

const inputCls =
  'w-full rounded-lg border border-border bg-muted px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all';

export function AddCustomProblemDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | ''>('');
  const [topic, setTopic] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isPending, startTransition] = useTransition();

  function reset() {
    setUrl(''); setTitle(''); setDifficulty(''); setTopic(''); setUrlError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!difficulty) return;
    setUrlError('');
    startTransition(async () => {
      try {
        await addCustomProblem({ url, title: title || undefined, difficulty, topic: topic || undefined });
        const display = title || url.split('/problems/')[1]?.replace(/\/$/, '') || url;
        toast.success(`Added: ${display}`);
        setOpen(false);
        reset();
      } catch (err) {
        setUrlError(err instanceof Error && err.message.includes('Invalid')
          ? 'Must be a valid LeetCode problem URL'
          : 'Something went wrong. Try again.');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger
        render={
          <button className="text-sm font-medium px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer min-h-[40px]" />
        }
      >
        + Add Problem
      </DialogTrigger>

      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Add Custom Problem</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">LeetCode URL *</label>
            <input
              type="url"
              placeholder="https://leetcode.com/problems/two-sum/"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
              required
              className={inputCls}
            />
            {urlError && <p className="text-xs text-destructive">{urlError}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title <span className="normal-case">(optional)</span></label>
            <input
              type="text"
              placeholder="Auto-generated from URL"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Difficulty *</label>
            <div className="flex gap-2">
              {(['Easy', 'Medium', 'Hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                    difficulty === d
                      ? d === 'Easy' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : d === 'Medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-red-500/15 text-red-400 border-red-500/30'
                      : 'border-border text-muted-foreground hover:border-foreground/20'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Topic <span className="normal-case">(optional)</span></label>
            <input
              type="text"
              placeholder='Defaults to "Custom"'
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={inputCls}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setOpen(false); reset(); }}
              className="flex-1 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !difficulty}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? 'Adding…' : 'Add Problem'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
