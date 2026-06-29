'use client';

import { AuthProvider } from '@/lib/AuthProvider';
import { useAuth } from '@/lib/AuthProvider';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

export { useAuth };
