'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowLeft,
  WandSparkles,
  BookOpen,
  CheckCircle,
  Loader2,
  Download,
  Save,
  Paintbrush,
  BookUser,
  MapPin,
  GraduationCap,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { generateStoryAction } from './actions';
import type { CreateStoryAndColoringPagesOutput, CreateStoryAndColoringPagesInput } from '@/ai/flows/create-story-and-coloring-pages';
import { TenorGIF } from '@/components/tenor-gif';
import { useAuth } from '@/context/auth-context';
import { InsufficientCreditsPopup } from '@/components/popups/insufficient-credits-popup';

const steps = [
  { icon: BookUser, label: 'البطل والموضوع' },
  { icon: Paintbrush, label: 'النمط الفني' },
  { icon: WandSparkles, label: 'إنشاء القصة' },
  { icon: BookOpen, label: 'عرض القصة' },
  { icon: CheckCircle, label: 'النهاية' },
];

const locations = [
  'المسجد الحرام', 'المسجد النبوي', 'الصحراء الخليجية', 'الشاطئ', 'المدرسة',
  'الحديقة', 'السوق التراثي', 'القرية', 'برج خليفة', 'متحف الفن الإسلامي',
  'حديقة الأزهر', 'الكورنيش'
];

const lessons = [
    'الصلاة', 'الصدق', 'بر الوالدين', 'الصدقة', 'الرحمة', 'الصبر',
    'التعاون', 'الأمانة', 'العدل', 'حب الحيوانات', 'إدارة الوقت', 'النمو والتعلم'
];

const artStyles = [
    { value: 'cartoon', label: 'رسم كرتوني' },
    { value: 'semi-realistic', label: 'شبه واقعي' },
    { value: 'simple', label: 'بسيط جداً' },
]

