'use client';

import Link from 'next/link';
import { ArrowRight, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useRef } from 'react';
import Image from 'next/image';

export default function CreateWithImagePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coloringPageUrl, setColoringPageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


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
    if (!selectedFile) return;
    setLoading(true);
    // Here you would call the AI flow
    // For now, we'll just simulate a delay and show the same image
    setTimeout(() => {
        if(previewUrl) {
            setColoringPageUrl(previewUrl);
        }
        setLoading(false);
    }, 2000);
  };


  return (
    <div className="min-h-screen bg-yellow-50/30">
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
                            <h2 className="font-headline text-xl font-bold">المعاينة</h2>
                        </div>
                        
                        {!coloringPageUrl && (
                             <div className="flex h-full min-h-[480px] w-full flex-col items-center justify-center rounded-lg bg-secondary/50">
                                <div className="text-center text-muted-foreground">
                                    <ImageIcon className="mx-auto h-16 w-16 opacity-50" />
                                    <h2 className="mt-4 font-headline text-2xl font-semibold">ستظهر صفحة التلوين هنا</h2>
                                </div>
                            </div>
                        )}

                        {coloringPageUrl && (
                            <div className="aspect-square w-full max-w-full overflow-hidden rounded-lg border bg-white shadow-sm">
                                <Image
                                src={coloringPageUrl}
                                alt="Coloring page preview"
                                width={800}
                                height={800}
                                className="h-full w-full object-contain"
                                />
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
                            <UploadIcon className="ml-2 h-5 w-5" />
                            اختر صورة
                        </Button>

                         <div className="mt-4 rounded-lg bg-yellow-100/70 p-4 text-right">
                            <div className="flex items-start gap-3">
                                <LightbulbIcon className="h-5 w-5 flex-shrink-0 text-yellow-500" />
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
                        {loading ? '...جاري التحويل' : 'تحويل إلى صفحة تلوين'}
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


function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  )
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" x2="12" y1="3" y2="15" />
      </svg>
    )
}

function LightbulbIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
        <path d="M9 18h6" />
        <path d="M10 22h4" />
      </svg>
    )
  }

    