import Link from 'next/link';
import { ColoringSection } from './coloring-section';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreateWithWordPage() {
  return (
    <div className="min-h-screen bg-yellow-50/30">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between">
          <div className="text-right">
            <h1 className="font-headline text-3xl font-bold text-foreground">
              من الكلمات إلى الصور
            </h1>
            <p className="mt-1 text-muted-foreground">
              اكتب فكرة واحصل على 3 خيارات رائعة للتلوين
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full font-bold">
            <Link href="/create">
              العودة
              <ChevronLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </header>
        <ColoringSection />
      </div>
    </div>
  );
}
