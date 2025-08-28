
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Crown, Heart, Star, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const pointsPackages = [
  {
    title: 'باقة المبتدئين',
    points: 25,
    price: 4.9,
    icon: <Star className="h-8 w-8" />,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
    buttonClass: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white',
  },
  {
    title: 'الاختيار الذكي',
    points: 60,
    price: 9.8,
    icon: <Heart className="h-8 w-8" />,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
    buttonClass: 'bg-gradient-to-r from-pink-500 to-red-500 text-white',
    badge: 'الأكثر شيوعًا',
    highlight: true,
  },
  {
    title: 'باقة متقدمة',
    points: 130,
    price: 17.9,
    icon: <Crown className="h-8 w-8" />,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    buttonClass: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white',
    savings: 'خصم 15%',
  },
  {
    title: 'باقة VIP',
    points: 300,
    price: 34.2,
    icon: <Star className="h-8 w-8" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    buttonClass: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
    savings: 'خصم 30%',
    badge: 'أفضل قيمة',
  },
];

const subscriptionPackages = [
  {
    title: 'راحة البال',
    price: 12.7,
    points: '80 نقطة/شهريًا',
    features: ['ميزات بريميوم', 'وصول للمحتوى الحصري', 'دعم فني'],
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    buttonClass: 'bg-gradient-to-r from-green-500 to-teal-600 text-white',
    highlight: false,

  },
  {
    title: 'ملكة التلوين',
    price: 22.5,
    points: '160 نقطة/شهريًا',
    features: ['كل ميزات "راحة البال"', 'ميزات VIP', 'دعم فوري', 'قصص مخصصة جدًا'],
    color: 'text-rose-500',
    bgColor: 'bg-rose-50',
    buttonClass: 'bg-gradient-to-r from-rose-500 to-red-600 text-white',
    badge: 'الأكثر شيوعًا',
    highlight: true,
  },
  {
    title: 'العائلة المبدعة',
    price: 32.2,
    points: '280 نقطة/شهريًا',
    features: ['كل ميزات "ملكة التلوين"', 'حسابات متعددة للأطفال', 'ورش عمل حصرية'],
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
    buttonClass: 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white',
  },
];

export default function PackagesPage() {

    return (
    <div className="min-h-screen bg-yellow-50/30">
      <div className="container mx-auto px-4 py-16">
        <header className="mb-12 text-center">
          <h1 className="font-headline text-4xl font-bold text-foreground">
            اختر الباقة المثالية لطفلك 💝
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            انضم إلى أكثر من 2,847 أم اختارت راحة البال معنا
          </p>
        </header>

        <Tabs defaultValue="points" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="points">شراء نقاط</TabsTrigger>
                <TabsTrigger value="subscriptions">اشتراكات شهرية</TabsTrigger>
            </TabsList>
            <TabsContent value="points">
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mt-8">
                    {pointsPackages.map((pkg) => (
                        <Card key={pkg.title} className={cn('relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 animate-float', pkg.highlight && 'border-primary border-2 shadow-lg')}>
                            {pkg.badge && <div className="absolute top-0 right-0 -mr-1 -mt-1 rounded-bl-lg rounded-tr-xl bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">{pkg.badge}</div>}
                            <CardHeader className="items-center text-center p-6">
                                <div className={cn('flex h-16 w-16 items-center justify-center rounded-full', pkg.bgColor, pkg.color)}>
                                    {pkg.icon}
                                </div>
                                <CardTitle className="mt-4 font-headline text-2xl">{pkg.title}</CardTitle>
                                <div className="mt-2">
                                    <span className="text-4xl font-bold">${pkg.price}</span>
                                </div>
                                <CardDescription className="font-bold text-lg">{pkg.points} نقطة</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow text-center">
                                {pkg.savings && <p className="font-semibold text-green-600">{pkg.savings}</p>}
                            </CardContent>
                            <CardFooter className="p-6">
                                <Button size="lg" className={cn('w-full font-bold shine-effect', pkg.buttonClass)}>اختر هذه الباقة</Button>
                            </CardFooter>
                        </Card>
                    ))}
                 </div>
            </TabsContent>
            <TabsContent value="subscriptions">
                 <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-8">
                    {subscriptionPackages.map((pkg) => (
                        <Card key={pkg.title} className={cn('relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 animate-float', pkg.highlight && 'border-primary border-2 shadow-lg')}>
                            {pkg.badge && <div className="absolute top-0 right-0 -mr-1 -mt-1 rounded-bl-lg rounded-tr-xl bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">{pkg.badge}</div>}
                            <CardHeader className="items-center text-center p-6">
                                <CardTitle className="mt-4 font-headline text-2xl">{pkg.title}</CardTitle>
                                <div className="mt-2">
                                    <span className="text-4xl font-bold">${pkg.price}</span>
                                    <span className="text-muted-foreground">/شهريًا</span>
                                </div>
                                <CardDescription className="font-bold text-lg">{pkg.points}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-3 text-right">
                                    {pkg.features.map(feature => (
                                        <li key={feature} className="flex items-center justify-end gap-3">
                                            <span>{feature}</span>
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="p-6">
                                <Button size="lg" className={cn('w-full font-bold shine-effect', pkg.buttonClass)}>ابدأ الآن</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
