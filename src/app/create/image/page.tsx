'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { ArrowRight, Camera, Loader2, Upload, Lightbulb, Wand2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HeartButton } from '@/components/heart-button';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { generateImageFromPhotoAction } from './actions';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { PRICING_CONFIG } from '@/lib/pricing';
import { deductLocalUserCredits } from '@/lib/local-auth';
import { InsufficientCreditsPopup } from '@/components/popups/insufficient-credits-popup';

export default function CreateWithImagePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coloringPageUrl, setColoringPageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreditsPopup, setShowCreditsPopup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, loading: authLoading, isAdmin, refreshUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signup');
    }
  }, [user, authLoading, router]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setColoringPageUrl(null); 
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const generateColoringPage = async () => {
    if (!previewUrl) return;
    setLoading(true);
    setColoringPageUrl(null);

    try {
      // Check credits on client side first
      console.log('🔍 CREDIT CHECK DEBUG:');
      console.log('  - user exists?', !!user);
      console.log('  - isAdmin?', isAdmin);
      console.log('  - user.id:', user?.id);
      console.log('  - Will check credits?', user && !isAdmin);
      
      // Debug admin status
      if (user?.id === 'admin') {
        console.log('🔍 ADMIN USER DETECTED - skipping credit check');
        console.log('  - user.id is admin, isAdmin flag:', isAdmin);
      }
      
      if (user && !isAdmin) {
        console.log('🔍 CLIENT CREDIT CHECK:');
        console.log('  - user.credits:', user.credits);
        console.log('  - isAdmin:', isAdmin);
        
        const cost = PRICING_CONFIG.FEATURE_COSTS.PHOTO_TO_COLORING;
        console.log('  - cost:', cost);
        
        // Simple credit check: if user has enough credits, proceed
        if (user.credits >= cost) {
          console.log('✅ User has enough credits, proceeding with generation');
          
          // Deduct credits from localStorage
          const creditResult = deductLocalUserCredits(user.id, cost);
          console.log('  - creditResult:', creditResult);
          
          // Refresh user data to show updated credits
          refreshUserData();
        } else {
          console.log('❌ Not enough credits:', user.credits, '<', cost);
          setShowCreditsPopup(true);
          return;
        }
      }

      const result = await generateImageFromPhotoAction({ 
        photoDataUri: previewUrl,
        userId: user?.id || 'admin',
        userEmail: user?.email
      });
      
      if (result.success && result.data) {
        setColoringPageUrl(result.data.coloringPageDataUri);
      } else {
        if (result.error === 'NotEnoughCredits') {
          setShowCreditsPopup(true);
        } else {
          throw new Error(result.error || 'فشلت عملية إنشاء الصورة.');
        }
      }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "حدث خطأ",
            description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    } finally {
        setLoading(false);
    }
  };


  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-yellow-50/30">
      <InsufficientCreditsPopup open={showCreditsPopup} onOpenChange={setShowCreditsPopup} />
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between">
          <Button asChild variant="outline" className="rounded-full font-bold">
            <Link href="/create">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة
            </Link>
          </Button>
          <div className="text-right">
            <h1 className="font-headline text-3xl font-bold text-foreground">
              تحويل الصورة إلى تلوين
            </h1>
            <p className="mt-1 text-muted-foreground">
              حول أي صورة إلى رسمة تلوين جميلة
            </p>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">
            <div className="order-2 lg:order-1 lg:col-span-3">
                <Card className="flex min-h-[600px] flex-col p-4">
                    <CardContent className="flex w-full flex-col items-center justify-center p-0 pt-6">
                        <div className="mb-4 flex w-full items-center justify-between">
                            <h2 className="font-headline text-xl font-bold">صفحة التلوين الناتجة</h2>
                        </div>
                        
                        {loading && (
                            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <p className="font-semibold">يقوم الذكاء الاصطناعي بتحويل صورتك...</p>
                                <p className="text-sm">قد تستغرق هذه العملية دقيقة.</p>
                            </div>
                        )}
                        
                        {!loading && !coloringPageUrl && (
                             <div className="flex h-full min-h-[480px] w-full flex-col items-center justify-center rounded-lg bg-secondary/50">
                                <div className="text-center text-muted-foreground">
                                    <Camera className="mx-auto h-16 w-16 opacity-50" />
                                    <h2 className="mt-4 font-headline text-2xl font-semibold">ستظهر صفحة التلوين هنا</h2>
                                </div>
                            </div>
                        )}

                        {coloringPageUrl && (
                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="aspect-square w-full max-w-full overflow-hidden rounded-lg border bg-white shadow-sm">
                                        <Image
                                        src={coloringPageUrl}
                                        alt="Coloring page preview"
                                        width={800}
                                        height={800}
                                        className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <HeartButton 
                                            item={{
                                                type: 'image-to-coloring',
                                                title: 'صفحة تلوين من الصورة',
                                                description: 'صفحة تلوين تم إنشاؤها من صورة شخصية',
                                                imageDataUri: coloringPageUrl,
                                                originalImageDataUri: previewUrl,
                                            }}
                                            size="md"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-3">
                                    <Button onClick={generateColoringPage} size="lg" variant="outline" disabled={loading} className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100">
                                        <Wand2 className="ml-2 h-5 w-5" />
                                        إعادة إنشاء ({PRICING_CONFIG.FEATURE_COSTS.PHOTO_TO_COLORING} نقطة)
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = coloringPageUrl;
                                        link.download = 'coloring-page.png';
                                        link.click();
                                    }}>
                                        <Download className="ml-2 h-4 w-4" />
                                        تحميل الصورة
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="order-1 lg:order-2 lg:col-span-2">
                <Card>
                    <CardContent className="p-6 text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Camera className="h-12 w-12" />
                        </div>
                        <h2 className="font-headline text-2xl font-bold">اختر صورتك</h2>
                        <p className="text-muted-foreground">
                            JPG, PNG، أو HEIC حتى 15 ميجابايت
                        </p>

                        <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg, image/heic" />
                        
                        <Button onClick={handleChooseFileClick} size="lg" className="w-full mt-6 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold rounded-full">
                            <Upload className="ml-2 h-5 w-5" />
                            اختر صورة
                        </Button>

                         <div className="mt-4 rounded-lg bg-yellow-100/70 p-4 text-right">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                                <div>
                                    <p className="text-sm text-muted-foreground"><b>نصيحة:</b> اختر صورة واضحة مع خلفية بسيطة للحصول على أفضل النتائج</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {previewUrl && !coloringPageUrl &&(
                  <Card className="mt-4">
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-2 text-center">الصورة المحددة</h3>
                      <Image src={previewUrl} alt="Selected preview" width={200} height={200} className="rounded-lg w-full" />
                       <Button onClick={generateColoringPage} size="lg" className="w-full mt-4 bg-gradient-to-l from-primary to-amber-400 font-bold text-primary-foreground hover:to-amber-500" disabled={loading}>
                        {loading ? '...جاري التحويل' : `تحويل إلى صفحة تلوين (${PRICING_CONFIG.FEATURE_COSTS.PHOTO_TO_COLORING} نقطة)`}
                        </Button>
                    </CardContent>
                  </Card>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}



