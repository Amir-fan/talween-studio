'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      router.push('/packages');
      return;
    }
    // Navigate the browser to the verify endpoint so server-side redirects
    // (callback -> success/error/pending) are followed by the browser.
    window.location.assign(`/api/payment/verify?orderId=${encodeURIComponent(orderId)}`);
  }, [searchParams, router]);

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


