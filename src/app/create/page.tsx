'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Image as ImageIcon, Sparkles, Type, FileImage, Bot, Lock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const creationOptions = [
  {
    href: '/create/word',
    title: 'الكلمات - الصورة',
    description: 'اكتب فكرة واحصل على رسوم خطية رائعة.',
    icon: <Type className="h-12 w-12" />,
    buttonText: 'ابدأ الإنشاء',
    buttonClass: 'bg-gradient-to-br from-sky-400 to-indigo-600 hover:from-sky-500 hover:to-indigo-700 text-white',
    badge: (
      <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
        <Bot className="h-4 w-4" />
        <span>"تنين"</span>
      </div>
    ),
  },
  {
    href: '/create/image',
    title: 'الصورة - التلوين',
    description: 'حوّل أي صورة إلى رسمة خطوط واضحة مثالية للتلوين.',
    icon: <ImageIcon className="h-12 w-12" />,
    buttonText: 'ابدأ الإنشاء',
    buttonClass: 'bg-gradient-to-br from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600 text-white',
    badge: (
      <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
        <div className="h-3 w-3 rounded-full bg-red-500"></div>
        <div className="h-3 w-3 rounded-full bg-green-500"></div>
        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
      </div>
    ),
    disabled: false,
  },
  {
    href: '/create/templates',
    title: 'القوالب الجاهزة',
    description: 'مئات القوالب الجاهزة مصنفة حسب الموضوع والصعوبة.',
    icon: <FileImage className="h-12 w-12" />,
    buttonText: 'ابدأ الإنشاء',
    buttonClass: 'bg-gradient-to-br from-green-400 to-cyan-500 hover:from-green-500 hover:to-cyan-600 text-white',
    badge: (
      <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
        <span>🎨</span>
        <span>✨</span>
        <span>🦕</span>
      </div>
    ),
    disabled: false,
  },
  {
    href: '/create/story',
    title: 'منشئ القصص',
    description: 'أنشئ كتب قصص تلوين شخصية مع مغامرات مثيرة.',
    icon: <BookOpen className="h-12 w-12" />,
    buttonText: 'ابدأ الإنشاء',
    buttonClass: 'bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white',
    badge: (
      <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
        <span>✏️</span>
        <span>➕</span>
        <span>📖</span>
      </div>
    ),
    disabled: false,
  },
];

function CreatePage() {
  const { user, userData, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/create');
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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري توجيهك إلى تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50/50">
      <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="font-headline text-3xl font-bold text-foreground">
              مركز الإنشاء
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            اختر كيف تريد إنشاء تحفتك التلوينية التالية!
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {creationOptions.map((option) => (
            <Link key={option.title} href={!option.disabled ? option.href : '#'} className={option.disabled ? 'pointer-events-none' : ''}>
              <Card className={`relative h-full overflow-hidden text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${option.disabled ? 'opacity-60' : ''}`}>
                {option.badge}
                <CardHeader className="flex flex-col items-center pt-12">
                  <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    {option.icon}
                  </div>
                  <CardTitle className="font-headline text-2xl font-bold">{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="min-h-[40px]">{option.description}</CardDescription>
                </CardContent>
                <CardFooter className="flex justify-center p-6">
                    <Button size="lg" className={`w-full max-w-xs font-bold rounded-full shine-effect ${option.buttonClass}`}>
                      {option.buttonText}
                    </Button>
                </CardFooter>
                 {option.disabled && (
                    <div className="absolute bottom-4 right-4 text-xs font-bold text-accent">قريباً!</div>
                  )}
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreatePage;