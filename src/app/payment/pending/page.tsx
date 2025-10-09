
import { redirect } from 'next/navigation';

export default function PaymentPendingPage({ searchParams }: { searchParams: { orderId?: string; amount?: string; credits?: string; packageId?: string; userId?: string } }) {
  const orderId = searchParams?.orderId;
  const amount = searchParams?.amount;
  const credits = searchParams?.credits;
  const packageId = searchParams?.packageId;
  const userId = searchParams?.userId;
  
  if (!orderId) {
    redirect('/packages');
  }
  
  // Redirect directly to success page with all parameters
  const basePath = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') || '';
  const params = new URLSearchParams({
    orderId: orderId as string,
    ...(amount && { amount }),
    ...(credits && { credits }),
    ...(packageId && { packageId }),
    ...(userId && { userId })
  });
  
  redirect(`${basePath}/payment/success?${params.toString()}`);
}


