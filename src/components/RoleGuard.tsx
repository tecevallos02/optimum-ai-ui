'use client';
import { ReactNode } from 'react';
import { Role, isAtLeast } from '@/lib/roles';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

interface RoleGuardProps {
  allowed: Role | Role[];
  fallback?: ReactNode;
  children: ReactNode;
  requireAtLeast?: boolean; // If true, uses role hierarchy
}

export default function RoleGuard({ 
  allowed, 
  fallback = null, 
  children, 
  requireAtLeast = false 
}: RoleGuardProps) {
  const { data: session } = useSession();
  
  // Get current user data including role
  const { data: userData } = useSWR(
    session ? '/api/me' : null,
    (url: string) => fetch(url).then(res => res.json())
  );

  if (!session || !userData || !userData.role) {
    return <>{fallback}</>;
  }

  const userRole = userData.role;
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

  const hasPermission = requireAtLeast
    ? allowedRoles.some(role => isAtLeast(userRole, role))
    : allowedRoles.includes(userRole);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}
