import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Camera, CheckCircle, ShieldCheck, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-background">
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="flex items-center justify-center lg:order-last">
            <div className="text-center lg:text-right">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                أشعل خيال طفلك <span className="text-primary">بطل القصة</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                حوّل الكلمات إلى قصص جميلة وصفحات تلوين بقوة الذكاء الاصطناعي
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" className="w-full font-bold sm:w-auto">
                  <Link href="/create">
                    <BookOpen className="ml-2 h-5 w-5" />
                    أنشئ قصة
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full border-2 border-accent bg-accent/10 font-bold text-accent-foreground hover:bg-accent/20 hover:text-accent-foreground sm:w-auto" style={{color: '#00AEEF'}}>
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
                      <p className="text-sm text-muted-foreground">3 قصص مجانية بدون تسجيل</p>
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
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>معتمد من المعلمين</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-green-500" />
                    <span>محبوب من العائلات</span>
                  </div>
              </div>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <Image
              src="https://placehold.co/600x500.png"
              alt="أطفال سعداء يلونون"
              width={600}
              height={500}
              className="rounded-3xl shadow-2xl"
              data-ai-hint="happy children coloring cartoon"
            />
            <div className="absolute -top-4 -left-4 rounded-full bg-green-100 p-3 shadow-md">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 16.5V7.5L16 12L10 16.5Z" fill="#34D399"/>
                </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              كيف نجعل طفلك بطل القصة
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              اغرس القيم الإسلامية والأخلاقية في قصص مخصصة بـ 3 خطوات بسيطة
            </p>
          </div>
          <div className="relative mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
             <div className="absolute top-1/2 left-0 h-0.5 w-full -translate-y-1/2 bg-border"></div>
             <div className="relative flex flex-col items-center text-center">
                <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white">1</div>
                <h3 className="mt-4 font-headline text-xl font-bold">إنشاء القصة</h3>
                <p className="mt-2 text-muted-foreground">اختر شخصياتك وأدخل أفكارك ودع الذكاء الاصطناعي يكتب لك قصة فريدة.</p>
             </div>
             <div className="relative flex flex-col items-center text-center">
                <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white">2</div>
                <h3 className="mt-4 font-headline text-xl font-bold">التلوين والإبداع</h3>
                <p className="mt-2 text-muted-foreground">استخدم أدوات التلوين الرقمية لإضفاء الحياة على صفحات قصتك.</p>
             </div>
             <div className="relative flex flex-col items-center text-center">
                <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white">3</div>
                <h3 className="mt-4 font-headline text-xl font-bold">المشاركة والحفظ</h3>
                <p className="mt-2 text-muted-foreground">احفظ إبداعاتك في مكتبتك الخاصة، شاركها مع العائلة أو اطبعها.</p>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
