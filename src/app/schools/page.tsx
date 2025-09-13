'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { School, Clock, Users, Star, BookOpen } from 'lucide-react';

export default function SchoolsPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <School className="h-16 w-16 text-primary" />
            <h1 className="font-headline text-5xl font-bold text-foreground">المدارس</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            منصة تعليمية متكاملة للمدارس والمعلمين
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="text-center p-12">
            <CardHeader>
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="font-headline text-4xl font-bold text-foreground mb-4">
                قريباً جداً
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground">
                نحن نعمل بجد لتطوير منصة المدارس المتكاملة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center p-6 rounded-lg bg-primary/5">
                  <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">إدارة الطلاب</h3>
                  <p className="text-muted-foreground text-sm">
                    إدارة شاملة لطلاب المدرسة وإنشاء حسابات جماعية
                  </p>
                </div>
                <div className="text-center p-6 rounded-lg bg-primary/5">
                  <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">مكتبة المدرسة</h3>
                  <p className="text-muted-foreground text-sm">
                    مكتبة مشتركة لجميع قصص وتلوينات الطلاب
                  </p>
                </div>
                <div className="text-center p-6 rounded-lg bg-primary/5">
                  <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">تقارير متقدمة</h3>
                  <p className="text-muted-foreground text-sm">
                    تقارير مفصلة عن تقدم الطلاب وإنجازاتهم
                  </p>
                </div>
              </div>
              
              <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
                <h3 className="font-semibold text-xl mb-4">كن أول من يعرف</h3>
                <p className="text-muted-foreground mb-6">
                  سجل بريدك الإلكتروني لنخبرك فور إطلاق منصة المدارس
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="بريدك الإلكتروني"
                    className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-right"
                    dir="rtl"
                  />
                  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    إشعارني
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
