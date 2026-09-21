import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import { AutoSync } from '@/components/AutoSync';

export const metadata: Metadata = {
  title: 'Lumen — your Study OS',
  description: 'Offline-first Study OS for university students.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AutoSync />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
