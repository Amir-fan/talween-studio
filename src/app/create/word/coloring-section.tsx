
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import {
  Loader2,
  Wand2,
  Lightbulb,
  Sparkles,
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
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { GenerateColoringPageFromTextInputSchema } from './types';
import { generateImageAction } from './server-actions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const formSchema = GenerateColoringPageFromTextInputSchema;

export function ColoringSection() {
  const [loading, setLoading] = useState(false);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      difficulty: 'Simple',
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

  function useQuickIdea() {
    form.setValue('description', 'سفينة تبحر في المحيط');
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
      <div className="order-2 lg:order-1 lg:col-span-3">
        <Card className="flex min-h-[600px] flex-col p-4">
           <CardContent className="flex w-full flex-col items-center justify-center p-0 pt-6">
            <h2 className="mb-4 self-start font-headline text-xl font-bold">صورة التلوين</h2>
            {loading && (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="font-semibold">لحظات سحرية قيد الصنع...</p>
                <p className="text-sm">يقوم الذكاء الاصطناعي برسم فكرتك.</p>
              </div>
            )}
            {imageDataUri && (
                <div className="aspect-square w-full max-w-full overflow-hidden rounded-lg border bg-white shadow-sm">
                    <Image
                    src={imageDataUri}
                    alt="Generated coloring page"
                    width={800}
                    height={800}
                    className="h-full w-full object-contain"
                    />
                </div>
            )}
            {!loading && !imageDataUri && (
              <div className="flex h-full min-h-[480px] w-full flex-col items-center justify-center rounded-lg bg-secondary/50">
                  <div className="text-center text-muted-foreground">
                      <Wand2 className="mx-auto h-16 w-16 opacity-50" />
                      <h2 className="mt-4 font-headline text-2xl font-semibold">ستظهر صورة التلوين هنا</h2>
                  </div>
              </div>
            )}
           </CardContent>
        </Card>
      </div>

      <div className="order-1 lg:order-2 lg:col-span-2">
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-3xl font-bold text-primary">
                        T
                    </div>
                    <h2 className="font-headline text-2xl font-bold">اكتب فكرتك</h2>
                    <p className="text-muted-foreground">صف ما تريد رسمه</p>

                    <div className="mt-6 rounded-lg bg-yellow-100/70 p-4 text-right">
                        <div className="flex items-start gap-3">
                            <Lightbulb className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                            <div>
                                <h4 className="font-bold">فكرة سريعة:</h4>
                                <p className="text-sm text-muted-foreground">سفينة تبحر في المحيط</p>
                                <button onClick={useQuickIdea} className="mt-1 text-sm font-bold text-primary hover:underline">استخدم هذه الفكرة</button>
                            </div>
                        </div>
                    </div>

                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                        <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                            <FormControl>
                                <Input
                                placeholder="اكتب فكرتك هنا..."
                                {...field}
                                disabled={loading}
                                className="text-center"
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                          control={form.control}
                          name="difficulty"
                          render={({ field }) => (
                            <FormItem className="space-y-3 text-right">
                              <FormLabel className="font-semibold">مستوى الصعوبة</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex justify-center gap-4 pt-2"
                                  dir="rtl"
                                >
                                  <FormItem className="flex items-center space-x-2 space-x-reverse">
                                    <FormControl>
                                      <RadioGroupItem value="Simple" id="difficulty-simple" />
                                    </FormControl>
                                    <Label htmlFor="difficulty-simple" className="cursor-pointer">بسيط</Label>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-x-reverse">
                                    <FormControl>
                                      <RadioGroupItem value="Detailed" id="difficulty-detailed" />
                                    </FormControl>
                                    <Label htmlFor="difficulty-detailed" className="cursor-pointer">مفصل</Label>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" size="lg" className="w-full rounded-full bg-gradient-to-r from-primary to-orange-500 font-bold text-primary-foreground hover:from-primary/90 hover:to-orange-500/90" disabled={loading}>
                        {loading ? (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="ml-2 h-4 w-4" />
                        )}
                        {loading ? '...جاري الإنشاء' : 'إنشاء الصورة'}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                        <Lightbulb className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                        <h3 className="font-headline text-xl font-bold">نصائح للحصول على أفضل النتائج</h3>
                    </div>
                    <ul className="mt-4 space-y-2 pr-4 text-sm text-muted-foreground">
                        <li className="flex items-start gap-3"><span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary"></span>استخدم وصفاً واضحاً ومحدداً</li>
                        <li className="flex items-start gap-3"><span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary"></span>أضف تفاصيل عن الشكل والحجم</li>
                        <li className="flex items-start gap-3"><span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary"></span>اختر "بسيط" للأطفال الصغار، و "مفصل" للأكبر سناً</li>
                        <li className="flex items-start gap-3"><span className="mt-1 block h-1.5 w-1.5 rounded-full bg-primary"></span>جرب كلمات مثل: "كبير"، "لطيف"، "كرتوني"</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
