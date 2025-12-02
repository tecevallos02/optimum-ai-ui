// path: src/app/app/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
// Removed RoleGuard - no roles in USER stack
// Removed OrgSwitcherClient - no company selector in USER stack
import LogoutButton from "../../components/LogoutButton";
import ClientOnlyThemeToggle from "@/components/ClientOnlyThemeToggle";
import PhoneSelector from "@/components/PhoneSelector";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex bg-background dark:bg-black">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-background dark:bg-dark-card border-r border-border dark:border-dark-border">
        {/* Logo Header */}
        <div className="p-4 border-b border-border dark:border-dark-border">
          <div className="flex items-center">
            {user?.company ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user.company.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {user.company.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-dark-text-secondary">
                    Powered by Goshawk AI
                  </div>
                </div>
              </div>
            ) : (
              <Image
                src="/goshawk-ai-logo.png"
                alt="Goshawk AI"
                width={140}
                height={42}
                className="h-10 w-auto object-contain"
                priority
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <Link
            href="/app"
            className="group flex items-center px-3 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-dark-hover hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-blue-500"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"
              />
            </svg>
            Dashboard
          </Link>
          <Link
            href="/app/calendar"
            className="group flex items-center px-3 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-dark-hover hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-blue-500"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Calendar
          </Link>
          <Link
            href="/app/email"
            className="group flex items-center px-3 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-dark-hover hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-blue-500"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email
          </Link>
          <Link
            href="/app/savings"
            className="group flex items-center px-3 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-dark-hover hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-blue-500"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            Savings
          </Link>
          <Link
            href="/app/contacts"
            className="group flex items-center px-3 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-dark-hover hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-blue-500"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Contacts
          </Link>
          <Link
            href="/app/calls"
            className="group flex items-center px-3 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-dark-hover hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-blue-500"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Call Logs
          </Link>
          <Link
            href="/app/config"
            className="group flex items-center px-3 py-3 text-sm font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-dark-hover hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-blue-500"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Config
          </Link>
          {/* Admin link removed - admin is separate stack */}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <header className="flex items-center justify-between p-4 border-b border-border dark:border-dark-border bg-background dark:bg-black sticky top-0 z-10 shadow-sm">
          <div className="flex items-center space-x-6">
            {/* Phone Selector - only shows if multiple phones */}
            <PhoneSelector />
          </div>

          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg group-hover:shadow-xl transition-all duration-300">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.email}
                </div>
                <div className="text-xs text-gray-600 dark:text-dark-text-secondary">
                  Active
                </div>
              </div>
            </div>

            {/* Company Badge */}
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
              {user?.company?.name || "User"}
            </span>

            {/* Theme Toggle */}
            <ClientOnlyThemeToggle />

            {/* Logout */}
            <LogoutButton />
          </div>
        </header>
        <div className="p-4 bg-muted/30 dark:bg-black min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
