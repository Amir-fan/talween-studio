
import { redirect } from 'next/navigation';

export default function PaymentPendingPage({ searchParams }: { searchParams: { orderId?: string } }) {
  const orderId = searchParams?.orderId;
  if (!orderId) {
    redirect('/packages');
  }
  // Server-side redirect straight to verification endpoint so the server
  // drives follow-up redirects to success/error.
  redirect(`/api/payment/verify?orderId=${encodeURIComponent(orderId as string)}`);
}


