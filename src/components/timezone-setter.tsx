'use client';

import { useEffect } from 'react';
import { setTimezone } from '@/app/problems/actions';

export function TimezoneSetter({ profileTz }: { profileTz: string }) {
  useEffect(() => {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (browserTz && browserTz !== profileTz) {
      setTimezone(browserTz).catch(() => {});
    }
  }, [profileTz]);

  return null;
}
