// path: src/components/OrgSwitcherClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import OrgSwitcher from "@/components/OrgSwitcher";

type Org = { id: string; name: string };

export default function OrgSwitcherClient({
  orgs,
  currentOrgId,
}: {
  orgs: Org[];
  currentOrgId: string;
}) {
  const [orgId, setOrgId] = useState(currentOrgId);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleChange = (id: string) => {
    setOrgId(id);
    // Example persistence; replace with a server action if you prefer
    document.cookie = `orgId=${encodeURIComponent(id)}; path=/; SameSite=Lax`;
    startTransition(() => router.refresh()); // refresh Server Components with new cookie
  };

  return (
    <OrgSwitcher
      orgs={orgs}
      currentOrgId={orgId}
      onChange={handleChange}
      disabled={isPending}
    />
  );
}

