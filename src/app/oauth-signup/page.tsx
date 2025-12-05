"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { ToastProvider, useToast } from "@/components/Toast";

function OAuthSignupContent() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/app";

  useEffect(() => {
    // Get user session to extract OAuth info
    getSession().then((session) => {
      if (session?.user) {
        setUserInfo(session.user);
        setEmail(session.user.email || "");
        setFirstName(session.user.name?.split(" ")[0] || "");
        setLastName(session.user.name?.split(" ").slice(1).join(" ") || "");

        // Check if user already has an organization
        if (
          (session.user as any).orgs &&
          (session.user as any).orgs.length > 0
        ) {
          // User already has organization, redirect to app
          router.replace(callbackUrl);
        }
      } else {
        // If no session, redirect to signin
        router.replace("/signin");
      }
    });
  }, [router, callbackUrl]);

  const handleOAuthSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !organizationName) return;

    setIsLoading(true);
    try {
      // Create user account with OAuth info + organization
      const response = await fetch("/api/auth/oauth-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          organizationName,
          name: `${firstName} ${lastName}`,
          image: userInfo?.image,
        }),
      });

      if (response.ok) {
        // Redirect to app
        router.replace(callbackUrl);
      } else {
        const errorData = await response.json();
        showToast(
          `Error creating account: ${errorData.error || "Please try again."}`,
          "error"
        );
      }
    } catch (error) {
      console.error("OAuth signup error:", error);
      showToast("Error creating account. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We&apos;ve got your information from{" "}
            {userInfo.email?.includes("gmail") ? "Google" : "Microsoft"}. Just
            tell us about your organization.
          </p>
        </div>

        <div className="mt-8">
          {/* OAuth Info Display */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {userInfo.image ? (
                  <img
                    className="h-10 w-10 rounded-full"
                    src={userInfo.image}
                    alt="Profile"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Signed in with{" "}
                  {userInfo.email?.includes("gmail") ? "Google" : "Microsoft"}
                </h3>
                <p className="text-sm text-green-700">{userInfo.email}</p>
              </div>
            </div>
          </div>

          {/* Organization Form */}
          <form onSubmit={handleOAuthSignup} className="space-y-4">
            {/* Name Fields - Pre-filled but editable */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="First name"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Email Field - Pre-filled and read-only */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                disabled
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                This email is from your{" "}
                {userInfo.email?.includes("gmail") ? "Google" : "Microsoft"}{" "}
                account
              </p>
            </div>

            {/* Organization Name - Required */}
            <div>
              <label
                htmlFor="organizationName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Organization Name *
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                autoComplete="organization"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your organization name"
              />
              <p className="mt-1 text-xs text-gray-500">
                This will appear in the top-left corner and can be configured
                later
              </p>
            </div>

            <button
              type="submit"
              disabled={
                isLoading || !firstName || !lastName || !organizationName
              }
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Complete account setup"}
            </button>
          </form>
        </div>

        {/* Back to signin link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Want to use a different account?{" "}
            <Link
              href="/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Go back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OAuthSignupPage() {
  return (
    <ToastProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        <OAuthSignupContent />
      </Suspense>
    </ToastProvider>
  );
}
