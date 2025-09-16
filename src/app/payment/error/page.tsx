'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorData, setErrorData] = useState<any>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const error = searchParams.get('error');
    
    setErrorData({
      orderId,
      error: error || 'حدث خطأ غير متوقع'
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Error Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="font-headline text-3xl font-bold text-foreground mb-2">
              فشل في الدفع
            </h1>
            <p className="text-muted-foreground">
              عذراً، حدث خطأ أثناء معالجة الدفع
            </p>
          </div>

          {/* Error Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>تفاصيل الخطأ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorData?.orderId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رقم الطلب</span>
                  <span className="font-mono text-sm">{errorData.orderId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">نوع الخطأ</span>
                <span className="text-red-600">{errorData?.error}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الوقت</span>
                <span>{new Date().toLocaleDateString('ar-SA')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Possible Causes */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>الأسباب المحتملة</CardTitle>
              <CardDescription>
                قد يكون الخطأ بسبب أحد الأسباب التالية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">مشكلة في بيانات البطاقة الائتمانية</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">انتهاء صلاحية البطاقة أو عدم وجود رصيد كافي</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">مشكلة في الاتصال بالإنترنت</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">مشكلة مؤقتة في نظام الدفع</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1">
              <Link href="/packages">
                <RefreshCw className="ml-2 h-4 w-4" />
                المحاولة مرة أخرى
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة للرئيسية
              </Link>
            </Button>
          </div>

          {/* Support Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              إذا استمر الخطأ، يرجى التواصل معنا
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              رقم الطلب: {errorData?.orderId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}