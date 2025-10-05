'use client';

import { useLibrary } from '@/context/library-context';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Download, BookOpen, Image as ImageIcon, Camera, Trash2, Calendar } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LibraryPage() {
  const { libraryItems, removeFromLibrary, loading } = useLibrary();
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'story' | 'text-to-coloring' | 'image-to-coloring'>('all');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>يجب تسجيل الدخول</CardTitle>
            <CardDescription>يجب عليك تسجيل الدخول للوصول إلى مكتبتك الشخصية</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/login')} className="w-full">
              تسجيل الدخول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل مكتبتك...</p>
        </div>
      </div>
    );
  }

  const filteredItems = filter === 'all' 
    ? libraryItems 
    : libraryItems.filter(item => item.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story':
        return <BookOpen className="h-5 w-5" />;
      case 'text-to-coloring':
        return <ImageIcon className="h-5 w-5" />;
      case 'image-to-coloring':
        return <Camera className="h-5 w-5" />;
      default:
        return <Heart className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'story':
        return 'قصة';
      case 'text-to-coloring':
        return 'تلوين من النص';
      case 'image-to-coloring':
        return 'تلوين من الصورة';
      default:
        return 'عنصر';
    }
  };

  const downloadItem = (item: any) => {
    if (item.type === 'story') {
      // For stories, we'll create a simple download
      const link = document.createElement('a');
      link.href = item.imageDataUri;
      link.download = `${item.title}.png`;
      link.click();
    } else {
      // For coloring pages
      const link = document.createElement('a');
      link.href = item.imageDataUri;
      link.download = `${item.title}.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">مكتبتي الشخصية</h1>
          <p className="text-gray-600 mt-2">جميع القصص وصفحات التلوين التي حفظتها</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              الكل ({libraryItems.length})
            </Button>
            <Button
              variant={filter === 'story' ? 'default' : 'outline'}
              onClick={() => setFilter('story')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              القصص ({libraryItems.filter(item => item.type === 'story').length})
            </Button>
            <Button
              variant={filter === 'text-to-coloring' ? 'default' : 'outline'}
              onClick={() => setFilter('text-to-coloring')}
              className="flex items-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              تلوين من النص ({libraryItems.filter(item => item.type === 'text-to-coloring').length})
            </Button>
            <Button
              variant={filter === 'image-to-coloring' ? 'default' : 'outline'}
              onClick={() => setFilter('image-to-coloring')}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              تلوين من الصورة ({libraryItems.filter(item => item.type === 'image-to-coloring').length})
            </Button>
          </div>
        </div>

        {/* Library Items */}
        {filteredItems.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">لا توجد عناصر بعد</h3>
              <p className="text-gray-600 mb-6">ابدأ بإنشاء قصة أو صفحة تلوين لحفظها هنا.</p>
              <Button onClick={() => router.push('/create')}>ابدأ الآن</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <div className="aspect-square w-full overflow-hidden">
                    <Image
                      src={item.imageDataUri}
                      alt={item.title}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {getTypeIcon(item.type)}
                      {getTypeLabel(item.type)}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        removeFromLibrary(item.id);
                        toast({
                          title: "تم الحذف",
                          description: "تم حذف العنصر من مكتبتك",
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  
                  {/* Metadata */}
                  <div className="space-y-1 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                    </div>
                    {item.childName && (
                      <div className="text-xs text-gray-500">
                        لـ {item.childName}
                      </div>
                    )}
                    {item.difficulty && (
                      <div className="text-xs text-gray-500">
                        مستوى: {item.difficulty}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => downloadItem(item)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 ml-1" />
                      تحميل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}