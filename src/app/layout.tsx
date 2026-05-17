import type { Metadata } from 'next';
import './globals.css';
import { createClient } from '@/lib/supabase/server';
import { Nav } from '@/components/nav';
import { TimezoneSetter } from '@/components/timezone-setter';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'DSA Prep',
  description: 'Spaced repetition for coding interview prep',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let email = '';
  let profileTz = 'America/Los_Angeles';

  if (user) {
    email = user.email ?? '';
    const { data: profile } = await supabase
      .from('profiles')
      .select('timezone')
      .eq('user_id', user.id)
      .single();
    if (profile?.timezone) profileTz = profile.timezone;
  }

  return (
    <html lang="en" className="h-full dark">
      <body className="min-h-full flex flex-col bg-background antialiased">
        {user && <Nav email={email} />}
        {user && <TimezoneSetter profileTz={profileTz} />}
        <main className="flex-1">{children}</main>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
