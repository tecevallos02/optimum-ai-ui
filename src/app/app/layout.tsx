// path: src/app/app/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import RoleGuard from "@/components/RoleGuard";
import OrgSwitcherClient from "@/components/OrgSwitcherClient"; // <- client wrapper
import LogoutButton from "../../components/LogoutButton";
import ClientOnlyThemeToggle from "@/components/ClientOnlyThemeToggle";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex bg-bg dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:block w-60 bg-white dark:bg-gray-800 border-r border-border dark:border-gray-700">
        <div className="p-2">
          <Image
            src="/goshawk-ai-logo.png"
            alt="Goshawk AI"
            width={180}
            height={54}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        <div className="px-4 pb-4">
        <nav className="space-y-1">
          <Link href="/app" className="block p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm text-gray-900 dark:text-gray-100">Dashboard</Link>
          <Link href="/app/calendar" className="block p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm text-gray-900 dark:text-gray-100">Calendar</Link>
          <Link href="/app/email" className="block p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm text-gray-900 dark:text-gray-100">Email</Link>
          <Link href="/app/savings" className="block p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm text-gray-900 dark:text-gray-100">Savings</Link>
          <Link href="/app/contacts" className="block p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm text-gray-900 dark:text-gray-100">Contacts</Link>
          <Link href="/app/calls" className="block p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm text-gray-900 dark:text-gray-100">Calls</Link>
          <Link href="/app/config" className="block p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm text-gray-900 dark:text-gray-100">Config</Link>
        </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
          {/* OrgSwitcherClient now fetches its own data */}
          <OrgSwitcherClient />

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{user?.email}</span>
            </div>
            <RoleGuard allowed={["OWNER", "MANAGER"]}>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                {user?.role}
              </span>
            </RoleGuard>
            <ClientOnlyThemeToggle />
            <LogoutButton />
          </div>
        </header>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">{children}</div>
      </main>
    </div>
  );
}
