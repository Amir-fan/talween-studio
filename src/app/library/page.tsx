
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

interface Story {
  id: string;
  title: string;
  thumbnailUrl: string;
}

export default function LibraryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      try {
        const storiesCollection = collection(db, 'stories');
        const storySnapshot = await getDocs(storiesCollection);
        const storiesList = storySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
          id: doc.id,
          ...(doc.data() as Omit<Story, 'id'>),
        }));
        setStories(storiesList);
      } catch (error) {
        console.error("Failed to fetch stories:", error);
        // Optionally, show a toast notification for the error
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50/30">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-10 text-right">
          <h1 className="font-headline text-4xl font-bold text-foreground">مكتبتي</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            كل قصصك المحفوظة في مكان واحد
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {stories.map((story) => (
              <Card key={story.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="p-0">
                  <Link href={`/story/${story.id}`}>
                    <div className="relative aspect-square w-full">
                        {story.thumbnailUrl ? (
                            <Image
                                src={story.thumbnailUrl}
                                alt={story.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint="storybook cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-secondary">
                                <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                            </div>
                        )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  </Link>
                  <div className="p-4">
                    <h2 className="font-bold text-lg truncate">{story.title}</h2>
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
            <Button asChild className="mt-6">
                <Link href="/create/story">
                    أنشئ قصتك الأولى
                </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
