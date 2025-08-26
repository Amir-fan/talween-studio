'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Eye,
  Loader2,
  Search,
  Filter,
  Star,
  Download,
  Heart,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Story {
  id: string;
  title: string;
  thumbnailUrl: string;
}

const tabs = [
    { name: 'مشاريعي', icon: LayoutDashboard, current: true },
    { name: 'قصصي', icon: BookOpen, current: false },
    { name: 'القوالب المحفوظة', icon: Star, current: false },
    { name: 'مشترياتي', icon: Download, current: false },
]

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
        <header className="mb-10 text-center flex flex-col items-center">
            <div className="flex items-center gap-4 mb-4 bg-white rounded-2xl px-6 py-3 shadow-sm">
                 <BookOpen className="h-10 w-10 text-primary" />
                 <h1 className="font-headline text-5xl font-bold text-foreground">مكتبتي</h1>
            </div>
            <p className="mt-2 text-lg text-muted-foreground">
                جميع إبداعاتك وقصصك في مكان واحد
            </p>
        </header>

        <div className="mb-8">
            <div className="bg-white rounded-full p-2 shadow-md max-w-lg mx-auto flex items-center justify-between">
                {tabs.map((tab) => (
                    <Button 
                        key={tab.name} 
                        variant={tab.current ? 'default' : 'ghost'}
                        className={cn("rounded-full flex-1", tab.current && 'bg-primary text-primary-foreground shadow')}
                    >
                       <tab.icon className="ml-2 h-4 w-4" />
                        <span>{tab.name}</span>
                    </Button>
                ))}
            </div>
        </div>

        <div className="mb-8 flex items-center gap-4">
            <div className="relative flex-grow">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="البحث في مكتبتي..." className="w-full rounded-full bg-white pr-12 py-6 shadow-sm" />
            </div>
             <Select defaultValue='latest'>
                <SelectTrigger className="w-[180px] rounded-full bg-white py-6 shadow-sm">
                    <SelectValue placeholder="الترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="latest">الأحدث</SelectItem>
                    <SelectItem value="oldest">الأقدم</SelectItem>
                    <SelectItem value="most-liked">الأكثر إعجاباً</SelectItem>
                    <SelectItem value="alpha-asc">أبجدي (أ-ي)</SelectItem>
                    <SelectItem value="alpha-desc">أبجدي (ي-أ)</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="outline" size="lg" className="rounded-full bg-white shadow-sm">
                <Filter className="h-5 w-5" />
            </Button>
        </div>


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
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {stories.map((story, index) => (
              <Card key={story.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 rounded-2xl">
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
                        <div className="absolute top-3 left-3 flex gap-2">
                           <span className="rounded-full bg-green-500/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">مكتمل</span>
                        </div>
                        <div className="absolute top-3 right-3">
                            <Button size="icon" className="rounded-full bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                                <Heart className="h-5 w-5" />
                            </Button>
                        </div>
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
             <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 rounded-2xl">
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full">
                        <div className="flex h-full w-full items-center justify-center bg-secondary">
                            <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                        </div>
                        <div className="absolute top-3 left-3 flex gap-2">
                           <span className="rounded-full bg-orange-500/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">جاري العمل</span>
                        </div>
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold text-lg truncate">قصة الديناصور اللطيف</h2>
                     <p className="text-sm text-muted-foreground">اكمل الإنشاء</p>
                  </div>
                </CardContent>
              </Card>
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
