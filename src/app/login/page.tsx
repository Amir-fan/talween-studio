'use client';

import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, LogIn } from 'lucide-react';
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
import { useAuth } from '@/context/auth-context';

const formSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

function LoginPageContent() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginAsAdmin, signIn } = useAuth();
  
  const redirectTo = searchParams.get('redirect') || '/create';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // Hidden admin check - looks like normal login
      if (loginAsAdmin(values.email, values.password)) {
        setLoading(false);
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة تحكم الإدارة",
        });
        // Always redirect admin to /admin, ignore redirect parameter
        router.push('/admin');
        return;
      }

      // Try regular sign in
      const result = await signIn(values.email, values.password);
      
      if (result.success) {
        toast({
          title: 'تم تسجيل الدخول بنجاح!',
          description: 'مرحباً بعودتك.',
        });
        router.push(redirectTo);
      } else {
        toast({
          variant: 'destructive',
          title: 'حدث خطأ',
          description: result.error || 'فشل تسجيل الدخول',
        });
      }
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: 'حدث خطأ غير متوقع',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-gray-50/50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold text-foreground">
            مرحباً بعودتك
          </h1>
          <p className="mt-2 text-muted-foreground">
            سجل دخولك للوصول إلى حسابك
          </p>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">تسجيل الدخول</CardTitle>
            <CardDescription>أدخل بياناتك للوصول إلى حسابك</CardDescription>
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
                        <Input
                          placeholder="أدخل بريدك الإلكتروني"
                          type="email"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="أدخل كلمة المرور"
                          type="password"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      <LogIn className="ml-2 h-4 w-4" />
                      دخول
                    </>
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">ليس لديك حساب؟ </span>
              <Link
                href="/signup"
                className="font-medium text-primary hover:underline"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-gray-50/50 px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}