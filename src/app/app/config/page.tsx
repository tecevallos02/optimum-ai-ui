"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import LogoUpload from "@/components/LogoUpload";
import PageTitle from "@/components/PageTitle";
import { useToast } from "@/components/Toast";

export default function ConfigPage() {
  const { showToast } = useToast();
  const { data: session } = useSession();
  const [currentOrg, setCurrentOrg] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ((session?.user as any)?.id) {
      fetchCurrentOrg();
    }
  }, [session]);

  const fetchCurrentOrg = async () => {
    try {
      const response = await fetch("/api/me");
      const userData = await response.json();

      if (userData.orgs && userData.orgs.length > 0) {
        // Get the current organization (you might want to get this from context)
        const org = userData.orgs[0]; // For now, just get the first one
        setCurrentOrg(org);
      }
    } catch (error) {
      console.error("Error fetching organization:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = async (logoUrl: string) => {
    if (!currentOrg) return;

    try {
      const response = await fetch(`/api/orgs/${currentOrg.id}/logo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logo: logoUrl }),
      });

      if (response.ok) {
        const updatedOrg = await response.json();
        setCurrentOrg(updatedOrg);
        showToast("Logo updated successfully!", "success");
        // You might want to refresh the organization switcher here
        window.location.reload(); // Simple refresh for now
      } else {
        showToast("Error updating logo. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error updating logo:", error);
      showToast("Error updating logo. Please try again.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-dark-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageTitle title="Configuration" />

      {/* Organization Settings */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-card border border-gray-100 dark:border-dark-border">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Organization Settings
        </h2>

        {currentOrg && (
          <LogoUpload
            currentLogo={currentOrg.logo}
            onLogoChange={handleLogoChange}
            organizationName={currentOrg.name}
          />
        )}
      </div>

      {/* Other Settings */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-card border border-gray-100 dark:border-dark-border">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Business Profile
        </h2>
        <p className="text-gray-600 dark:text-dark-text-secondary">
          This section allows you to edit business hours, holidays, routing
          rules, conversation settings and integrations. (TODO: implement forms
          and toggles)
        </p>
      </div>
    </div>
  );
}
