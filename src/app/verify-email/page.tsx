'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('رابط التحقق غير صحيح');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('تم تأكيد بريدك الإلكتروني بنجاح!');
      } else {
        setStatus('error');
        setMessage(data.error || 'فشل في تأكيد البريد الإلكتروني');
      }
    } catch (error) {
      setStatus('error');
      setMessage('حدث خطأ أثناء التحقق من البريد الإلكتروني');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' && 'جاري التحقق...'}
            {status === 'success' && 'تم التأكيد بنجاح!'}
            {status === 'error' && 'فشل في التحقق'}
          </CardTitle>
          <CardDescription className="text-lg">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                مرحباً بك في عالم تلوين! يمكنك الآن البدء في إنشاء قصص سحرية لطفلك.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/login">تسجيل الدخول</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">الصفحة الرئيسية</Link>
                </Button>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                يبدو أن هناك مشكلة في رابط التحقق. تأكد من أنك استخدمت الرابط الصحيح من بريدك الإلكتروني.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/signup">إنشاء حساب جديد</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/">الصفحة الرئيسية</Link>
                </Button>
              </div>
            </div>
          )}
          
          {status === 'loading' && (
            <p className="text-gray-600">
              يرجى الانتظار بينما نتحقق من بريدك الإلكتروني...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
