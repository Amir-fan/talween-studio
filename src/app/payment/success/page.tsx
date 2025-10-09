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
    console.log('🔍 [SUCCESS PAGE] === USEEFFECT TRIGGERED ===');
    
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const credits = searchParams.get('credits');
    const packageId = searchParams.get('packageId');
    const userId = searchParams.get('userId');
    
    console.log('🔍 [SUCCESS PAGE] URL Search Params:', {
      orderId,
      amount,
      credits,
      packageId,
      userId,
      allParams: Object.fromEntries(searchParams.entries())
    });
    
    // SECURITY: Check if user is authenticated
    if (!user) {
      console.log('🔍 [SUCCESS PAGE] User not authenticated, redirecting to login...');
      router.push('/signup');
      return;
    }
    
    // SECURITY: Validate required parameters
    if (!orderId || !amount || !credits) {
      console.log('🔍 [SUCCESS PAGE] Missing required parameters, redirecting to packages...');
      router.push('/packages');
      return;
    }
    
    // SECURITY: Validate orderId format
    if (!orderId.startsWith('order_')) {
      console.log('🔍 [SUCCESS PAGE] Invalid order ID format, redirecting to packages...');
      router.push('/packages');
      return;
    }
    
    console.log('🔍 [SUCCESS PAGE] All validations passed, starting payment completion process...');
    // Process payment completion and add credits
    processPaymentCompletion(orderId, amount, credits);
  }, [searchParams, router, user]);

  const processPaymentCompletion = async (orderId: string, amount: string | null, credits: string | null) => {
    try {
      console.log('🔍 [SUCCESS PAGE] === PAYMENT COMPLETION START ===');
      console.log('🔍 [SUCCESS PAGE] URL parameters:', { orderId, amount, credits });
      
      console.log('🔍 [SUCCESS PAGE] About to call /api/payment/verify with:', {
        orderId,
        status: 'paid',
        transactionId: orderId
      });
      
      // Get package info from URL or extract from orderId
      const packageId = searchParams.get('packageId');
      const userId = searchParams.get('userId') || user?.id;
      
      console.log('🔍 [SUCCESS PAGE] Additional params:', { packageId, userId });
      
      // Use the new reliable credit system
      console.log('🔍 [SUCCESS PAGE] Calling /api/payment/add-credits with:', {
        orderId,
        packageId,
        userId,
        amount,
        credits
      });
      
      const response = await fetch('/api/payment/add-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          packageId: packageId,
          userId: userId,
          amount: amount,
          credits: credits
        })
      });

      console.log('🔍 [SUCCESS PAGE] Add credits API response status:', response.status);

      if (response.ok) {
        console.log('🔍 [SUCCESS PAGE] ✅ Add credits API call successful, parsing response...');
        const addCreditsResult = await response.json();
        console.log('🔍 [SUCCESS PAGE] Add credits API result:', addCreditsResult);
        
        // Use the amounts from the add credits API response
        const actualAmount = addCreditsResult.amount || (amount ? parseFloat(amount) : 0);
        const actualCredits = addCreditsResult.credits || (credits ? parseInt(credits) : 0);
        
        console.log('🔍 [SUCCESS PAGE] Using amounts from API:', { actualAmount, actualCredits });
        
        // INSTANTLY refresh credits from Google Sheets before showing UI
        console.log('🔍 [SUCCESS PAGE] INSTANTLY syncing credits from Google Sheets...');
        await refreshUserData();
        console.log('🔍 [SUCCESS PAGE] ✅ User data refreshed');
        
        setPaymentData({
          orderId,
          amount: actualAmount,
          credits: actualCredits,
          packageName: addCreditsResult.packageName
        });
        
        console.log('🔍 [SUCCESS PAGE] ✅ Credits added successfully with amounts:', { 
          orderId, 
          amount: actualAmount, 
          credits: actualCredits,
          packageName: addCreditsResult.packageName
        });
      } else {
        console.error('🔍 [SUCCESS PAGE] ❌ Add credits API call failed with status:', response.status);
        const errorText = await response.text();
        console.error('🔍 [SUCCESS PAGE] ❌ Add credits API error response:', errorText);
        
        let errorResult;
        try {
          errorResult = JSON.parse(errorText);
          console.error('🔍 [SUCCESS PAGE] ❌ Credit addition failed (JSON):', errorResult);
        } catch (parseError) {
          console.error('🔍 [SUCCESS PAGE] ❌ Credit addition failed (text):', errorText);
        }
        
        // Still try to refresh credits and show URL parameters as fallback
        console.log('🔍 [SUCCESS PAGE] Attempting to refresh user data as fallback...');
        await refreshUserData();
        
        setPaymentData({
          orderId,
          amount: amount ? parseFloat(amount) : 0,
          credits: credits ? parseInt(credits) : 0,
          error: errorResult?.error || 'Failed to add credits'
        });
        
        console.log('🔍 [SUCCESS PAGE] Set fallback payment data:', {
          orderId,
          amount: amount ? parseFloat(amount) : 0,
          credits: credits ? parseInt(credits) : 0
        });
      }
    } catch (error) {
      console.error('🔍 [SUCCESS PAGE] ❌ Payment completion error:', error);
      console.error('🔍 [SUCCESS PAGE] ❌ Error stack:', error.stack);
      
      // Still try to refresh credits and show URL parameters as fallback
      console.log('🔍 [SUCCESS PAGE] Attempting to refresh user data after error...');
      try {
        await refreshUserData();
      } catch (refreshError) {
        console.error('🔍 [SUCCESS PAGE] ❌ Failed to refresh user data:', refreshError);
      }
      
      setPaymentData({
        orderId,
        amount: amount ? parseFloat(amount) : 0,
        credits: credits ? parseInt(credits) : 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      
      console.log('🔍 [SUCCESS PAGE] Set error fallback payment data:', {
        orderId,
        amount: amount ? parseFloat(amount) : 0,
        credits: credits ? parseInt(credits) : 0
      });
    }
  };

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
              تم الدفع بنجاح!
            </h1>
            <p className="text-muted-foreground">
              شكراً لك! تم تأكيد طلبك بنجاح
            </p>
            <p className="mt-2 text-sm">
              رصيدك الحالي سيتم تحديثه تلقائياً. إذا لم يظهر فوراً، اضغط تحديث في حسابك.
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
              {paymentData.packageName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الباقة المشتراة</span>
                  <span className="font-bold text-purple-600">{paymentData.packageName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ المدفوع</span>
                <span className="font-bold text-green-600">${paymentData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">النقاط المضافة</span>
                <span className="font-bold text-blue-600 flex items-center gap-1">
                  <Coins className="h-4 w-4" />
                  +{paymentData.credits.toLocaleString()} نقطة
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ الدفع</span>
                <span>{new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              {paymentData.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">
                    ⚠️ {paymentData.error}
                  </p>
                </div>
              )}
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