import { fetcher } from "@/lib/fetcher";

export default async function BillingPage() {
  const res = await fetcher<{ url: string }>("/api/billing/portal");

  if (!res || !res.url) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-4">Billing</h1>
        <p className="text-red-500">Failed to load billing portal link.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Billing</h1>
      <p>Your current plan usage and invoices will appear here. (Mock data)</p>
      <a
        href={res.url}
        className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-full shadow hover:shadow-lg"
      >
        Manage in Stripe
      </a>
    </div>
  );
}
