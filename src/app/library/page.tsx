'use client';

import { useState } from 'react';
import {
  BookOpen,
  Eye,
  Search,
  Filter,
  Star,
  Download,
  Heart,
  Palette,
  Library as LibraryIcon,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface LibraryItem {
  id: string;
  title: string;
  type: 'story' | 'coloring' | 'image';
  thumbnail: string;
  createdAt: string;
  status: 'draft' | 'published' | 'favorite';
}

export default function LibraryPage() {
  const { user, userData } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Mock data for demonstration
  const mockItems: LibraryItem[] = [
    {
      id: '1',
      title: 'مغامرة أحمد في الغابة',
      type: 'story',
      thumbnail: '/api/placeholder/300/200',
      createdAt: '2024-01-15',
      status: 'published'
    },
    {
      id: '2',
      title: 'صفحة تلوين - تنين',
      type: 'coloring',
      thumbnail: '/api/placeholder/300/200',
      createdAt: '2024-01-14',
      status: 'favorite'
    },
    {
      id: '3',
      title: 'تحويل صورة عائلية',
      type: 'image',
      thumbnail: '/api/placeholder/300/200',
      createdAt: '2024-01-13',
      status: 'draft'
    }
  ];

  const filteredItems = mockItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story':
        return <BookOpen className="h-4 w-4" />;
      case 'coloring':
        return <Palette className="h-4 w-4" />;
      case 'image':
        return <Eye className="h-4 w-4" />;
      default:
        return <LibraryIcon className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'story':
        return 'قصة';
      case 'coloring':
        return 'تلوين';
      case 'image':
        return 'صورة';
      default:
        return 'محتوى';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-3xl font-bold text-foreground">
                مكتبتي
              </h1>
              <p className="mt-2 text-muted-foreground">
                جميع قصصك وصفحات التلوين في مكان واحد
              </p>
            </div>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <a href="/create">
                <Plus className="ml-2 h-4 w-4" />
                إنشاء جديد
              </a>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">القصص</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Palette className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">صفحات التلوين</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">المفضلة</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="البحث في المكتبة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="ml-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="story">القصص</SelectItem>
                <SelectItem value="coloring">التلوين</SelectItem>
                <SelectItem value="image">الصور</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="oldest">الأقدم</SelectItem>
              <SelectItem value="title">الاسم</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Grid */}
        {sortedItems.length === 0 ? (
          <Card className="p-12 text-center">
            <LibraryIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">لا توجد عناصر</h3>
            <p className="mt-2 text-muted-foreground">
              {searchTerm ? 'لم يتم العثور على نتائج للبحث' : 'ابدأ بإنشاء محتوى جديد'}
            </p>
            <Button asChild className="mt-4">
              <a href="/create">إنشاء محتوى جديد</a>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedItems.map((item) => (
              <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-lg">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    <span className="text-sm text-muted-foreground">
                      {getTypeLabel(item.type)}
                    </span>
                    {item.status === 'favorite' && (
                      <Heart className="ml-auto h-4 w-4 fill-red-500 text-red-500" />
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                  <CardDescription>
                    {new Date(item.createdAt).toLocaleDateString('ar-SA')}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="ml-2 h-4 w-4" />
                    عرض
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}