import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lumen — your Study OS',
  description: 'Offline-first Study OS for university students.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
