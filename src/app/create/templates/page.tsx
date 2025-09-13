import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-yellow-50/30">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between">
          <Button asChild variant="outline" className="rounded-full font-bold">
            <Link href="/create">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة
            </Link>
          </Button>
          <div className="text-right">
            <h1 className="font-headline text-3xl font-bold text-foreground">
              القوالب الجاهزة
            </h1>
            <p className="mt-1 text-muted-foreground">
              تحت الإنشاء
            </p>
          </div>
        </header>
         <div className="mt-8 flex h-96 items-center justify-center rounded-lg bg-secondary/50">
            <p className="text-muted-foreground">سيتم بناء هذه الصفحة قريبًا.</p>
        </div>
      </div>
    </div>
  );
}
