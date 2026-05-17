'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Nav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <nav className="border-b">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-sm">DSA Prep</span>
          <Link
            href="/today"
            className={cn(
              'text-sm transition-colors hover:text-foreground',
              pathname === '/today'
                ? 'text-foreground font-medium'
                : 'text-muted-foreground'
            )}
          >
            Today
          </Link>
          <Link
            href="/problems"
            className={cn(
              'text-sm transition-colors hover:text-foreground',
              pathname === '/problems'
                ? 'text-foreground font-medium'
                : 'text-muted-foreground'
            )}
          >
            Problems
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[160px]">
            {email}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
