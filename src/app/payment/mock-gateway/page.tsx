'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function MockGatewayContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const o = searchParams.get('orderId') || '';
    const a = searchParams.get('amount') || '';
    setOrderId(o);
    setAmount(a);
  }, [searchParams]);

  const succeed = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      // Simulate provider redirect by going through verify which uses callback
      window.location.assign(`/api/payment/callback?orderId=${encodeURIComponent(orderId)}&paymentId=MOCK-PAY-${Date.now()}`);
    } finally { setLoading(false); }
  };

  const fail = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      window.location.assign(`/payment/error?orderId=${encodeURIComponent(orderId)}&error=${encodeURIComponent('Mock failure')}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-xl font-bold">بوابة دفع تجريبية</h1>
        <p className="text-muted-foreground">Order: {orderId || '-'}</p>
        <p className="text-muted-foreground">Amount: {amount || '-'}</p>
        <div className="flex gap-3 justify-center">
          <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={succeed} disabled={loading}>نجاح الدفع</button>
          <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={fail} disabled={loading}>فشل الدفع</button>
        </div>
      </div>
    </div>
  );
}

export default function MockGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>}>
      <MockGatewayContent />
    </Suspense>
  );
}


