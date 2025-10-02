// path: src/lib/auth.ts
import { Role } from "./roles";

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  orgId: string;
  role: Role;
};

// TEMP: always returns null until real auth is wired in
export async function getCurrentUser(): Promise<SessionUser | null> {
  return null;
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Role check stub – currently always false because no user
export async function hasRole(required: Role): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // TODO: replace with role hierarchy check later
  return user.role === required;
}
