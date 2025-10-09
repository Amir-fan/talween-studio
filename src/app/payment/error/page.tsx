'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function PaymentErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [errorData, setErrorData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [liveDebug, setLiveDebug] = useState<any>(null);
  const [isLoadingDebug, setIsLoadingDebug] = useState(false);

  useEffect(() => {
    console.log('🔍 [ERROR PAGE] === ERROR PAGE LOADED ===');
    
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('paymentId');
    const id = searchParams.get('Id');
    const error = searchParams.get('error');
    
    // Get all URL parameters for debugging
    const allParams = Object.fromEntries(searchParams.entries());
    
    console.log('🔍 [ERROR PAGE] URL Parameters:', {
      orderId,
      paymentId,
      id,
      error,
      allParams
    });
    
    // Check if this is a callback error (has paymentId)
    const isCallbackError = !!(paymentId && orderId);
    console.log('🔍 [ERROR PAGE] Is callback error?', isCallbackError);
    
    setErrorData({
      orderId,
      paymentId,
      id,
      error: error || 'حدث خطأ غير متوقع',
      isCallbackError
    });
    
    setDebugInfo({
      allParams,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      currentUrl: window.location.href
    });

    // Fetch live debug info from our debug endpoint
    if (orderId || paymentId) {
      setIsLoadingDebug(true);
      const debugUrl = `/api/payment/debug-status?orderId=${orderId || ''}&paymentId=${paymentId || ''}`;
      console.log('🔍 [ERROR PAGE] Fetching debug info from:', debugUrl);
      
      fetch(debugUrl)
        .then(res => res.json())
        .then(data => {
          console.log('🔍 [ERROR PAGE] Live debug data:', data);
          setLiveDebug(data);
          setIsLoadingDebug(false);
        })
        .catch(err => {
          console.error('🔍 [ERROR PAGE] Failed to fetch debug info:', err);
          setLiveDebug({ error: err.message });
          setIsLoadingDebug(false);
        });
    }
    
    // If this is a callback error, try to diagnose what went wrong
    if (isCallbackError) {
      console.log('🔍 [ERROR PAGE] This appears to be a callback error');
      console.log('🔍 [ERROR PAGE] Expected callback URL should have been:');
      console.log(`🔍 [ERROR PAGE] /api/payment/callback?orderId=${orderId}&paymentId=${paymentId}`);
      
      // FIX: If MyFatoorah redirected to error page instead of callback,
      // automatically redirect to the callback endpoint to verify payment status
      console.log('🔍 [ERROR PAGE] MyFatoorah redirected to error page - attempting to verify payment...');
      setTimeout(() => {
        console.log('🔍 [ERROR PAGE] Redirecting to callback for payment verification...');
        window.location.href = `/api/payment/callback?orderId=${orderId}&paymentId=${paymentId}`;
      }, 3000); // Wait 3 seconds to show error message first
      
      // Try to check if the callback endpoint is reachable and get the response
      console.log('🔍 [ERROR PAGE] Testing callback endpoint...');
      fetch(`/api/payment/callback?orderId=${orderId}&paymentId=${paymentId}`)
        .then(response => {
          console.log('🔍 [ERROR PAGE] Callback endpoint test response:', response.status);
          console.log('🔍 [ERROR PAGE] Response headers:', Object.fromEntries(response.headers.entries()));
          console.log('🔍 [ERROR PAGE] Response redirected:', response.redirected);
          console.log('🔍 [ERROR PAGE] Response URL:', response.url);
          return response.text();
        })
        .then(text => {
          console.log('🔍 [ERROR PAGE] Callback endpoint test result:');
          console.log(text);
          // Try to parse as JSON if possible
          try {
            const json = JSON.parse(text);
            console.log('🔍 [ERROR PAGE] Parsed JSON response:', json);
          } catch (e) {
            console.log('🔍 [ERROR PAGE] Response is not JSON (might be HTML redirect)');
          }
        })
        .catch(err => {
          console.error('🔍 [ERROR PAGE] Callback endpoint test failed:', err);
        });
    }
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

          {/* Debug Information */}
          {debugInfo && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-sm">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs font-mono">
                  <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
                  <div><strong>Order ID:</strong> {errorData?.orderId}</div>
                  <div><strong>Payment ID:</strong> {errorData?.paymentId}</div>
                  <div><strong>Error Type:</strong> {errorData?.isCallbackError ? 'Callback Error' : 'Unknown Error'}</div>
                  <div><strong>Referrer:</strong> {debugInfo.referrer || 'Direct access'}</div>
                  <div><strong>Current URL:</strong> {debugInfo.currentUrl}</div>
                  <div><strong>All Parameters:</strong> {JSON.stringify(debugInfo.allParams, null, 2)}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Debug Information from Server */}
          <Card className="mb-6 border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                🔍 Live Payment Status Check
                {isLoadingDebug && <span className="text-xs text-muted-foreground">(Loading...)</span>}
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time payment verification from MyFatoorah and Google Sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingDebug && (
                <div className="text-sm text-muted-foreground">Checking payment status...</div>
              )}
              
              {liveDebug && (
                <div className="space-y-4">
                  {/* Summary */}
                  {liveDebug.summary && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">📊 Summary</h4>
                      <div className="space-y-1 text-xs">
                        <div><strong>Order Found:</strong> {liveDebug.summary.orderFound ? '✅ Yes' : '❌ No'}</div>
                        <div><strong>Payment Checked:</strong> {liveDebug.summary.paymentChecked ? '✅ Yes' : '❌ No'}</div>
                        <div className="text-lg font-bold mt-2">
                          <strong>Payment Status:</strong>{' '}
                          <span className={
                            liveDebug.summary.paymentStatus === 'Paid' ? 'text-green-600' :
                            liveDebug.summary.paymentStatus === 'Failed' ? 'text-red-600' :
                            liveDebug.summary.paymentStatus === 'Pending' ? 'text-yellow-600' :
                            'text-gray-600'
                          }>
                            {liveDebug.summary.paymentStatus}
                          </span>
                        </div>
                        {liveDebug.summary.shouldSucceed && (
                          <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">
                            ✅ Payment was successful! Credits should be added.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Order Details */}
                  {liveDebug.orderDetails && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">📦 Order Details (Google Sheets)</h4>
                      <div className="space-y-1 text-xs font-mono">
                        <div><strong>Order ID:</strong> {liveDebug.orderDetails.orderId}</div>
                        <div><strong>User ID:</strong> {liveDebug.orderDetails.userId}</div>
                        <div><strong>Amount:</strong> ${liveDebug.orderDetails.amount}</div>
                        <div><strong>Credits:</strong> {liveDebug.orderDetails.credits}</div>
                        <div><strong>Package:</strong> {liveDebug.orderDetails.packageId}</div>
                        <div><strong>Status:</strong> <span className="font-bold">{liveDebug.orderDetails.status}</span></div>
                      </div>
                    </div>
                  )}

                  {/* MyFatoorah Status */}
                  {liveDebug.myFatoorahStatus && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">💳 MyFatoorah Payment Status</h4>
                      <div className="space-y-1 text-xs font-mono">
                        <div><strong>API Success:</strong> {liveDebug.myFatoorahStatus.success ? '✅' : '❌'}</div>
                        <div><strong>Status:</strong> <span className="font-bold">{liveDebug.myFatoorahStatus.status}</span></div>
                        <div><strong>Is Paid:</strong> {liveDebug.myFatoorahStatus.isPaid ? '✅ Yes' : '❌ No'}</div>
                        <div><strong>Is Pending:</strong> {liveDebug.myFatoorahStatus.isPending ? '⏳ Yes' : '❌ No'}</div>
                        <div><strong>Is Failed:</strong> {liveDebug.myFatoorahStatus.isFailed ? '❌ Yes' : '✅ No'}</div>
                      </div>
                    </div>
                  )}

                  {/* Processing Steps */}
                  {liveDebug.steps && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">🔄 Processing Steps</h4>
                      <div className="space-y-2">
                        {liveDebug.steps.map((step: any, index: number) => (
                          <div key={index} className="text-xs border-l-2 border-gray-300 pl-3">
                            <div className="font-semibold">
                              Step {step.step}: {step.name} - {step.status}
                            </div>
                            {step.error && (
                              <div className="text-red-600 mt-1">Error: {step.error}</div>
                            )}
                            {step.paymentStatus && (
                              <div className="mt-1">Payment Status: <strong>{step.paymentStatus}</strong></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Debug Data (Collapsible) */}
                  <details className="text-xs">
                    <summary className="cursor-pointer font-semibold">🔧 Full Debug Data (Click to expand)</summary>
                    <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded overflow-auto max-h-96">
                      {JSON.stringify(liveDebug, null, 2)}
                    </pre>
                  </details>
                </div>
              )}

              {liveDebug?.error && (
                <div className="p-4 bg-red-50 text-red-800 rounded">
                  <strong>Error loading debug info:</strong> {liveDebug.error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Support Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              إذا استمر الخطأ، يرجى التواصل معنا
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              رقم الطلب: {errorData?.orderId}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              تحقق من وحدة التحكم (F12) للمزيد من التفاصيل
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    }>
      <PaymentErrorContent />
    </Suspense>
  );
}