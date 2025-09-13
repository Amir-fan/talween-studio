
'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StoryData {
  title: string;
}

interface PageData {
  id: string;
  text: string;
  imageUrl: string;
}

export default function StoryPage({ params }: { params: { id: string } }) {
  const [story, setStory] = useState<StoryData | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = params;

  useEffect(() => {
    if (!id) return;

    // Since Firebase is removed, show a message that stories are not available
    setError("القصص غير متاحة حالياً. تم إزالة قاعدة البيانات.");
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-12">
            <header className="mb-10 flex justify-between items-center">
                 <Skeleton className="h-10 w-24" />
                 <Skeleton className="h-10 w-48" />
            </header>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                </CardHeader>
                <CardContent className="space-y-8">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-3">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                            </div>
                            <Skeleton className="aspect-square w-full rounded-lg" />
                        </div>
                     ))}
                </CardContent>
            </Card>
        </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-destructive">{error}</h2>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/library">العودة إلى المكتبة</Link>
        </Button>
      </div>
    );
  }

  if (!story) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-yellow-50/30">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-10 flex items-center justify-between">
            <Button asChild variant="outline" className="rounded-full font-bold">
                <Link href="/library">
                    <ArrowRight className="ml-2 h-4 w-4" />
                    العودة للمكتبة
                </Link>
            </Button>
            <div className="text-right">
                <h1 className="font-headline text-4xl font-bold text-foreground">{story.title}</h1>
            </div>
        </header>

        <Card>
          <CardContent className="p-8 space-y-12">
            {pages.length > 0 ? (
              pages.map((page, index) => (
                <div key={page.id} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className={`order-2 ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                    <p className="leading-loose text-xl text-gray-700">{page.text}</p>
                  </div>
                  <div className={`order-1 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                    <Image
                      src={page.imageUrl}
                      alt={`Illustration for page ${index + 1}`}
                      width={600}
                      height={600}
                      className="rounded-lg border bg-white shadow-lg w-full object-contain aspect-square"
                    />
                  </div>
                </div>
              ))
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">لم يتم العثور على صفحات لهذه القصة.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
