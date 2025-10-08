"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import OrgSwitcher from "@/components/OrgSwitcher";
import useSWR from "swr";

// type Org = { id: string; name: string; role: string };

export default function OrgSwitcherClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  
  // Fetch user data including orgs and current org
  const { data: userData, mutate } = useSWR(
    session ? '/api/me' : null,
    async (url: string) => {
      const response = await fetch(url);
      const data = await response.json();
      
      // If no organizations found, try to refresh
      if (data && (!data.orgs || data.orgs.length === 0)) {
        console.log('No organizations found, attempting to refresh...');
        try {
          const refreshResponse = await fetch('/api/refresh-orgs', { method: 'POST' });
          const refreshData = await refreshResponse.json();
          if (refreshData.success && refreshData.orgs.length > 0) {
            console.log('Refreshed organizations:', refreshData.orgs);
            return {
              ...data,
              orgs: refreshData.orgs,
              currentOrgId: refreshData.currentOrgId,
              role: refreshData.role
            };
          }
        } catch (error) {
          console.error('Error refreshing organizations:', error);
        }
      }
      
      return data;
    },
    {
      refreshInterval: 5000, // Refresh every 5 seconds to catch new organizations
      revalidateOnFocus: true,
    }
  );

  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (userData?.currentOrgId) {
      setCurrentOrgId(userData.currentOrgId);
    }
  }, [userData]);

  // Show loading state while session is loading
  if (status === 'loading') {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }
  
  // Don't show anything if not authenticated
  if (status === 'unauthenticated' || !session) {
    return null;
  }

  if (!userData) {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (!userData.orgs || userData.orgs.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No organizations found. 
        <button 
          onClick={() => mutate()} 
          className="ml-2 text-blue-600 hover:text-blue-800 underline"
        >
          Refresh
        </button>
      </div>
    );
  }

  // If no current org is set, use the first org
  const effectiveCurrentOrgId = currentOrgId || userData.orgs[0]?.id;

  if (!effectiveCurrentOrgId) {
    return <div className="text-sm text-gray-500">No organization selected</div>;
  }

  const handleChange = async (id: string) => {
    setCurrentOrgId(id);
    
    try {
      // Switch organization on server
      const response = await fetch(`/api/orgs/${id}/switch`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Refresh user data and page
        await mutate();
        startTransition(() => router.refresh());
      } else {
        // Revert on error
        setCurrentOrgId(userData.currentOrgId);
        console.error('Failed to switch organization');
      }
    } catch (error) {
      // Revert on error
      setCurrentOrgId(userData.currentOrgId);
      console.error('Error switching organization:', error);
    }
  };

  return (
    <OrgSwitcher
      orgs={userData.orgs.map((org: any) => ({
        id: org.id,
        name: org.name,
        role: org.role,
        logo: org.logo
      }))}
      currentOrgId={effectiveCurrentOrgId}
      onChange={handleChange}
      disabled={isPending}
    />
  );
}

