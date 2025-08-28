'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Mail,
  Lock,
  Crown,
  Users,
  Settings,
  Download,
  Pencil,
  Eye,
  CreditCard,
  PlusCircle,
  ShoppingBag,
  Edit2,
  Star,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import withAuth from '@/hoc/withAuth';
import { useRouter } from 'next/navigation';

function AccountPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();

  if (loading || !userData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="order-2 space-y-8 lg:order-1 lg:col-span-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="order-1 lg:order-2">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const creditPercentage = userData.credits ? (userData.credits / 50) * 100 : 0;

  return (
    <div className="min-h-screen bg-yellow-50/30">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-10 text-right">
          <h1 className="font-headline text-4xl font-bold text-foreground">حسابي</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            إدارة بياناتك الشخصية واشتراكك
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Right Column */}
          <div className="order-2 space-y-8 lg:order-1 lg:col-span-2">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3 font-headline text-2xl font-bold">
                  <Crown className="h-6 w-6 text-primary" />
                  <span>تفاصيل الاشتراك</span>
                </CardTitle>
                <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-bold text-yellow-900">
                  {userData.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-lg bg-secondary/50 p-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الباقة الحالية:</span>
                    <span className="font-bold">أساسية</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الحالة:</span>
                    <span className="font-bold">{userData.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                    <span className="font-bold">لا يوجد</span>
                  </div>
                </div>
                <div className="space-y-4 rounded-lg bg-secondary/50 p-6">
                  <div className="text-center">
                    <div className='flex items-center justify-center gap-2'>
                        <p className="font-bold text-primary text-2xl">{userData.credits}</p>
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      نقطة متبقية
                    </p>
                    <Progress value={creditPercentage} className="mt-2 h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full" onClick={() => router.push('/packages')}>
                      <ShoppingBag className="ml-2 h-4 w-4" />
                      شراء نقاط
                    </Button>
                    <Button className="w-full bg-gradient-to-l from-primary to-amber-400 font-bold text-primary-foreground hover:to-amber-500 shine-effect" onClick={() => router.push('/packages')}>
                      <Crown className="ml-2 h-4 w-4" />
                      ترقية الباقة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3 font-headline text-2xl font-bold">
                  <Users className="h-6 w-6 text-primary" />
                  <span>ملفات الأطفال (0)</span>
                </CardTitle>
                <Button variant="ghost" size="sm">
                  <Edit2 className="ml-2 h-4 w-4" />
                  إدارة
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-secondary/30 p-12 text-center">
                  <Users className="h-16 w-16 text-muted-foreground/50" />
                  <p className="mt-4 font-semibold text-muted-foreground">
                    لم تقم بإضافة أي ملف طفل بعد
                  </p>
                  <Button className="mt-6 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold shine-effect">
                    <PlusCircle className="ml-2 h-5 w-5" />
                    إضافة طفل
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-headline text-2xl font-bold">
                  <Settings className="h-6 w-6 text-primary" />
                  <span>إجراءات سريعة</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => router.push('/packages')}>
                  <CreditCard className="h-6 w-6" />
                  <span>الاشتراك</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => router.push('/create/image')}>
                  <Download className="h-6 w-6" />
                  <span>تلوين</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => router.push('/create/story')}>
                  <Pencil className="h-6 w-6" />
                  <span>قصة جديدة</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => router.push('/library')}>
                  <Eye className="h-6 w-6" />
                  <span>مكتبتي</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Left Column */}
          <div className="order-1 lg:order-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-end gap-3 font-headline text-2xl font-bold">
                  <span>البيانات الشخصية</span>
                  <User className="h-6 w-6 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-right">
                <div className="flex flex-col items-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{userData.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {userData.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    البريد الإلكتروني
                  </label>
                  <div className="flex items-center justify-end gap-3 rounded-lg bg-secondary/50 p-3">
                    <span>{userData.email}</span>
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Lock className="ml-2 h-4 w-4" />
                  تغيير كلمة المرور
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AccountPage);
