import '@/app/globals.css';
import type { ReactNode } from 'react';
import { SessionProvider } from './SessionProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Goshawk AI',
  description: 'AI-powered business intelligence and analytics platform',
  icons: {
    icon: '/Goshawkai-Favicon.PNG',
    shortcut: '/Goshawkai-Favicon.PNG',
    apple: '/Goshawkai-Favicon.PNG',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-bg text-text font-sans antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
