'use client';

import Link from 'next/link';
import {
  ArrowRight,
  User,
  Sparkles,
  Download,
  FileText,
  BookOpen,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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

const steps = [
  { icon: Sparkles, label: 'البطل والموضوع' },
  { icon: Download, label: 'Download' },
  { icon: ImageIcon, label: 'Image' },
  { icon: BookOpen, label: 'BookOpen' },
  { icon: FileText, label: 'FileText' },
  { icon: User, label: 'User' },
];

const locations = [
    'المسجد الحرام', 'المسجد النبوي', 'الصحراء الخليجية', 'الشاطئ', 'المدرسة',
    'الحديقة', 'السوق التراثي', 'القرية', 'برج خليفة', 'متحف الفن الإسلامي',
    'حديقة الأزهر', 'الكورنيش'
];

export default function CreateStoryPage() {
  const activeStep = 0;

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
            {steps.map((step, index) => (
              <>
                <div key={index} className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-full border-2 bg-secondary/50 transition-colors',
                      activeStep === index
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-border text-muted-foreground'
                    )}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="h-0.5 flex-1 bg-border"></div>
                )}
              </>
            ))}
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-muted-foreground">
            الخطوة {activeStep + 1} من {steps.length}: {steps[activeStep].label}
          </p>
        </Card>

        <Card className="mt-8">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl">من هو بطل قصتك؟</CardTitle>
            <CardDescription>أخبرنا عن الشخصية الرئيسية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 px-8 pb-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="hero-name" className="mb-2 block text-right font-semibold">اسم البطل</Label>
                <Input id="hero-name" placeholder="مثال: سارة" className="text-right" />
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
              <RadioGroup dir="rtl" className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {locations.map((location) => (
                    <div key={location}>
                        <RadioGroupItem value={location} id={location} className="peer sr-only" />
                        <Label
                            htmlFor={location}
                            className="flex cursor-pointer items-center justify-center rounded-full border bg-background p-3 text-center text-sm font-medium transition-colors hover:bg-accent/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/20 peer-data-[state=checked]:text-primary"
                        >
                            {location}
                        </Label>
                    </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
