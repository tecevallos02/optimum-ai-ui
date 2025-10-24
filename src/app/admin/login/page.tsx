"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

function AdminLoginContent() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new simple admin login
    console.log("🔄 Redirecting to simple admin login...");
    router.replace("/admin/simple-login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to admin login...</p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return <AdminLoginContent />;
}