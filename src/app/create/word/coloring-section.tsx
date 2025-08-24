'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import {
  Brush,
  Download,
  Eraser,
  Loader2,
  Palette,
  Save,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateImageAction } from './actions';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  description: z.string().min(10, {
    message: 'الرجاء إدخال وصف لا يقل عن 10 أحرف.',
  }),
});

const colors = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#008000', // Dark Green
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
  '#000000', // Black
];

export function ColoringSection() {
  const [loading, setLoading] = useState(false);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setImageDataUri(null);
    try {
      const result = await generateImageAction(values);
      if (result.success && result.data) {
        setImageDataUri(result.data.coloringPageDataUri);
      } else {
        throw new Error(result.error || 'فشلت عملية إنشاء الصورة.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description:
          error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setLoading(false);
    }
  }

  function handleStartOver() {
    setImageDataUri(null);
    form.reset();
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        صف فكرتك هنا
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="مثال: قطة لطيفة ترتدي قبعة ساحر وتطير على مكنسة"
                          className="min-h-[120px] resize-none"
                          {...field}
                          disabled={loading || !!imageDataUri}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!imageDataUri ? (
                  <Button type="submit" className="w-full font-bold" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="mr-2 h-4 w-4" />
                    )}
                    {loading ? '...جاري الإبداع' : 'أنشئ الصورة'}
                  </Button>
                ) : (
                  <Button type="button" onClick={handleStartOver} variant="outline" className="w-full font-bold">
                    البدء من جديد
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="flex min-h-[500px] flex-col items-center justify-center bg-secondary/50 p-4">
          {loading && (
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="font-semibold">لحظات سحرية قيد الصنع...</p>
              <p className="text-sm">يقوم الذكاء الاصطناعي برسم فكرتك.</p>
            </div>
          )}
          {imageDataUri && (
             <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-4">
               <div className="md:col-span-3">
                <div className="aspect-square w-full overflow-hidden rounded-lg border-4 border-white bg-white shadow-lg">
                    <Image
                    src={imageDataUri}
                    alt="Generated coloring page"
                    width={800}
                    height={800}
                    className="h-full w-full object-contain"
                    />
                </div>
               </div>
               <div className="flex flex-col gap-4 md:col-span-1">
                <div className="rounded-lg border bg-background p-4 shadow-sm">
                    <h3 className="mb-4 flex items-center font-headline text-lg font-bold"><Palette className="ml-2 h-5 w-5 text-accent"/> لوحة الألوان</h3>
                    <div className="grid grid-cols-4 gap-2">
                        {colors.map(color => (
                            <button key={color} className="aspect-square w-full rounded-full border-2 border-transparent transition-transform hover:scale-110 hover:border-primary focus:scale-110 focus:border-primary" style={{backgroundColor: color}} aria-label={`Color ${color}`}></button>
                        ))}
                    </div>
                </div>
                <div className="rounded-lg border bg-background p-4 shadow-sm">
                    <h3 className="mb-4 font-headline text-lg font-bold">الأدوات</h3>
                    <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start"><Brush className="ml-2 h-4 w-4"/> فرشاة</Button>
                        <Button variant="outline" className="w-full justify-start"><Eraser className="ml-2 h-4 w-4"/> ممحاة</Button>
                    </div>
                </div>
                <div className="rounded-lg border bg-background p-4 shadow-sm">
                    <h3 className="mb-4 font-headline text-lg font-bold">حفظ ومشاركة</h3>
                    <div className="space-y-2">
                        <Button variant="secondary" className="w-full justify-start"><Save className="ml-2 h-4 w-4"/> حفظ في المكتبة</Button>
                        <Button variant="secondary" className="w-full justify-start"><Download className="ml-2 h-4 w-4"/> تحميل</Button>
                    </div>
                </div>
               </div>
            </div>
          )}
          {!loading && !imageDataUri && (
             <div className="text-center text-muted-foreground">
                <Wand2 className="mx-auto h-16 w-16" />
                <h2 className="mt-4 font-headline text-2xl font-semibold">مساحة إبداعك</h2>
                <p className="mt-2">صورتك التي تم إنشاؤها ستظهر هنا.</p>
             </div>
          )}
        </Card>
      </div>
    </div>
  );
}
