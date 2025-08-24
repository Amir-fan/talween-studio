import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Image as ImageIcon, Pencil, Sparkles } from 'lucide-react';
import Link from 'next/link';

const creationOptions = [
  {
    href: '/create/word',
    title: 'أنشئ من كلمة',
    description: 'اكتب فكرتك ودع الذكاء الاصطناعي يبدع لك رسمة.',
    icon: <Pencil className="h-8 w-8" />,
    enabled: true,
  },
  {
    href: '#',
    title: 'حوّل صورة',
    description: 'ارفع صورة لنحولها إلى صفحة تلوين جاهزة.',
    icon: <ImageIcon className="h-8 w-8" />,
    enabled: false,
  },
  {
    href: '#',
    title: 'اصنع قصة',
    description: 'ولّد قصة مصورة من عدة صفحات جاهزة للتلوين.',
    icon: <BookOpen className="h-8 w-8" />,
    enabled: false,
  },
  {
    href: '#',
    title: 'استخدم قالب',
    description: 'اختر من مكتبة القوالب الجاهزة لدينا.',
    icon: <Sparkles className="h-8 w-8" />,
    enabled: false,
  },
];

export default function CreatePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-bold text-foreground">اختر الطريقة التي تحبها للإبداع</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          كل الطرق تؤدي إلى المرح! اختر نقطة البداية لمشروعك القادم.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        {creationOptions.map((option) => (
          <Link key={option.title} href={option.enabled ? option.href : '#'} className={!option.enabled ? 'pointer-events-none' : ''}>
            <Card className={`h-full transition-all hover:shadow-lg hover:border-primary ${!option.enabled ? 'bg-muted/50 opacity-60' : 'hover:scale-105'}`}>
              <CardHeader className="flex flex-row items-center gap-6">
                <div className="text-primary">{option.icon}</div>
                <div>
                  <CardTitle className="font-headline text-2xl font-bold">{option.title}</CardTitle>
                  <CardDescription className="mt-1">{option.description}</CardDescription>
                  {!option.enabled && (
                    <div className="mt-2 text-xs font-bold text-accent">قريباً!</div>
                  )}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
