'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowRight, Coins } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUserData } = useAuth();
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const credits = searchParams.get('credits');
    
    if (orderId && amount && credits) {
      setPaymentData({
        orderId,
        amount: parseFloat(amount),
        credits: parseInt(credits)
      });
      
      // Sync user data to get updated credits
      console.log('🔄 Syncing user data after payment success...');
      refreshUserData();
    } else {
      // Redirect to packages if no payment data
      router.push('/packages');
    }
  }, [searchParams, router]);

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="font-headline text-3xl font-bold text-foreground mb-2">
              تم الدفع بنجاح! 🎉
            </h1>
            <p className="text-muted-foreground">
              شكراً لك! تم تأكيد طلبك بنجاح
            </p>
          </div>

          {/* Payment Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>تفاصيل الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم الطلب</span>
                <span className="font-mono text-sm">{paymentData.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ المدفوع</span>
                <span className="font-bold text-green-600">${paymentData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">النقاط المضافة</span>
                <span className="font-bold text-blue-600 flex items-center gap-1">
                  <Coins className="h-4 w-4" />
                  {paymentData.credits.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ الدفع</span>
                <span>{new Date().toLocaleDateString('ar-SA')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>الخطوات التالية</CardTitle>
              <CardDescription>
                يمكنك الآن البدء في استخدام نقاطك الجديدة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium">إنشاء قصص جديدة</p>
                  <p className="text-sm text-muted-foreground">
                    استخدم نقاطك لإنشاء قصص مخصصة باسم طفلك
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium">تحويل الصور إلى صفحات تلوين</p>
                  <p className="text-sm text-muted-foreground">
                    حول صورك المفضلة إلى صفحات تلوين جميلة
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium">استكشاف مكتبتك</p>
                  <p className="text-sm text-muted-foreground">
                    جميع إبداعاتك محفوظة في مكتبتك الشخصية
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Link href="/create">
                <ArrowRight className="ml-2 h-4 w-4" />
                ابدأ الإنشاء الآن
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/library">
                <Download className="ml-2 h-4 w-4" />
                عرض مكتبتي
              </Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              تم إرسال إيصال الدفع إلى بريدك الإلكتروني
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              إذا كان لديك أي استفسارات، يرجى التواصل معنا
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}