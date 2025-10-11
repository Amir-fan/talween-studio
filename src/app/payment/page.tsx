'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Shield, CreditCard, Loader2, AlertCircle, ExternalLink, ArrowRight, CheckCircle, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';

function PaymentPageContent() {
  // ===== ALL HOOKS MUST BE DECLARED FIRST - BEFORE ANY CONDITIONS OR RETURNS =====
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [discountApplied, setDiscountApplied] = useState<{percentOff:number, finalAmount:number} | null>(null);
  
  // Use ref to guarantee exactly-once session creation
  const createdRef = useRef(false);

  // Initialize payment session EXACTLY ONCE when component mounts
  useEffect(() => {
    // Guarantee exactly-once processing
    if (createdRef.current) {
      console.log('🔍 [PAYMENT PAGE] Session already created, skipping');
      return;
    }
    
    // Wait for user to be loaded
    if (!user || !user.id) {
      console.log('🔍 [PAYMENT PAGE] Waiting for user data...');
      return;
    }
    
    // Read URL params once at start
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const packageId = searchParams.get('packageId');
    const credits = searchParams.get('credits');
    
    if (!orderId || !amount || !packageId || !credits) {
      console.log('🔍 [PAYMENT PAGE] Missing parameters, redirecting to packages');
      router.push('/packages');
      return;
    }

    // Mark as created IMMEDIATELY to prevent duplicate session creation
    createdRef.current = true;

    setPaymentData({
      orderId,
      amount: parseFloat(amount),
      packageId,
      credits: parseInt(credits)
    });

    // Create MyFatoorah payment session
    const initializePayment = async () => {
      try {
        setLoading(true);
        console.log('🔍 [PAYMENT PAGE] Creating payment session...');
        
        const response = await fetch('/api/payment/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            amount: parseFloat(amount),
            currency: 'USD',
            packageId,
            credits: parseInt(credits),
            userId: user.id,
            // Discount is not applied during init - only when user clicks Apply
            discountCode: undefined
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔍 [PAYMENT PAGE] API Error:', response.status, errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('🔍 [PAYMENT PAGE] Payment session created:', data);
        
        if (data.success) {
          setPaymentUrl(data.paymentUrl);
          // If this is a mock payment URL (our internal test gateway), go there immediately
          if (data.paymentUrl.includes('/payment/mock-gateway')) {
            window.location.assign(data.paymentUrl);
            return;
          }
        } else {
          setError(data.error || 'فشل في إنشاء جلسة الدفع');
        }
      } catch (error) {
        console.error('🔍 [PAYMENT PAGE] Payment initialization error:', error);
        setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل صفحة الدفع');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [searchParams, router, user]); // Added searchParams to ensure effect runs when params available

  const handleProceedToPayment = () => {
    console.log('🔍 [PAYMENT PAGE] Proceeding to payment:', paymentUrl);
    if (paymentUrl) {
      // Navigate in same tab to avoid popup blockers
      window.location.assign(paymentUrl);
    } else {
      console.error('🔍 [PAYMENT PAGE] No payment URL available');
      setError('لم يتم إنشاء رابط الدفع');
    }
  };

  // ===== ALL HOOKS DECLARED - NOW SAFE TO RETURN CONDITIONALLY =====

  if (loading || !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحضير صفحة الدفع...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            onClick={() => router.push('/packages')} 
            className="w-full mt-4"
          >
            العودة للباقات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-headline text-3xl font-bold text-foreground mb-2">
              إتمام الدفع الآمن
            </h1>
            <p className="text-muted-foreground">
              أكمل عملية الدفع لتأكيد طلبك - معالجة آمنة عبر MyFatoorah
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Interface */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  بوابة الدفع
                </CardTitle>
                <CardDescription>
                  انقر على الزر أدناه للانتقال إلى صفحة الدفع الآمنة
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentUrl ? (
                  <div className="space-y-6">
                    {/* Discount feature disabled to prevent duplicate session creation 
                        TODO: Implement proper discount flow that recreates session only on explicit Apply click
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">رمز الخصم</label>
                      <p className="text-sm text-muted-foreground">Discount codes coming soon</p>
                    </div>
                    */}
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">جلسة الدفع جاهزة</h3>
                      <p className="text-muted-foreground mb-6">
                        تم إنشاء جلسة الدفع بنجاح. انقر على الزر أدناه للانتقال إلى صفحة الدفع الآمنة.
                      </p>
                      
                      <Button
                        onClick={handleProceedToPayment}
                        className="w-full text-white text-base md:text-lg py-6 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800"
                        size="lg"
                      >
                        <ArrowRight className="ml-2 h-5 w-5" />
                        متابعة إلى الدفع الآمن
                      </Button>
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>دفع آمن حقيقي:</strong> سيتم توجيهك إلى صفحة دفع آمنة ومحمية من MyFatoorah. 
                        هذا دفع حقيقي - سيتم خصم المبلغ من بطاقتك الائتمانية. 
                        جميع المعاملات محمية بتشفير SSL ولا نحفظ بيانات بطاقتك الائتمانية.
                        <br /><br />
                        <strong>للاختبار:</strong> استخدم الباقة التجريبية ($1) لاختبار النظام قبل الشراء.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">جاري تحضير جلسة الدفع...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الباقة</span>
                  <span className="font-medium">{paymentData?.packageId || 'غير محدد'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">النقاط</span>
                  <span className="font-medium flex items-center gap-1">
                    <Coins className="h-4 w-4 text-blue-500" />
                    {paymentData?.credits?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المبلغ</span>
                  <span className="font-medium">${paymentData?.amount || '0'}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع</span>
                    <span>${paymentData?.amount || '0'}</span>
                  </div>
                </div>

                {/* Security Features */}
                <div className="mt-6 space-y-3">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm font-medium">حماية متقدمة</span>
                    </div>
                    <p className="text-xs text-green-600">
                      معالجة آمنة عبر MyFatoorah مع تشفير SSL 256-bit
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">معايير PCI DSS</span>
                    </div>
                    <p className="text-xs text-blue-600">
                      متوافق مع معايير أمان صناعة بطاقات الدفع
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-700 mb-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm font-medium">طرق دفع متعددة</span>
                    </div>
                    <p className="text-xs text-purple-600">
                      بطاقات ائتمانية، محافظ إلكترونية، تحويل بنكي
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              مدعوم من
            </p>
            <div className="flex justify-center items-center gap-6 opacity-60">
              <div className="text-xs font-semibold">MyFatoorah</div>
              <div className="text-xs font-semibold">SSL</div>
              <div className="text-xs font-semibold">PCI DSS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
