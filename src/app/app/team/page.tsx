import RoleGuard from "@/components/RoleGuard";

export default function TeamPage() {
  return (
    <RoleGuard
      allowed={["OWNER", "MANAGER"]}
      fallback={<p>You do not have access.</p>}
    >
      <div>
        <h1 className="text-2xl font-semibold mb-4">Team Management</h1>
        <p>
          Invite colleagues and manage their roles. (TODO: implement invites UI)
        </p>
      </div>
    </RoleGuard>
  );
}
