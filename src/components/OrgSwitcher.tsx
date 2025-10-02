// path: src/components/OrgSwitcher.tsx
"use client";

type Org = { id: string; name: string };

export default function OrgSwitcher({
  orgs,
  currentOrgId,
  onChange,
  disabled,
}: {
  orgs: Org[];
  currentOrgId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mr-2">Organization</span>
      <select
        className="rounded-md border px-2 py-1"
        value={currentOrgId}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {orgs.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}
