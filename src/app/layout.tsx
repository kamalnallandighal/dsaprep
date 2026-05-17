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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background antialiased">
        {user && <Nav email={email} />}
        {user && <TimezoneSetter profileTz={profileTz} />}
        <main className="flex-1">{children}</main>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
