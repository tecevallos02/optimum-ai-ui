export type Role = "OWNER" | "MANAGER" | "AGENT";

export function isAtLeast(role: Role, required: Role): boolean {
  const hierarchy: Record<Role, number> = { OWNER: 3, MANAGER: 2, AGENT: 1 };
  return hierarchy[role] >= hierarchy[required];
}
