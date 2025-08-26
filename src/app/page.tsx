
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Camera, ShieldCheck, Star, CircleCheckBig } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-background">
      <section className="bg-gradient-to-b from-yellow-50/0 via-white/0 to-white/0 py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-md lg:max-w-none mx-auto">
                <Image
                  src="https://images.unsplash.com/photo-1612539466809-8be5e4e01256?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxraWRzJTIwY29sb3Jpbmd8ZW58MHx8fHwxNzU2MTMxMzYzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="أطفال سعداء يلونون"
                  width={600}
                  height={600}
                  className="rounded-3xl object-cover shadow-2xl aspect-square"
                  data-ai-hint="happy children coloring cartoon"
                />
              </div>
              <div className="absolute -top-4 -right-4 rounded-full bg-green-100 p-3 shadow-md">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z"
                    fill="#34D399"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center lg:text-right">
                <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  أشعل خيال طفلك <span className="text-primary">بطل القصة</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  حوّل الكلمات إلى قصص جميلة وصفحات تلوين بقوة الذكاء الاصطناعي
                </p>
                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <Button asChild size="lg" className="w-full rounded-full bg-gradient-to-l from-primary to-orange-500 font-bold text-primary-foreground hover:from-primary/90 hover:to-orange-500/90 sm:w-auto">
                    <Link href="/create">
                      <BookOpen className="ml-2 h-5 w-5" />
                      أنشئ قصة
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full border-0 bg-gradient-to-r from-accent to-cyan-400 font-bold text-white sm:w-auto hover:from-accent/90 hover:to-cyan-400/90"
                  >
                    <Link href="/create/word">
                      <Camera className="ml-2 h-5 w-5" />
                      صورة – تلوين
                    </Link>
                  </Button>
                </div>
                <Card className="mt-8 bg-yellow-100/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-yellow-200 p-2">
                        <Star className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">جرب مجاناً الآن!</h3>
                        <p className="text-sm text-muted-foreground">
                          3 قصص مجانية بدون تسجيل
                        </p>
                      </div>
                    </div>
                    <Button size="sm">جرب مجاناً</Button>
                  </div>
                </Card>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>أمن وخاص للأطفال</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheckBig className="h-4 w-4 text-green-500" />
                    <span>معتمد من المعلمين</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-green-500" />
                    <span>محبوب من العائلات</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/50 py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              كيف نجعل طفلك بطل القصة
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              اغرس القيم الإسلامية والأخلاقية في قصص مخصصة بـ 3 خطوات بسيطة
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="relative flex flex-col items-center p-8 text-center transition-transform duration-300 ease-in-out hover:-translate-y-2 bg-white/50">
              <div className="absolute -top-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white ring-8 ring-secondary/50">
                1
              </div>
              <h3 className="mt-4 font-headline text-xl font-bold">
                إنشاء القصة
              </h3>
              <p className="mt-2 text-muted-foreground">
                اختر شخصياتك وأدخل أفكارك ودع الذكاء الاصطناعي يكتب لك قصة
                فريدة.
              </p>
            </Card>
            <Card className="relative flex flex-col items-center p-8 text-center transition-transform duration-300 ease-in-out hover:-translate-y-2 bg-white/50">
              <div className="absolute -top-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white ring-8 ring-secondary/50">
                2
              </div>
              <h3 className="mt-4 font-headline text-xl font-bold">
                التلوين والإبداع
              </h3>
              <p className="mt-2 text-muted-foreground">
                استخدم أدوات التلوين الرقمية لإضفاء الحياة على صفحات قصتك.
              </p>
            </Card>
            <Card className="relative flex flex-col items-center p-8 text-center transition-transform duration-300 ease-in-out hover:-translate-y-2 bg-white/50">
              <div className="absolute -top-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white ring-8 ring-secondary/50">
                3
              </div>
              <h3 className="mt-4 font-headline text-xl font-bold">
                المشاركة والحفظ
              </h3>
              <p className="mt-2 text-muted-foreground">
                احفظ إبداعاتك في مكتبتك الخاصة، شاركها مع العائلة أو اطبعها.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
