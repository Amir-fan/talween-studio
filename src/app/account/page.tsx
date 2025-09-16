'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, CreditCard, Download, History, Settings, Star, Crown, Users } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { PRICING_CONFIG } from '@/lib/pricing';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  stories: number;
  coloring: number;
  images: number;
  totalContent: number;
  creditsUsed: number;
  creditsRemaining: number;
  totalPurchased: number;
  joinDate: number;
  lastLogin?: number;
  subscriptionTier: string;
  emailVerified: boolean;
}

interface Transaction {
  id: string;
  type: 'purchase' | 'deduction';
  amount: number;
  description: string;
  date: Date;
  status: string;
}

export default function AccountPage() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user statistics and transactions
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/stats?userId=${user.id}`);
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
          setRecentTransactions(data.recentTransactions);
        } else {
          console.error('Failed to fetch user stats:', data.error);
          toast({
            variant: 'destructive',
            title: 'خطأ',
            description: 'فشل في تحميل بيانات الحساب',
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
        toast({
          variant: 'destructive',
          title: 'خطأ',
          description: 'فشل في تحميل بيانات الحساب',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user?.id, toast]);

  if (!user || !userData || loading) {
    return (
      <div className="min-h-screen bg-yellow-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-yellow-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">فشل في تحميل بيانات الحساب</p>
        </div>
      </div>
    );
  }

  const currentCredits = stats.creditsRemaining;
  const creditValueUSD = currentCredits * PRICING_CONFIG.CREDIT_TO_USD;

  // Determine subscription tier based on credits
  const getSubscriptionTier = () => {
    if (currentCredits >= 7938) return { name: 'المعلم المبدع', icon: <Users className="h-5 w-5" />, color: 'bg-gold-100 text-gold-800' };
    if (currentCredits >= 3440) return { name: 'عالم الإبداع', icon: <Crown className="h-5 w-5" />, color: 'bg-purple-100 text-purple-800' };
    if (currentCredits >= 1368) return { name: 'المكتشف', icon: <Star className="h-5 w-5" />, color: 'bg-blue-100 text-blue-800' };
    return { name: 'المجانية', icon: <Coins className="h-5 w-5" />, color: 'bg-gray-100 text-gray-800' };
  };

  const subscriptionTier = getSubscriptionTier();

  return (
    <div className="min-h-screen bg-yellow-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-foreground mb-2">
            حسابي الشخصي
          </h1>
          <p className="text-muted-foreground">
            مرحباً {userData.displayName || user.email}، إدارة رصيدك ومتابعة نشاطك
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Credit Balance Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-6 w-6 text-primary" />
                  رصيد النقاط
                </CardTitle>
                <CardDescription>
                  إدارة رصيدك واستخدام النقاط
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Balance */}
                <div className="text-center p-6 bg-gradient-to-r from-primary/10 to-amber-100 rounded-2xl">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {currentCredits.toLocaleString()}
                  </div>
                  <div className="text-lg text-muted-foreground mb-4">نقطة</div>
                  <div className="text-sm text-green-600 font-semibold">
                    القيمة: ${creditValueUSD.toFixed(2)}
                  </div>
                </div>

                {/* Subscription Tier */}
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${subscriptionTier.color}`}>
                      {subscriptionTier.icon}
                    </div>
                    <div>
                      <div className="font-semibold">{subscriptionTier.name}</div>
                      <div className="text-sm text-muted-foreground">الباقة الحالية</div>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/packages">ترقية</Link>
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <Button asChild className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-600">
                    <Link href="/packages">
                      <CreditCard className="ml-2 h-4 w-4" />
                      شراء نقاط
                    </Link>
                    </Button>
                  <Button asChild variant="outline">
                    <Link href="/create">
                      <Coins className="ml-2 h-4 w-4" />
                      إنشاء محتوى
                    </Link>
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إحصائيات سريعة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">القصص المنشأة</span>
                  <Badge variant="secondary">{stats.stories}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">صفحات التلوين</span>
                  <Badge variant="secondary">{stats.coloring}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">التحويلات</span>
                  <Badge variant="secondary">{stats.images}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">النقاط المستخدمة</span>
                  <Badge variant="outline">{stats.creditsUsed.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">إجمالي المحتوى</span>
                  <Badge variant="secondary">{stats.totalContent}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الميزات المتاحة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">قصص باسم الطفل</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">تحويل الصور</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">فكرة إلى تلوين</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">الكراسات التعليمية</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">الطباعة عالية الجودة</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              المعاملات الأخيرة
            </CardTitle>
            <CardDescription>
              سجل استخدام النقاط والعمليات المالية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'deduction' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {transaction.type === 'deduction' ? (
                        <Coins className="h-4 w-4" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.date.toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>
                  <div className={`font-semibold ${
                    transaction.type === 'deduction' 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} نقطة
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                عرض جميع المعاملات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="mt-8">
              <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              إعدادات الحساب
                </CardTitle>
              </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">الاسم</label>
                  <div className="mt-1 text-lg">{userData.displayName || 'غير محدد'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</label>
                  <div className="mt-1 text-lg flex items-center gap-2">
                    {user.email}
                    {stats.emailVerified ? (
                      <Badge variant="secondary" className="text-green-600">✓ مفعل</Badge>
                    ) : (
                      <Badge variant="destructive">غير مفعل</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">تاريخ الانضمام</label>
                  <div className="mt-1 text-lg">
                    {new Date(stats.joinDate * 1000).toLocaleDateString('ar-SA')}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">آخر تسجيل دخول</label>
                  <div className="mt-1 text-lg">
                    {stats.lastLogin ? 
                      new Date(stats.lastLogin * 1000).toLocaleDateString('ar-SA') : 
                      'غير محدد'
                    }
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">الباقة الحالية</label>
                  <div className="mt-1 text-lg">
                    <Badge variant="outline">{stats.subscriptionTier}</Badge>
                  </div>
                </div>
              </div>
            </div>
              </CardContent>
            </Card>
      </div>
    </div>
  );
}