// path: src/app/app/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import RoleGuard from "@/components/RoleGuard";
import OrgSwitcherClient from "@/components/OrgSwitcherClient"; // <- client wrapper

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar */}
      <aside className="hidden md:block w-60 bg-white border-r border-border p-4">
        <h2 className="text-xl font-bold mb-4">Optimum AI</h2>
        <nav className="space-y-2">
          <Link href="/app" className="block p-2 rounded hover:bg-bg">Dashboard</Link>
          <Link href="/app/calls" className="block p-2 rounded hover:bg-bg">Calls</Link>
          <Link href="/app/calendar" className="block p-2 rounded hover:bg-bg">Calendar</Link>
          <Link href="/app/savings" className="block p-2 rounded hover:bg-bg">Savings</Link>
          <Link href="/app/contacts" className="block p-2 rounded hover:bg-bg">Contacts</Link>
          <Link href="/app/config" className="block p-2 rounded hover:bg-bg">Config</Link>
          <RoleGuard allowed={["OWNER", "MANAGER"]}>
            <Link href="/app/billing" className="block p-2 rounded hover:bg-bg">Billing</Link>
          </RoleGuard>
          <RoleGuard allowed={["OWNER", "MANAGER"]}>
            <Link href="/app/team" className="block p-2 rounded hover:bg-bg">Team</Link>
          </RoleGuard>
          <Link href="/app/audit" className="block p-2 rounded hover:bg-bg">Audit</Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <header className="flex items-center justify-between p-4 border-b border-border bg-white sticky top-0 z-10">
          {/* OrgSwitcherClient now fetches its own data */}
          <OrgSwitcherClient />

          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted">{user?.email}</span>
            <RoleGuard allowed={["OWNER", "MANAGER"]}>
              <span className="px-2 py-1 bg-primary text-white rounded-full text-xs">
                {user?.role}
              </span>
            </RoleGuard>
          </div>
        </header>
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
