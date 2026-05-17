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
        {/* Left: brand + links */}
        <div className="flex items-center gap-6">
          <Link href="/today" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center transition-all group-hover:shadow-[0_0_12px_oklch(0.72_0.20_145/0.5)]">
              <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-primary-foreground" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span className="font-bold text-sm tracking-tight">DSA Prep</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/today"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                pathname === '/today'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Today
            </Link>
            <Link
              href="/problems"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
                pathname === '/problems'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Problems
            </Link>
          </div>
        </div>

        {/* Right: email + logout */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-muted-foreground font-mono truncate max-w-[180px]">
            {email}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20 rounded-md px-3 py-1.5 transition-all cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
