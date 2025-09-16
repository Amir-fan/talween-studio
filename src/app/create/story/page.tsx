
'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  BookOpen,
  CheckCircle,
  Loader2,
  Download,
  Save,
  Wand2,
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
import withAuth from '@/hoc/withAuth';
import { InsufficientCreditsPopup } from '@/components/popups/insufficient-credits-popup';
// import { TenorGIF } from '@/components/tenor-gif';
import type { StoryAndPagesOutput, StoryAndPagesInput } from './types';
import { generateStoryAction } from './actions';
import { PRICING_CONFIG } from '@/lib/pricing';


const steps = [
  { icon: Sparkles, label: 'البطل والموضوع' },
  { icon: Heart, label: 'الدرس المستفاد' },
  { icon: Wand2, label: 'اللمسة السحرية' },
  { icon: BookOpen, label: 'القصة' },
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

function CreateStoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signup');
    }
  }, [user, authLoading, router]);

  // Form state
  const [childName, setChildName] = useState('');
  const [ageGroup, setAgeGroup] = useState<'3-5' | '6-8' | '9-12'>('6-8');
  const [numberOfPages, setNumberOfPages] = useState<'4' | '8' | '12' | '16'>('4');
  const [setting, setSetting] = useState('');
  const [lesson, setLesson] = useState('');
  const [customSetting, setCustomSetting] = useState('');
  const [customLesson, setCustomLesson] = useState('');
  const [showCustomSetting, setShowCustomSetting] = useState(false);
  const [showCustomLesson, setShowCustomLesson] = useState(false);

  const [story, setStory] = useState<StoryAndPagesOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreditsPopup, setShowCreditsPopup] = useState(false);
  const { toast } = useToast();

  const nextStep = () => setStep((prev) => (prev < steps.length ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));


  const handleGenerateStory = async () => {
    if (!user) {
        toast({ variant: "destructive", title: "خطأ", description: "يجب عليك تسجيل الدخول لإنشاء قصة."});
        return;
    }
    if (!childName || !setting || !lesson) {
         toast({
            variant: "destructive",
            title: "معلومات ناقصة",
            description: "الرجاء إكمال جميع الحقول في الخطوات السابقة.",
        });
        return;
    }

    // Validate custom inputs if "other" is selected
    if (setting === 'other' && !customSetting.trim()) {
        toast({
            variant: "destructive",
            title: "معلومات ناقصة",
            description: "الرجاء كتابة المكان المطلوب.",
        });
        return;
    }

    if (lesson === 'other' && !customLesson.trim()) {
        toast({
            variant: "destructive",
            title: "معلومات ناقصة",
            description: "الرجاء كتابة الدرس المطلوب.",
        });
        return;
    }

    setLoading(true);
    setStory(null);
    setStep(4); // Move to the story view step

    try {
        const input: StoryAndPagesInput = {
            userId: user.id,
            childName,
            ageGroup,
            numberOfPages,
            setting: setting === 'other' ? customSetting : setting,
            lesson: lesson === 'other' ? customLesson : lesson,
        };

        const result = await generateStoryAction(input);

        if (result.success && result.data) {
            setStory(result.data);
        } else {
             if (result.error === 'NotEnoughCredits') {
                setShowCreditsPopup(true);
                setStep(3); // Go back to allow purchase
            } else {
                throw new Error(result.error || "فشلت عملية إنشاء القصة. الرجاء المحاولة مرة أخرى.");
            }
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "حدث خطأ",
            description: error instanceof Error ? error.message : "فشلت عملية إنشاء القصة. الرجاء المحاولة مرة أخرى.",
        });
        setStep(3); // Go back to the previous step on error
    } finally {
        setLoading(false);
    }
  };


  if (loading) {
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
              <CardDescription>أخبرنا عن الشخصية الرئيسية ومكان الأحداث</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 px-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="hero-name" className="mb-2 block text-right font-semibold">اسم البطل</Label>
                  <Input id="hero-name" placeholder="مثال: سارة" className="text-right" value={childName} onChange={(e) => setChildName(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="age-group" className="mb-2 block text-right font-semibold">الفئة العمرية</Label>
                    <Select dir="rtl" value={ageGroup} onValueChange={(v) => setAgeGroup(v as any)}>
                        <SelectTrigger id="age-group">
                            <SelectValue placeholder="اختر الفئة العمرية" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3-5">3-5 سنوات</SelectItem>
                            <SelectItem value="6-8">6-8 سنوات</SelectItem>
                            <SelectItem value="9-12">9-12 سنوات</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>


              <div>
                <Label className="mb-4 block text-right font-semibold">مكان الأحداث</Label>
                <RadioGroup dir="rtl" className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6" value={setting} onValueChange={(value) => {
                  setSetting(value);
                  if (value === 'other') {
                    setShowCustomSetting(true);
                  } else {
                    setShowCustomSetting(false);
                  }
                }}>
                  {locations.map((loc) => (
                      <div key={loc}>
                          <RadioGroupItem value={loc} id={loc} className="peer sr-only" />
                          <Label
                              htmlFor={loc}
                              className="flex h-12 cursor-pointer items-center justify-center rounded-full border bg-background px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-accent/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 peer-data-[state=checked]:text-primary"
                          >
                              {loc}
                          </Label>
                      </div>
                  ))}
                  <div>
                      <RadioGroupItem value="other" id="other-setting" className="peer sr-only" />
                      <Label
                          htmlFor="other-setting"
                          className="flex h-12 cursor-pointer items-center justify-center rounded-full border bg-background px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-accent/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 peer-data-[state=checked]:text-primary"
                      >
                          أخرى
                      </Label>
                  </div>
                </RadioGroup>
                {showCustomSetting && (
                  <div className="mt-4">
                    <Input
                      dir="rtl"
                      placeholder="اكتب المكان المطلوب..."
                      value={customSetting}
                      onChange={(e) => setCustomSetting(e.target.value)}
                      className="text-right"
                    />
                  </div>
                )}
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
                    <CardTitle className="font-headline text-3xl">الدرس المستفاد</CardTitle>
                    <CardDescription>اختر القيمة الأخلاقية التي تريد غرسها في القصة</CardDescription>
                </CardHeader>
                <CardContent className="px-8">
                    <RadioGroup dir="rtl" className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6" value={lesson} onValueChange={(value) => {
                      setLesson(value);
                      if (value === 'other') {
                        setShowCustomLesson(true);
                      } else {
                        setShowCustomLesson(false);
                      }
                    }}>
                        {lessons.map((l) => (
                            <div key={l}>
                                <RadioGroupItem value={l} id={l} className="peer sr-only" />
                                <Label
                                    htmlFor={l}
                                    className="flex h-12 cursor-pointer items-center justify-center rounded-full border bg-background px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-accent/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 peer-data-[state=checked]:text-primary"
                                >
                                    {l}
                                </Label>
                            </div>
                        ))}
                        <div>
                            <RadioGroupItem value="other" id="other-lesson" className="peer sr-only" />
                            <Label
                                htmlFor="other-lesson"
                                className="flex h-12 cursor-pointer items-center justify-center rounded-full border bg-background px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-accent/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 peer-data-[state=checked]:text-primary"
                            >
                                أخرى
                            </Label>
                        </div>
                    </RadioGroup>
                    {showCustomLesson && (
                      <div className="mt-4">
                        <Input
                          dir="rtl"
                          placeholder="اكتب الدرس المطلوب..."
                          value={customLesson}
                          onChange={(e) => setCustomLesson(e.target.value)}
                          className="text-right"
                        />
                      </div>
                    )}
                </CardContent>
                <CardFooter className="justify-between p-8">
                    <Button onClick={prevStep} size="lg" variant="outline">
                        <ArrowRight className="ml-2 h-5 w-5" />
                        السابق
                    </Button>
                    <Button onClick={nextStep} size="lg" className="bg-gradient-to-l from-primary to-amber-400 font-bold text-primary-foreground hover:to-amber-500">
                        التالي
                        <ArrowLeft className="mr-2 h-5 w-5" />
                    </Button>
                </CardFooter>
            </Card>
        )}

        {step === 3 && (
            <Card className="mt-8">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">اللمسة السحرية الأخيرة</CardTitle>
                    <CardDescription>اختر عدد الصفحات واستعد للمفاجأة!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 px-8 max-w-md mx-auto">
                    <div>
                        <Label htmlFor="num-pages" className="mb-2 block text-right font-semibold">عدد صفحات القصة</Label>
                        <Select dir="rtl" value={String(numberOfPages)} onValueChange={(v) => setNumberOfPages(v as any)}>
                            <SelectTrigger id="num-pages">
                                <SelectValue placeholder="اختر عدد الصفحات" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="4">4 صفحات ({PRICING_CONFIG.FEATURE_COSTS.STORY_WITH_CHILD_NAME} نقطة - $3.00)</SelectItem>
                                <SelectItem value="8">8 صفحات ({PRICING_CONFIG.FEATURE_COSTS.STORY_WITH_CHILD_NAME} نقطة - $3.00)</SelectItem>
                                <SelectItem value="12">12 صفحة ({PRICING_CONFIG.FEATURE_COSTS.STORY_WITH_CHILD_NAME} نقطة - $3.00)</SelectItem>
                                <SelectItem value="16">16 صفحة ({PRICING_CONFIG.FEATURE_COSTS.STORY_WITH_CHILD_NAME} نقطة - $3.00)</SelectItem>
                            </SelectContent>
                        </Select>
                   </div>
                </CardContent>
                <CardFooter className="justify-between p-8">
                    <Button onClick={prevStep} size="lg" variant="outline">
                        <ArrowRight className="ml-2 h-5 w-5" />
                        السابق
                    </Button>
                        <Button onClick={handleGenerateStory} size="lg" className="bg-gradient-to-l from-rose-400 to-red-500 font-bold text-white hover:to-red-600 shine-effect" disabled={loading}>
                        {loading ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Sparkles className="ml-2 h-5 w-5" />}
                        {loading ? '...جاري إنشاء القصة' : `أنشئ القصة الآن (${PRICING_CONFIG.FEATURE_COSTS.STORY_WITH_CHILD_NAME} نقطة)`}
                    </Button>
                </CardFooter>
            </Card>
        )}

        {step === 4 && (
            <Card className="mt-8">
                 <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">{loading ? 'لحظات سحرية...' : (story?.title ? story.title : `قصة ${childName}!`)}</CardTitle>
                    <CardDescription>{loading ? 'يقوم الذكاء الاصطناعي بنسج الكلمات والصور معاً' : `اقرأ مغامرة ${childName} الجديدة`}</CardDescription>
                </CardHeader>
                <CardContent className="px-8">
                    {loading && (
                        <div className="flex min-h-[500px] flex-col items-center justify-center gap-8 text-talween-brown">
                            <div className="relative">
                                {/* Animated Magic Wand */}
                                <div className="w-20 h-20 bg-gradient-to-r from-talween-pink via-talween-purple to-talween-teal rounded-full flex items-center justify-center animate-spin">
                                    <Wand2 className="h-10 w-10 text-white animate-pulse" />
                                </div>
                                {/* Floating Sparkles */}
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-talween-yellow rounded-full animate-bounce"></div>
                                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-talween-orange rounded-full animate-bounce delay-300"></div>
                                <div className="absolute top-1/2 -left-4 w-2 h-2 bg-talween-green rounded-full animate-bounce delay-500"></div>
                            </div>
                            
                            <div className="text-center space-y-4">
                                <h3 className="text-2xl font-bold text-talween-brown">لحظات سحرية...</h3>
                                <p className="text-lg text-talween-brown/70 max-w-md">
                                    يقوم الذكاء الاصطناعي بنسج الكلمات والصور معاً لإنشاء قصة فريدة لـ <strong>{childName}</strong>
                                </p>
                                
                                {/* Progress Steps */}
                                <div className="flex items-center gap-4 mt-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-talween-green rounded-full animate-pulse"></div>
                                        <span className="text-sm text-talween-brown/70">كتابة القصة</span>
                                    </div>
                                    <div className="w-8 h-0.5 bg-talween-yellow/30"></div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-talween-yellow rounded-full animate-pulse"></div>
                                        <span className="text-sm text-talween-brown/70">رسم الصور</span>
                                    </div>
                                    <div className="w-8 h-0.5 bg-talween-yellow/30"></div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-talween-yellow/30 rounded-full"></div>
                                        <span className="text-sm text-talween-brown/50">التجميع النهائي</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {story && story.pages && (
                        <div className="space-y-8">
                           {story.pages.map((page, index) => (
                               <div key={index} className="w-full">
                                   {/* Mobile: Stack vertically, Desktop: Side by side */}
                                   <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                                       {/* Text Content */}
                                       <div className={`w-full ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                                            <div className="bg-talween-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-talween-yellow/20">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-talween-pink to-talween-purple rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                    <h3 className="font-bold text-talween-brown text-lg">الصفحة {index + 1}</h3>
                                                </div>
                                                <p className="leading-relaxed text-talween-brown/80 text-lg">{page.text}</p>
                                            </div>
                                       </div>
                                       
                                       {/* Image Content */}
                                       <div className={`w-full ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                                           <div className="relative group">
                                               <Image
                                                    src={page.imageDataUri}
                                                    alt={`Illustration for page ${index + 1}`}
                                                    width={600}
                                                    height={600}
                                                    className="rounded-2xl border-2 border-talween-yellow/30 bg-talween-white shadow-xl w-full h-auto object-contain aspect-square group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                           </div>
                                       </div>
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
                    <div className="flex gap-4">
                        <Button onClick={handleGenerateStory} size="lg" variant="outline" disabled={loading} className="bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100">
                            <Wand2 className="ml-2 h-5 w-5" />
                            إعادة إنشاء ({PRICING_CONFIG.FEATURE_COSTS.STORY_WITH_CHILD_NAME} نقطة)
                        </Button>
                        <Button onClick={nextStep} size="lg" className="bg-gradient-to-l from-primary to-amber-400 font-bold text-primary-foreground hover:to-amber-500" disabled={loading || !story}>
                            التالي
                            <ArrowLeft className="mr-2 h-5 w-5" />
                        </Button>
                    </div>
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
                        قصتك عن <strong>{childName}</strong> جاهزة الآن. يمكنك حفظها في مكتبتك للوصول إليها لاحقًا، أو تحميلها كملف لمشاركتها مع الأصدقاء والعائلة.
                    </p>
                    <div className="mt-8 space-y-4">
                        <div className="flex justify-center gap-4">
                            <Button size="lg" variant="outline">
                                 <Save className="ml-2 h-5 w-5" />
                                حفظ في مكتبتي
                            </Button>
                             <Button size="lg" className="bg-gradient-to-l from-primary to-amber-400 font-bold text-primary-foreground hover:to-amber-500">
                                <Download className="ml-2 h-5 w-5" />
                                تحميل القصة
                            </Button>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-2">خيارات التحميل:</p>
                            <div className="flex justify-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => window.print()}>
                                    <Download className="ml-2 h-4 w-4" />
                                    عمودي
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => window.print()}>
                                    <Download className="ml-2 h-4 w-4" />
                                    أفقي
                                </Button>
                            </div>
                        </div>
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

export default withAuth(CreateStoryPage);
