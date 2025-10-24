"use client";

import Link from "next/link";

export default function AdminTestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Admin Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          This page should load without redirects
        </p>
        <div className="space-y-2">
          <Link
            href="/admin/login"
            className="block text-blue-600 hover:text-blue-800"
          >
            Go to Admin Login
          </Link>
          <Link
            href="/admin"
            className="block text-blue-600 hover:text-blue-800"
          >
            Go to Admin Dashboard
          </Link>
          <Link href="/" className="block text-blue-600 hover:text-blue-800">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
