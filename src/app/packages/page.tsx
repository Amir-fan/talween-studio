'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const creditPackages = [
  {
    id: 'TEST',
    name: 'اختبار الدفع',
    credits: 22,
    price: 1,
    currency: 'USD',
    description: 'لاختبار نظام الدفع',
    features: ['22 نقطة للاختبار', 'تأكيد عمل نظام الدفع', 'تجربة سريعة', 'مثالي للاختبار'],
    popular: false,
    icon: <Star className="h-8 w-8" />,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'FREE',
    name: 'المجانية',
    credits: 128,
    price: 0,
    currency: 'USD',
    description: 'ابدأ مجاناً',
    features: ['قصة البداية: أول قصة تفاعلية باسم الطفل', 'ألوان التجربة: صفحتان للتلوين', 'كراسة معاينة: نسخة تعليمية مبسطة', 'طباعة محدودة: مقاس واحد + يظهر شعار'],
    popular: false,
    icon: <Star className="h-8 w-8" />,
    color: 'from-gray-500 to-gray-600',
  },
  {
    id: 'EXPLORER',
    name: 'المكتشف',
    credits: 1368,
    price: 12.99,
    currency: 'USD',
    description: 'مثالي للاستكشاف',
    features: ['كل مزايا المجانية', 'قصص الاستكشاف: 5 مغامرات قصيرة', 'ألوان إضافية: 10 صفحات للتلوين', 'كراسات التعلم: 3 كراسات جاهزة', 'ذكريات مرسومة: تحويل صورتين', 'طباعة منزلية: جودة عالية'],
    popular: true,
    icon: <Zap className="h-8 w-8" />,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'CREATIVE_WORLD',
    name: 'عالم الإبداع',
    credits: 3440,
    price: 29.99,
    currency: 'USD',
    description: 'للإبداع المتقدم',
    features: ['كل مزايا المكتشف', 'قصص الإبداع: 15 قصة متكاملة', 'ألوان بلا حدود: 30 صفحة جديدة شهرياً', 'كراسات متقدمة: 10 كراسات إضافية', 'صور عائلية ملونة: تحويل 5 صور', 'طباعة فاخرة: مقاسات متعددة'],
    popular: false,
    icon: <Crown className="h-8 w-8" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'CREATIVE_TEACHER',
    name: 'المعلم المبدع',
    credits: 7938,
    price: 59.99,
    currency: 'USD',
    description: 'للمعلمين والمدارس',
    features: ['كل مزايا عالم الإبداع', 'قصص جماعية: أكثر من 40 قصة', 'ألوان الصف: 100+ صفحة إضافية', 'كراسات شاملة: 20 كراسة تربوية', 'ذكريات ممتدة: تحويل 15 صورة', 'طباعة احترافية: جودة K4 / HD'],
    popular: false,
    icon: <Crown className="h-8 w-8" />,
    color: 'from-yellow-500 to-orange-500',
  },
];

export default function PackagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signup');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const handlePurchase = async (packageId: string) => {
    setProcessing(true);
    try {
      const selectedPkg = creditPackages.find(pkg => pkg.id === packageId);
      if (!selectedPkg) return;

      // Handle FREE package
      if (selectedPkg.id === 'FREE') {
        toast({
          title: 'الباقة المجانية',
          description: 'أنت تستخدم بالفعل الباقة المجانية!',
        });
        setProcessing(false);
        return;
      }

      const response = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPkg.price,
          currency: selectedPkg.currency,
          packageId: selectedPkg.id,
          credits: selectedPkg.credits,
          userId: user?.id,
        }),
      });

      const result = await response.json();

      if (result.success && result.paymentUrl) {
        // Redirect to payment page with order details
        const paymentUrl = `/payment?orderId=${result.orderId}&amount=${selectedPkg.price}&packageId=${selectedPkg.id}&credits=${selectedPkg.credits}`;
        window.location.href = paymentUrl;
      } else {
        throw new Error(result.error || 'فشل في إنشاء جلسة الدفع');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ في الدفع',
        description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-talween-yellow/10 via-talween-pink/10 to-talween-teal/10 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-talween-orange" />
            <h1 className="font-headline text-4xl font-bold text-talween-brown">
              باقات النقاط
            </h1>
          </div>
          <p className="text-xl text-talween-brown/70 max-w-2xl mx-auto">
            اختر الباقة المناسبة لك واستمتع بإنشاء قصص وصور تلوين لا محدودة
          </p>
        </div>

        {/* Current Credits */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-talween-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <Star className="h-5 w-5 text-talween-yellow fill-talween-yellow" />
            <span className="font-bold text-talween-brown">نقاطك الحالية: {user?.credits || 0}</span>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {creditPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                pkg.popular ? 'ring-2 ring-talween-purple shadow-xl' : 'shadow-lg'
              }`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-talween-purple to-talween-pink text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                  الأكثر شعبية
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-r ${pkg.color} flex items-center justify-center text-white mb-4`}>
                  {pkg.icon}
                </div>
                <CardTitle className="font-headline text-2xl text-talween-brown">
                  {pkg.name}
                </CardTitle>
                <CardDescription className="text-talween-brown/70">
                  {pkg.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="mb-6">
                  <div className="text-4xl font-bold text-talween-brown mb-2">
                    {pkg.credits}
                    <span className="text-lg text-talween-brown/70 mr-2">نقطة</span>
                  </div>
                  <div className="text-3xl font-bold text-talween-orange">
                    {pkg.price} {pkg.currency}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 text-right">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-talween-green flex-shrink-0" />
                      <span className="text-talween-brown/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={processing || pkg.id === 'FREE'}
                  className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90 text-white font-bold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 ${
                    pkg.id === 'FREE' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري المعالجة...
                    </div>
                  ) : pkg.id === 'FREE' ? (
                    'الباقة الحالية'
                  ) : pkg.id === 'TEST' ? (
                    <div className="flex items-center gap-2">
                      🧪 اختبر الدفع - $1
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      اشتر الآن
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 text-center">
          <h2 className="font-headline text-3xl font-bold text-talween-brown mb-8">
            لماذا تختار تلوين ستوديو؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-talween-pink to-talween-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-talween-brown text-xl mb-2">ذكاء اصطناعي متقدم</h3>
              <p className="text-talween-brown/70">تقنية حديثة لإنشاء محتوى مخصص</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-talween-green to-talween-teal rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-talween-brown text-xl mb-2">آمن للأطفال</h3>
              <p className="text-talween-brown/70">محتوى آمن ومُراقب بعناية</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-talween-orange to-talween-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-talween-brown text-xl mb-2">دعم فني 24/7</h3>
              <p className="text-talween-brown/70">نحن هنا لمساعدتك دائماً</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}