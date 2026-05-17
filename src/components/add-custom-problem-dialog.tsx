'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addCustomProblem } from '@/app/problems/actions';
import { toast } from 'sonner';

export function AddCustomProblemDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | ''>('');
  const [topic, setTopic] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isPending, startTransition] = useTransition();

  function reset() {
    setUrl('');
    setTitle('');
    setDifficulty('');
    setTopic('');
    setUrlError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!difficulty) return;

    setUrlError('');
    startTransition(async () => {
      try {
        await addCustomProblem({
          url,
          title: title || undefined,
          difficulty,
          topic: topic || undefined,
        });
        const displayTitle = title || url.split('/problems/')[1]?.replace(/\/$/, '') || url;
        toast(`Added: ${displayTitle}`);
        setOpen(false);
        reset();
      } catch (err) {
        if (err instanceof Error && err.message.includes('Invalid LeetCode URL')) {
          setUrlError('Must be a valid LeetCode problem URL');
        } else {
          setUrlError('Something went wrong. Try again.');
        }
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger
        render={<Button variant="outline" size="sm" className="min-h-[44px]" />}
      >
        Add Custom Problem
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Custom Problem</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="url">LeetCode URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://leetcode.com/problems/two-sum/"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setUrlError(''); }}
              required
            />
            {urlError && <p className="text-xs text-destructive">{urlError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Auto-generated from URL if blank"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty *</Label>
            <Select
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as 'Easy' | 'Medium' | 'Hard')}
              required
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic (optional)</Label>
            <Input
              id="topic"
              placeholder='Defaults to "Custom"'
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => { setOpen(false); reset(); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending || !difficulty}
            >
              {isPending ? 'Adding…' : 'Add Problem'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
