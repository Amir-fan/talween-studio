import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Image as ImageIcon, Pencil, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    icon: <ImageIcon className="h-10 w-10 text-accent" />,
    title: 'من صورة',
    description: 'حوّل صورك العائلية أو رسوماتك إلى صفحات تلوين فريدة.',
    link: '/create',
  },
  {
    icon: <Pencil className="h-10 w-10 text-accent" />,
    title: 'من كلمة',
    description: 'اكتب كلمة ودع الذكاء الاصطناعي يرسم لك عالمًا كاملاً لتلوينه.',
    link: '/create/word',
  },
  {
    icon: <BookOpen className="h-10 w-10 text-accent" />,
    title: 'من قصة',
    description: 'اصنع قصة قصيرة واحصل على كتاب تلوين خاص بك مع كل صفحة.',
    link: '/create',
  },
  {
    icon: <Sparkles className="h-10 w-10 text-accent" />,
    title: 'قوالب جاهزة',
    description: 'اختر من مكتبتنا الغنية بالرسومات الجاهزة للتلوين فورًا.',
    link: '/create',
  },
];

export default function Home() {
  return (
    <div className="bg-background">
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-right">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              مرحباً بك في <span className="text-primary">تلوين</span> – عالمك الممتع للتلوين والتعلم 🎨
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              حوّل صورك وكلماتك وقصصك إلى رسومات تلوين جاهزة للطباعة أو التلوين أونلاين. أطلق العنان لإبداع طفلك!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Button asChild size="lg" className="font-bold">
                <Link href="/create">ابدأ الآن مجاناً</Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <Image
              src="https://placehold.co/600x600.png"
              alt="طفلة سعيدة تلون"
              width={600}
              height={600}
              className="rounded-full shadow-2xl"
              data-ai-hint="happy child drawing cartoon"
            />
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              إبداع بلا حدود، بطريقتك الخاصة
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              سواء كانت لديك فكرة أو صورة، لدينا الأدوات لتحويلها إلى تحفة فنية.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="transform text-center transition-transform hover:scale-105 hover:shadow-lg">
                <CardHeader>
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                    {feature.icon}
                  </div>
                  <CardTitle className="mt-4 font-headline text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
