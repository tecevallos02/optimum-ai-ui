"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { useSession } from "next-auth/react";
import OrgSwitcher from "@/components/OrgSwitcher";
import useSWR from "swr";

type Org = { id: string; name: string; role: string };

export default function OrgSwitcherClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Fetch user data including orgs and current org
  const { data: userData, mutate } = useSWR(
    session ? '/api/me' : null,
    (url: string) => fetch(url).then(res => res.json())
  );

  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

  useEffect(() => {
    if (userData?.currentOrgId) {
      setCurrentOrgId(userData.currentOrgId);
    }
  }, [userData]);

  if (!session || !userData || !userData.orgs || userData.orgs.length === 0) {
    return <div className="text-sm text-gray-500">No organizations</div>;
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
      orgs={userData.orgs}
      currentOrgId={effectiveCurrentOrgId}
      onChange={handleChange}
      disabled={isPending}
    />
  );
}

