import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mock data for now. We will fetch this from Firestore later.
const stories = [
  {
    id: '1',
    title: 'مغامرة في الصحراء',
    thumbnailUrl: 'https://picsum.photos/400/400',
    pages: [],
  },
    {
    id: '2',
    title: 'يوم في السوق',
    thumbnailUrl: 'https://picsum.photos/400/400',
    pages: [],
  },
];

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-yellow-50/30">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-10 text-right">
          <h1 className="font-headline text-4xl font-bold text-foreground">مكتبتي</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            كل قصصك المحفوظة في مكان واحد
          </p>
        </header>

        {stories.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {stories.map((story) => (
              <Card key={story.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full">
                    <Image
                      src={story.thumbnailUrl}
                      alt={story.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="storybook cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-lg">{story.title}</h2>
                    <Link href={`/story/${story.id}`} className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">
                      <Eye className="h-4 w-4" />
                      عرض القصة
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-secondary/30 p-12 text-center min-h-[400px]">
            <BookOpen className="h-16 w-16 text-muted-foreground/50" />
            <p className="mt-4 font-semibold text-muted-foreground">
              مكتبتك فارغة حالياً
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              احفظ القصص التي تنشئها للوصول إليها هنا.
            </p>
            <Link href="/create/story" className="mt-6">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
                أنشئ قصتك الأولى
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
