
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { sendResetPasswordEmail } from '@/app/auth/client-actions';

const formSchema = z.object({
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صالح.' }),
});

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const result = await sendResetPasswordEmail(values);
      if (result.success) {
        toast({
          title: 'تم إرسال البريد الإلكتروني',
          description: 'تحقق من بريدك الإلكتروني للحصول على إرشادات إعادة تعيين كلمة المرور.',
        });
        form.reset();
      } else {
        throw new Error(result.error || 'فشلت عملية إرسال البريد الإلكتروني.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-gray-50/50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">نسيت كلمة المرور؟</CardTitle>
          <CardDescription>لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيينها.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : <Mail />}
                {loading ? '...جاري الإرسال' : 'إرسال رابط إعادة التعيين'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            تذكرت كلمة المرور؟{' '}
            <Link href="/login" className="text-primary hover:underline">
              تسجيل الدخول
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
