'use client';
import { ReactNode } from 'react';
import { Role } from '@/lib/roles';
import { useCurrentUser } from '@/lib/useCurrentUser';

interface RoleGuardProps {
  allowed: Role[];
  fallback?: ReactNode;
  children: ReactNode;
}

export default function RoleGuard({ allowed, fallback = null, children }: RoleGuardProps) {
  const { user } = useCurrentUser();
  if (!user) return null;
  return allowed.includes(user.role) ? <>{children}</> : <>{fallback}</>;
}
