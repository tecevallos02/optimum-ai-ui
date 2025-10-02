import { fetcher } from '@/lib/fetcher';

export default async function BillingPage() {
  const { url } = await fetcher<{ url: string }>('/api/billing/portal');
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Billing</h1>
      <p>Your current plan usage and invoices will appear here. (Mock data)</p>
      <a
        href={url}
        className="mt-4 inline-block bg-primary text-white px-4 py-2 rounded-full shadow hover:shadow-lg"
      >
        Manage in Stripe
      </a>
    </div>
  );
}