export default function CreateStoryPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateStoryAndColoringPagesInput>>({
      childName: '',
      ageGroup: '6-8',
      numberOfPages: '8',
      setting: '',
      lesson: 'auto-select',
      artStyle: 'cartoon'
  });
  
  const [story, setStory] = useState<CreateStoryAndColoringPagesOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreditsPopup, setShowCreditsPopup] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();


  const handleInputChange = (field: keyof CreateStoryAndColoringPagesInput, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const nextStep = () => setStep((prev) => (prev < steps.length ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleGenerateStory = async () => {
    const { childName, ageGroup, numberOfPages, setting, lesson, artStyle } = formData;
    if (!childName || !ageGroup || !numberOfPages || !setting) {
         toast({
            variant: "destructive",
            title: "معلومات ناقصة",
            description: "الرجاء إكمال جميع الحقول المطلوبة.",
        });
        return;
    }

    if (!user) {
        toast({
            variant: "destructive",
            title: "تسجيل الدخول مطلوب",
            description: "يجب عليك تسجيل الدخول لإنشاء قصة.",
        });
        return;
    }


    setLoading(true);
    setStory(null);
    setStep(3); // Move to the generating view step

    try {
      const result = await generateStoryAction({
          childName,
          ageGroup,
          numberOfPages,
          setting,
          lesson: lesson || 'auto-select',
          artStyle
      });
      if (result.success && result.data) {
        setStory(result.data);
        setStep(4); // Move to the story view step
      } else {
        // Check for specific 'Not enough credits' error
        if (result.error === 'NotEnoughCredits') {
          setShowCreditsPopup(true);
          setStep(2); // Go back to previous step
        } else {
          throw new Error(result.error || "فشلت عملية إنشاء القصة. الرجاء المحاولة مرة أخرى.");
        }
      }
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
       if (errorMessage === 'NotEnoughCredits') {
            setShowCreditsPopup(true);
            setStep(2);
       } else {
            toast({
                variant: "destructive",
                title: "حدث خطأ",
                description: errorMessage,
            });
            setStep(2); // Go back to the previous step on error
       }
    } finally {
        setLoading(false);
    }
  };


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
              منشئ القصص
            </h1>
            <p className="mt-1 text-muted-foreground">
              أنشئ قصص تلوين شخصية مع مغامرات رائعة
            </p>
          </div>
        </header>

        <Card className="mt-8 p-6">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full border-2 bg-secondary/50 transition-colors',
                      step === index + 1
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-border text-muted-foreground',
                      step > index + 1 ? 'border-primary/50 bg-primary/10 text-primary/80' : ''
                    )}
                  >
                    <s.icon className="h-6 w-6" />
                  </div>
                </div>
                {index < steps.length - 1 && (
                   <div className={cn("h-0.5 flex-1 transition-colors", step > index + 1 ? 'bg-primary/50' : 'bg-border')}></div>
                )}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-muted-foreground">
            الخطوة {step} من {steps.length}: {steps[step - 1].label}
          </p>
        </Card>

        {step === 1 && (
          <Card className="mt-8">
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-3xl">من هو بطل قصتك؟</CardTitle>
              <CardDescription>أخبرنا عن الشخصية الرئيسية وموضوع القصة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 px-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="hero-name" className="mb-2 block text-right font-semibold flex items-center justify-end gap-2"><BookUser /> اسم البطل</Label>
                  <Input id="hero-name" placeholder="مثال: سارة" className="text-right" value={formData.childName} onChange={(e) => handleInputChange('childName', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="hero-age" className="mb-2 block text-right font-semibold flex items-center justify-end gap-2"><GraduationCap /> الفئة العمرية</Label>
                  <Select dir="rtl" value={formData.ageGroup} onValueChange={(v) => handleInputChange('ageGroup', v)}>
                    <SelectTrigger id="hero-age"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3-5">3-5 سنوات</SelectItem>
                      <SelectItem value="6-8">6-8 سنوات</SelectItem>
                      <SelectItem value="9-12">9-12 سنوات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-4 block text-right font-semibold flex items-center justify-end gap-2"><MapPin/> مكان الأحداث</Label>
                <RadioGroup dir="rtl" className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6" value={formData.setting} onValueChange={(v) => handleInputChange('setting', v)}>
                  {locations.map((loc) => (
                      <div key={loc}>
                          <RadioGroupItem value={loc} id={loc} className="peer sr-only" />
                          <Label htmlFor={loc} className="flex h-12 cursor-pointer items-center justify-center rounded-full border bg-background px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-accent/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 peer-data-[state=checked]:text-primary">
                              {loc}
                          </Label>
                      </div>
                  ))}
                </RadioGroup>
              </div>

               <div>
                <Label className="mb-4 block text-right font-semibold flex items-center justify-end gap-2"><Heart/> الدرس المستفاد (اختياري)</Label>
                 <RadioGroup dir="rtl" className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6" value={formData.lesson} onValueChange={(v) => handleInputChange('lesson', v)}>
                  {lessons.map((l) => (
                      <div key={l}>
                          <RadioGroupItem value={l} id={`lesson-${l}`} className="peer sr-only" />
                          <Label htmlFor={`lesson-${l}`} className="flex h-12 cursor-pointer items-center justify-center rounded-full border bg-background px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-accent/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 peer-data-[state=checked]:text-primary">
                              {l}
                          </Label>
                      </div>
                  ))}
                </RadioGroup>
              </div>

            </CardContent>
            <CardFooter className="justify-end p-8">
                <Button onClick={nextStep} size="lg" className="bg-gradient-to-l from-primary to-amber-400 font-bold text-primary-foreground hover:to-amber-500">
                    التالي
                    <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
             <Card className="mt-8">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">اختر النمط الفني</CardTitle>
                    <CardDescription>اختر كيف ستبدو الصور في قصتك</CardDescription>
                </CardHeader>
                <CardContent className="px-8 space-y-8">
                   <div>
                        <Label htmlFor="art-style" className="mb-2 block text-right font-semibold">نمط الرسوم</Label>
                        <Select dir="rtl" value={formData.artStyle} onValueChange={(v) => handleInputChange('artStyle', v)}>
                            <SelectTrigger id="art-style"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {artStyles.map(style => (
                                    <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                   </div>
                    <div>
                        <Label htmlFor="page-count" className="mb-2 block text-right font-semibold">عدد الصفحات</Label>
                        <Select dir="rtl" value={formData.numberOfPages} onValueChange={(v) => handleInputChange('numberOfPages', v)}>
                            <SelectTrigger id="page-count"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="4">4 صفحات (قصة قصيرة) - 1 نقطة</SelectItem>
                                <SelectItem value="8">8 صفحات (قصة متوسطة) - 2 نقطة</SelectItem>
                                <SelectItem value="12">12 صفحة (قصة طويلة) - 3 نقاط</SelectItem>
                                <SelectItem value="16">16 صفحة (كتاب متكامل) - 4 نقاط</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter className="justify-between p-8">
                    <Button onClick={prevStep} size="lg" variant="outline">
                        <ArrowRight className="ml-2 h-5 w-5" />
                        السابق
                    </Button>
                    <Button onClick={handleGenerateStory} size="lg" className="bg-gradient-to-l from-rose-400 to-red-500 font-bold text-white hover:to-red-600" disabled={loading}>
                        {loading ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <WandSparkles className="ml-2 h-5 w-5" />}
                        {loading ? '...جاري إنشاء القصة' : 'أنشئ القصة الآن'}
                    </Button>
                </CardFooter>
            </Card>
        )}

        {step === 3 && (
            <Card className="mt-8 min-h-[500px] flex flex-col justify-center items-center">
                 <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">يقوم الذكاء الاصطناعي بسحر الإبداع!</CardTitle>
                    <CardDescription>لحظات، القصة على وشك الاكتمال...</CardDescription>
                </CardHeader>
                <CardContent className="px-8 text-center">
                    <TenorGIF />
                    <p className="font-semibold text-lg mt-4">يقوم الذكاء الاصطناعي بنسج الكلمات والصور معاً.</p>
                </CardContent>
            </Card>
        )}

        {step === 4 && (
            <Card className="mt-8">
                 <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">{story?.title || 'ها هي قصتك!'}</CardTitle>
                    <CardDescription>اقرأ مغامرة {formData.childName} الجديدة</CardDescription>
                </CardHeader>
                <CardContent className="px-8">
                    {story && (
                        <div className="space-y-8">
                           {story.pages.map((page, index) => (
                               <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                   <div className='order-2 md:order-1'>
                                        <p className="leading-loose text-lg">{page.text}</p>
                                   </div>
                                   <div className='order-1 md:order-2'>
                                       <Image
                                            src={page.imageDataUri}
                                            alt={`Illustration for page ${index + 1}`}
                                            width={500}
                                            height={500}
                                            className="rounded-lg border bg-white shadow-sm w-full object-contain aspect-square"
                                        />
                                   </div>
                               </div>
                           ))}
                        </div>
                    )}
                </CardContent>
                 <CardFooter className="justify-between p-8">
                    <Button onClick={prevStep} size="lg" variant="outline" disabled={loading}>
                        <ArrowRight className="ml-2 h-5 w-5" />
                        السابق
                    </Button>
                    <Button onClick={nextStep} size="lg" className="bg-gradient-to-l from-primary to-amber-400 font-bold text-primary-foreground hover:to-amber-500" disabled={loading || !story}>
                        التالي
                        <ArrowLeft className="mr-2 h-5 w-5" />
                    </Button>
                </CardFooter>
            </Card>
        )}

        {step === 5 && (
            <Card className="mt-8">
                <CardHeader className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <CheckCircle className="h-10 w-10" />
                    </div>
                    <CardTitle className="font-headline text-3xl mt-4">عمل رائع!</CardTitle>
                    <CardDescription>لقد أنشأت قصة جديدة بنجاح.</CardDescription>
                </CardHeader>
                <CardContent className="px-8 text-center">
                    <p className="text-muted-foreground">
                        قصتك عن <strong>{formData.childName}</strong> جاهزة الآن. يمكنك حفظها في مكتبتك للوصول إليها لاحقًا، أو تحميلها كملف لمشاركتها مع الأصدقاء والعائلة.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Button size="lg" variant="outline">
                             <Save className="ml-2 h-5 w-5" />
                            حفظ في مكتبتي
                        </Button>
                         <Button size="lg" className="bg-gradient-to-l from-primary to-amber-400 font-bold text-primary-foreground hover:to-amber-500">
                            <Download className="ml-2 h-5 w-5" />
                            تحميل القصة
                        </Button>
                    </div>
                </CardContent>
                 <CardFooter className="justify-center p-8">
                      <Button asChild variant="link">
                        <Link href="/create">إنشاء قصة أخرى</Link>
                      </Button>
                 </CardFooter>
            </Card>
        )}
      </div>
    </div>
  );
}
