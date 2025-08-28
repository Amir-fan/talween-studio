'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Heart,
  BookOpen,
  Image as ImageIcon,
  CheckCircle,
  Loader2,
  Download,
  Save,
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import React from 'react';
import { z } from 'zod';
import { ai } from '@/ai/genkit';

// Define schemas and the AI flow directly in the component for simplicity and reliability.

const StoryPageSchema = z.object({
  text: z.string().describe('The text content of the page.'),
  imageDataUri: z.string().describe(
    "The image for the coloring page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type StoryPage = z.infer<typeof StoryPageSchema>;

const CreateStoryAndColoringPagesInputSchema = z.object({
  topic: z.string().describe('The topic of the story.'),
  numPages: z.number().describe('The number of pages for the story.').default(3),
});
export type CreateStoryAndColoringPagesInput = z.infer<typeof CreateStoryAndColoringPagesInputSchema>;

const CreateStoryAndColoringPagesOutputSchema = z.object({
  pages: z.array(StoryPageSchema).describe('The generated story pages with text and image data URIs.'),
});
export type CreateStoryAndColoringPagesOutput = z.infer<typeof CreateStoryAndColoringPagesOutputSchema>;

// This is the single, reliable flow that will be used.
const createStoryAndColoringPagesFlow = ai.defineFlow(
  {
    name: 'createStoryAndColoringPagesFlow',
    inputSchema: CreateStoryAndColoringPagesInputSchema,
    outputSchema: CreateStoryAndColoringPagesOutputSchema,
  },
  async input => {
    const pages = await Promise.all(Array.from({ length: input.numPages }, (_, i) => {
        const pagePrompt = ai.definePrompt({
          name: `pagePrompt_${i}`, // Unique name for each prompt
          input: {schema: z.object({topic: z.string(), pageNumber: z.number()})},
          output: {schema: StoryPageSchema},
          prompt: `You are creating a children's story book. Each page will have text and an illustration suitable for a coloring book.

Create page {{pageNumber}} of a story about {{topic}}.

Your output should include:
- text: the text for this page of the story. It should be in Arabic.
- imageDataUri: a data URI for the illustration. The illustration should be a simple black and white line drawing suitable for a coloring book.

Ensure imageDataUri is a valid data URI with proper MIME type and base64 encoding.

Output in JSON format:
`,
        });

        return pagePrompt({ topic: input.topic, pageNumber: i + 1 }).then(result => result.output!);
    }));
    
    return {pages};
  }
);


const steps = [
  { icon: Sparkles, label: 'البطل والموضوع' },
  { icon: Heart, label: 'الدرس المستفاد' },
  { icon: ImageIcon, label: 'الصور' },
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

const artStyles = [
    'صور فوتوغرافية', 'رسم كرتوني', 'فن رقمي', 'فن تجريدي', 'ألوان مائية'
]

export default function CreateStoryPage() {
  const [step, setStep] = useState(1);
  const [heroName, setHeroName] = useState('');
  const [location, setLocation] = useState('');
  const [story, setStory] = useState<CreateStoryAndColoringPagesOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const nextStep = () => setStep((prev) => (prev < steps.length ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleGenerateStory = async () => {
    if (!heroName || !location) {
         toast({
            variant: "destructive",
            title: "معلومات ناقصة",
            description: "الرجاء إدخال اسم البطل واختيار مكان الأحداث.",
        });
        return;
    }

    setLoading(true);
    setStory(null);
    setStep(4); // Move to the story view step

    try {
        const topic = `قصة عن طفل اسمه ${heroName} في ${location}`;
        const result = await createStoryAndColoringPagesFlow({ topic, numPages: 3 });
        setStory(result);
    } catch (error) {
        toast({
            variant: "destructive",
            title: "حدث خطأ",
            description: "فشلت عملية إنشاء القصة. الرجاء المحاولة مرة أخرى.",
        });
        setStep(3); // Go back to the previous step on error
    } finally {
        setLoading(false);
    }
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
              <CardDescription>أخبرنا عن الشخصية الرئيسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 px-8">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="hero-name" className="mb-2 block text-right font-semibold">اسم البطل</Label>
                  <Input id="hero-name" placeholder="مثال: سارة" className="text-right" value={heroName} onChange={(e) => setHeroName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="hero-age" className="mb-2 block text-right font-semibold">العمر</Label>
                  <Select dir="rtl">
                    <SelectTrigger id="hero-age">
                      <SelectValue placeholder="7 سنة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 سنوات</SelectItem>
                      <SelectItem value="6">6 سنوات</SelectItem>
                      <SelectItem value="7">7 سنوات</SelectItem>
                      <SelectItem value="8">8 سنوات</SelectItem>
                      <SelectItem value="9">9 سنوات</SelectItem>
                      <SelectItem value="10">10 سنوات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="mb-4 block text-right font-semibold">مكان الأحداث</Label>
                <RadioGroup dir="rtl" className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6" value={location} onValueChange={setLocation}>
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
                    <CardTitle className="font-headline text-3xl">الدرس المستفاد</CardTitle>
                    <CardDescription>اختر القيم التي تريد غرسها في القصة</CardDescription>
                </CardHeader>
                <CardContent className="px-8">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3 lg:grid-cols-4">
                        {lessons.map((lesson) => (
                            <div key={lesson} className="flex items-center justify-end gap-3">
                               <Label htmlFor={lesson} className="cursor-pointer font-medium hover:text-primary">{lesson}</Label>
                                <Checkbox id={lesson} dir='rtl' />
                            </div>
                        ))}
                    </div>
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
                    <CardTitle className="font-headline text-3xl">اختر النمط البصري</CardTitle>
                    <CardDescription>اختر كيف ستبدو الصور في قصتك</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 px-8">
                   <div>
                        <Label htmlFor="art-style" className="mb-2 block text-right font-semibold">نمط فني</Label>
                        <Select dir="rtl">
                            <SelectTrigger id="art-style">
                                <SelectValue placeholder="اختر نمطاً" />
                            </SelectTrigger>
                            <SelectContent>
                                {artStyles.map(style => (
                                    <SelectItem key={style} value={style}>{style}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                   </div>
                   <div>
                       <Label className="mb-4 block text-right font-semibold">اختر نوع الرسوم</Label>
                       <RadioGroup dir="rtl" defaultValue="bw" className="flex gap-4">
                           <div className="flex items-center gap-2">
                               <RadioGroupItem value="bw" id="bw"/>
                               <Label htmlFor="bw">أبيض وأسود (للتلوين)</Label>
                           </div>
                           <div className="flex items-center gap-2">
                               <RadioGroupItem value="color" id="color" />
                               <Label htmlFor="color">ملون</Label>
                           </div>
                       </RadioGroup>
                   </div>
                </CardContent>
                <CardFooter className="justify-between p-8">
                    <Button onClick={prevStep} size="lg" variant="outline">
                        <ArrowRight className="ml-2 h-5 w-5" />
                        السابق
                    </Button>
                    <Button onClick={handleGenerateStory} size="lg" className="bg-gradient-to-l from-rose-400 to-red-500 font-bold text-white hover:to-red-600" disabled={loading}>
                        {loading ? <Loader2 className="ml-2 h-5 w-5 animate-spin" /> : <Sparkles className="ml-2 h-5 w-5" />}
                        {loading ? '...جاري إنشاء القصة' : 'أنشئ القصة الآن'}
                    </Button>
                </CardFooter>
            </Card>
        )}

        {step === 4 && (
            <Card className="mt-8">
                 <CardHeader className="text-center">
                    <CardTitle className="font-headline text-3xl">ها هي قصتك!</CardTitle>
                    <CardDescription>اقرأ مغامرة {heroName} الجديدة</CardDescription>
                </CardHeader>
                <CardContent className="px-8">
                    {loading && (
                         <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-muted-foreground">
                            <Loader2 className="h-16 w-16 animate-spin text-primary" />
                            <p className="font-semibold">لحظات، القصة على وشك الاكتمال...</p>
                            <p className="text-sm">يقوم الذكاء الاصطناعي بنسج الكلمات والصور معاً.</p>
                        </div>
                    )}
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
                        قصتك عن <strong>{heroName}</strong> جاهزة الآن. يمكنك حفظها في مكتبتك للوصول إليها لاحقًا، أو تحميلها كملف لمشاركتها مع الأصدقاء والعائلة.
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
