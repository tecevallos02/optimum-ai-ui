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
    <div className="min-h-screen flex bg-background dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-background dark:bg-gray-800 border-r border-border dark:border-gray-700">
        {/* Logo Header */}
        <div className="p-4 border-b border-border dark:border-gray-700">
          <div className="flex items-center">
            <Image
              src="/goshawk-ai-logo.png"
              alt="Goshawk AI"
              width={140}
              height={42}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <Link href="/app" className="group flex items-center px-3 py-3 text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-accent">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
            </svg>
            Dashboard
          </Link>
          <Link href="/app/calendar" className="group flex items-center px-3 py-3 text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-accent">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Calendar
          </Link>
          <Link href="/app/email" className="group flex items-center px-3 py-3 text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-accent">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </Link>
          <Link href="/app/savings" className="group flex items-center px-3 py-3 text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-accent">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Savings
          </Link>
          <Link href="/app/contacts" className="group flex items-center px-3 py-3 text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-accent">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Contacts
          </Link>
          <Link href="/app/calls" className="group flex items-center px-3 py-3 text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-accent">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Calls
          </Link>
          <Link href="/app/config" className="group flex items-center px-3 py-3 text-sm font-medium text-foreground hover:bg-accent/10 hover:text-accent transition-all duration-300 ease-in-out border-l-2 border-transparent hover:border-accent">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Config
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <header className="flex items-center justify-between p-4 border-b border-border dark:border-gray-700 bg-background dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
          {/* Organization Switcher */}
          <OrgSwitcherClient />

          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg group-hover:shadow-xl transition-all duration-300">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-foreground">{user?.email}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>
            
            {/* Role Badge */}
            <RoleGuard allowed={["OWNER", "MANAGER"]}>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-xs font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                {user?.role}
              </span>
            </RoleGuard>
            
            {/* Theme Toggle */}
            <ClientOnlyThemeToggle />
            
            {/* Logout */}
            <LogoutButton />
          </div>
        </header>
        <div className="p-4 bg-muted/30 dark:bg-gray-900 min-h-screen">{children}</div>
      </main>
    </div>
  );
}
