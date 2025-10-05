'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      router.push('/packages');
      return;
    }

    const interval = setInterval(async () => {
      if (checking) return;
      setChecking(true);
      try {
        // Leverage verify route which redirects through callback
        const res = await fetch(`/api/payment/verify?orderId=${encodeURIComponent(orderId)}`, { method: 'GET' });
        // It will redirect; we just stop polling and let the router update
        if (res.redirected) {
          window.location.href = res.url;
        }
      } catch {}
      finally { setChecking(false); }
    }, 2500);

    return () => clearInterval(interval);
  }, [searchParams, router, checking]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">جاري التحقق من حالة الدفع...</p>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <PendingContent />
    </Suspense>
  );
}


