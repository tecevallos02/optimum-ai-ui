import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '../SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Optimum AI - Admin Panel',
  description: 'Admin panel for managing Optimum AI clients',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
