import { Inter } from 'next/font/google';
import { SessionProvider } from '../SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Goshawk AI - Admin Panel',
  description: 'Admin panel for managing Goshawk AI clients',
  icons: {
    icon: '/Goshawkai-Favicon.PNG',
    shortcut: '/Goshawkai-Favicon.PNG',
    apple: '/Goshawkai-Favicon.PNG',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
