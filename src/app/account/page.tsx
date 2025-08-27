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
  LogOut,
} from 'lucide-react';
import withAuth from '@/hoc/withAuth';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';

function AccountPage() {
  const { user, userData, logout } = useAuth();
  
  const creditPercentage = userData && userData.credits ? (userData.credits / 10) * 100 : 0;

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
                  تجريبي
                </span>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4 rounded-lg bg-secondary/50 p-6 text-right">
                  <div className="flex justify-between">
                    <span className="font-bold">تجريبي</span>
                    <span className="text-muted-foreground">الباقة الحالية:</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-green-600">نشط</span>
                    <span className="text-muted-foreground">الحالة:</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">١٤٤٧/٣/٩ هـ</span>
                    <span className="text-muted-foreground">تاريخ الانتهاء:</span>
                  </div>
                </div>
                <div className="space-y-4 rounded-lg bg-secondary/50 p-6">
                  <div className="text-center">
                    <p className="font-bold text-primary">{userData?.credits ?? '0'}</p>
                    <p className="text-sm text-muted-foreground">
                      نقطة متبقية
                    </p>
                    <Progress value={creditPercentage} className="mt-2 h-2" />
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/packages">
                        <ShoppingBag className="ml-2 h-4 w-4" />
                        شراء نقاط
                      </Link>
                    </Button>
                    <Button asChild className="w-full bg-gradient-to-l from-primary to-amber-400 font-bold text-primary-foreground hover:to-amber-500">
                      <Link href="/packages">
                         <Crown className="ml-2 h-4 w-4" />
                         ترقية الباقة
                      </Link>
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
                  <Button className="mt-6">
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
                <Button asChild variant="outline" className="h-24 flex-col gap-2">
                  <Link href="/packages">
                    <CreditCard className="h-6 w-6" />
                    <span>الاشتراك</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-24 flex-col gap-2">
                  <Link href="/create/word">
                    <Download className="h-6 w-6" />
                    <span>تلوين</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-24 flex-col gap-2">
                  <Link href="/create/story">
                    <Pencil className="h-6 w-6" />
                    <span>قصة جديدة</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-24 flex-col gap-2">
                  <Link href="/library">
                    <Eye className="h-6 w-6" />
                    <span>مكتبتي</span>
                  </Link>
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
                {user && (
                    <>
                        <div className="flex flex-col items-center">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20 text-orange-400">
                                <User className="h-12 w-12" />
                            </div>
                            <h3 className="mt-4 text-xl font-bold">{userData?.name || 'مستخدم جديد'}</h3>
                            <p className="text-sm text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                البريد الإلكتروني
                            </label>
                            <div className="flex items-center justify-end gap-3 rounded-lg bg-secondary/50 p-3">
                                <span>{user.email}</span>
                                <Mail className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                        <Button asChild variant="outline" className="w-full">
                           <Link href="/forgot-password">
                                <Lock className="ml-2 h-4 w-4" />
                                تغيير كلمة المرور
                           </Link>
                        </Button>
                         <Button variant="destructive" className="w-full" onClick={logout}>
                            <LogOut className="ml-2 h-4 w-4" />
                            تسجيل الخروج
                        </Button>
                    </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AccountPage);
