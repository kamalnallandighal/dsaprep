'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/today" className="font-display font-bold text-base tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer">
            DSA Prep
          </Link>
          <div className="flex items-center gap-0.5">
            <Link
              href="/today"
              className={`px-3 py-1.5 rounded-md text-sm transition-all cursor-pointer font-body ${
                pathname === '/today'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Today
            </Link>
            <Link
              href="/problems"
              className={`px-3 py-1.5 rounded-md text-sm transition-all cursor-pointer font-body ${
                pathname === '/problems'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Problems
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-muted-foreground font-mono truncate max-w-[180px]">
            {email}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20 rounded-md px-3 py-1.5 transition-all cursor-pointer font-body"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
