'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Shield, CreditCard, CheckCircle, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/auth-context';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initializePayment = async () => {
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');
      const packageId = searchParams.get('packageId');
      const credits = searchParams.get('credits');
      
      if (!orderId || !amount || !packageId || !credits) {
        router.push('/packages');
        return;
      }

      setPaymentData({
        orderId,
        amount: parseFloat(amount),
        packageId,
        credits: parseInt(credits)
      });

      // Create MyFatoorah payment session
      try {
        setLoading(true);
        const response = await fetch('/api/payment/create-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId,
            amount: parseFloat(amount),
            currency: 'USD',
            packageId,
            credits: parseInt(credits),
            userId: user?.id || '5d0c39ef-89cb-4a57-9a6e-857253659c7f' // Use actual user ID or fallback for testing
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Payment API Response:', data);
        
        if (data.success) {
          setPaymentUrl(data.paymentUrl);
        } else {
          setError(data.error || 'فشل في إنشاء جلسة الدفع');
        }
      } catch (error) {
        console.error('Payment initialization error:', error);
        setError(error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل صفحة الدفع');
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [searchParams, router]);

  const handleProceedToPayment = () => {
    console.log('Payment URL:', paymentUrl);
    if (paymentUrl) {
      // Open MyFatoorah payment page in new tab
      window.open(paymentUrl, '_blank');
    } else {
      console.error('No payment URL available');
      setError('لم يتم إنشاء رابط الدفع');
    }
  };

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
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">جلسة الدفع جاهزة</h3>
                      <p className="text-muted-foreground mb-6">
                        تم إنشاء جلسة الدفع بنجاح. انقر على الزر أدناه للانتقال إلى صفحة الدفع الآمنة.
                      </p>
                      
                      <Button
                        onClick={handleProceedToPayment}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        size="lg"
                      >
                        <ExternalLink className="ml-2 h-5 w-5" />
                        الانتقال إلى صفحة الدفع
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
