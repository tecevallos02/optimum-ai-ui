"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      // Not authenticated, go to login
      router.replace("/login");
    } else if (session) {
      // Check if this is an admin user
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map(
        (email) => email.trim(),
      ) || ["goshawkai1@gmail.com"];
      
      if (adminEmails.includes(session.user?.email || "")) {
        // Admin user, redirect to admin dashboard
        router.replace("/admin");
      } else {
        // Regular user, go to CRM dashboard
        router.replace("/app");
      }
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
