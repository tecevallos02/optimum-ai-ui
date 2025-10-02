import '@/app/globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-bg text-text font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
