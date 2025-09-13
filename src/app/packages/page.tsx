'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Crown, Users, Zap } from 'lucide-react';
import { getAllSubscriptionTiers, PRICING_CONFIG } from '@/lib/pricing';
import { useAuth } from '@/context/auth-context';

const tierIcons = {
  FREE: <Zap className="h-6 w-6" />,
  EXPLORER: <Star className="h-6 w-6" />,
  CREATIVE_WORLD: <Crown className="h-6 w-6" />,
  CREATIVE_TEACHER: <Users className="h-6 w-6" />
};

const tierColors = {
  FREE: 'bg-gray-100 text-gray-800',
  EXPLORER: 'bg-blue-100 text-blue-800',
  CREATIVE_WORLD: 'bg-purple-100 text-purple-800',
  CREATIVE_TEACHER: 'bg-gold-100 text-gold-800'
};

export default function PackagesPage() {
  const { user, userData } = useAuth();
  const tiers = getAllSubscriptionTiers();

    return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-headline text-4xl font-bold text-foreground mb-4">
            اختر الباقة المناسبة لك
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            اكتشف عالم الإبداع والتلوين مع باقاتنا المتنوعة المصممة خصيصاً لتناسب احتياجاتك
          </p>
        </div>

        {/* Current User Status */}
        {user && userData && (
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-3 shadow-sm">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">رصيدك الحالي</p>
                <p className="text-2xl font-bold text-primary">{userData.credits} نقطة</p>
              </div>
              <div className="w-px h-8 bg-border"></div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">القيمة بالدولار</p>
                <p className="text-lg font-semibold text-green-600">
                  ${(userData.credits * PRICING_CONFIG.CREDIT_TO_USD).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                tier.id === 'CREATIVE_WORLD' ? 'ring-2 ring-primary scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {tier.id === 'CREATIVE_WORLD' && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-bold rounded-bl-lg">
                  الأكثر شعبية
                                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${tierColors[tier.id as keyof typeof tierColors]}`}>
                  {tierIcons[tier.id as keyof typeof tierIcons]}
                                </div>
                <CardTitle className="font-headline text-2xl font-bold">{tier.name}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {tier.id === 'FREE' ? 'ابدأ رحلتك مجاناً' : 'اشتراك شهري'}
                </CardDescription>
                            </CardHeader>

              <CardContent className="px-6 pb-6">
                {/* Price */}
                <div className="text-center mb-6">
                  {tier.id === 'FREE' ? (
                    <div className="text-4xl font-bold text-foreground">مجاناً</div>
                  ) : (
                    <div>
                      <div className="text-4xl font-bold text-foreground">${tier.price}</div>
                      <div className="text-sm text-muted-foreground">/شهر</div>
                 </div>
                  )}
                                <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {tier.credits} نقطة (${tier.value} قيمة)
                    </Badge>
                  </div>
                                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button 
                  className={`w-full font-bold ${
                    tier.id === 'FREE' 
                      ? 'bg-gray-600 hover:bg-gray-700' 
                      : tier.id === 'CREATIVE_WORLD'
                      ? 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                  size="lg"
                >
                  {tier.id === 'FREE' ? 'ابدأ الآن' : 'اشترك الآن'}
                </Button>
                            </CardFooter>
                        </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="font-headline text-3xl font-bold text-center mb-12">
            مقارنة الميزات
          </h2>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right font-semibold text-foreground">الميزة</th>
                    {tiers.map((tier) => (
                      <th key={tier.id} className="px-6 py-4 text-center font-semibold text-foreground">
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 font-medium">قصص باسم الطفل</td>
                    {tiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center">
                        {tier.id === 'FREE' ? '1' : tier.id === 'EXPLORER' ? '5' : tier.id === 'CREATIVE_WORLD' ? '15' : '40+'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">صفحات التلوين</td>
                    {tiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center">
                        {tier.id === 'FREE' ? '2' : tier.id === 'EXPLORER' ? '10' : tier.id === 'CREATIVE_WORLD' ? '30' : '100+'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">تحويل الصور</td>
                    {tiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center">
                        {tier.id === 'FREE' ? '0' : tier.id === 'EXPLORER' ? '2' : tier.id === 'CREATIVE_WORLD' ? '5' : '15'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">الكراسات التعليمية</td>
                    {tiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center">
                        {tier.id === 'FREE' ? '1' : tier.id === 'EXPLORER' ? '3' : tier.id === 'CREATIVE_WORLD' ? '10' : '20'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 font-medium">جودة الطباعة</td>
                    {tiers.map((tier) => (
                      <td key={tier.id} className="px-6 py-4 text-center">
                        {tier.id === 'FREE' ? 'محدودة' : tier.id === 'EXPLORER' ? 'عالية' : tier.id === 'CREATIVE_WORLD' ? 'فاخرة' : 'احترافية'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Credit System Explanation */}
        <div className="mt-20 text-center">
          <h2 className="font-headline text-3xl font-bold mb-8">
            نظام النقاط
          </h2>
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-xl mb-4">أسعار الميزات</h3>
                <div className="space-y-3 text-right">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">قصة باسم الطفل</span>
                    <Badge variant="outline">66 نقطة ($3.00)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">فكرة → تلوين</span>
                    <Badge variant="outline">35 نقطة ($1.60)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">تحويل صورة</span>
                    <Badge variant="outline">27 نقطة ($1.20)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">إعادة توليد</span>
                    <Badge variant="outline">9 نقاط ($0.40)</Badge>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-xl mb-4">معدل التحويل</h3>
                <div className="space-y-3 text-right">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">1 دولار</span>
                    <Badge variant="secondary">22 نقطة</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">1 نقطة</span>
                    <Badge variant="secondary">$0.045</Badge>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>نصيحة:</strong> الباقات الشهرية توفر قيمة أكبر بكثير من الشراء الفردي للنقاط
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}