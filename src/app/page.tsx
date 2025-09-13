
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Camera, 
  ShieldCheck, 
  Star, 
  CircleCheckBig, 
  Sparkles, 
  Heart, 
  Palette, 
  Wand2, 
  Download, 
  Users, 
  Award,
  ArrowRight,
  Play,
  Zap,
  Crown,
  Rainbow
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 py-20 sm:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-300/30 to-orange-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* Left Side - Content */}
            <div className="text-center lg:text-right space-y-8">
              {/* Logo and Badge */}
              <div className="flex items-center justify-center gap-4 mb-8 lg:justify-start">
                <div className="relative">
                  <Image
                    src="/talween logo.png"
                    alt="Talween Studio Logo"
                    width={80}
                    height={80}
                    className="h-20 w-20 flex-shrink-0 animate-bounce"
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <Badge className="mb-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 animate-pulse">
                    ✨ جديد! الذكاء الاصطناعي
                  </Badge>
                  <h1 className="font-headline text-5xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
                    أشعل خيال طفلك
                    <span className="block bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
                      بطل القصة
                    </span>
                  </h1>
                </div>
              </div>

              <p className="text-xl leading-8 text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                حوّل الكلمات إلى قصص سحرية وصفحات تلوين مذهلة بقوة الذكاء الاصطناعي. 
                <span className="font-semibold text-primary"> كل قصة فريدة، كل طفل بطل!</span>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center lg:justify-start">
                <Button 
                  asChild 
                  size="lg" 
                  className="group w-full sm:w-auto rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold text-lg px-8 py-6 shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Link href="/create">
                    <Wand2 className="ml-2 h-6 w-6 group-hover:animate-spin" />
                    أنشئ قصة سحرية
                    <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="group w-full sm:w-auto rounded-full border-2 border-purple-200 bg-white/80 backdrop-blur-sm hover:bg-purple-50 font-bold text-lg px-8 py-6 shadow-xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                >
                  <Link href="/create/word">
                    <Palette className="ml-2 h-6 w-6 group-hover:animate-pulse" />
                    صورة → تلوين
                  </Link>
                </Button>
              </div>

              {/* Free Trial Card */}
              <Card className="mt-8 bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 border-2 border-yellow-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 p-3 animate-pulse">
                          <Star className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-bounce">
                          <span className="text-xs text-white font-bold">!</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">جرب مجاناً الآن!</h3>
                        <p className="text-sm text-gray-600">
                          128 نقطة مجانية - قصة كاملة + صفحات تلوين
                        </p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-full px-6">
                      ابدأ الآن
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm lg:justify-start">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <ShieldCheck className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-gray-700">أمن للأطفال</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <Award className="h-5 w-5 text-blue-500" />
                  <span className="font-semibold text-gray-700">معتمد تعليمياً</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-semibold text-gray-700">محبوب من العائلات</span>
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-lg mx-auto">
                {/* Main Image Container */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-105">
                    <Image
                      src="https://images.unsplash.com/photo-1612539466809-8be5e4e01256?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxraWRzJTIwY29sb3Jpbmd8ZW58MHx8fHwxNzU2MTMxMzYzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                      alt="أطفال سعداء يلونون"
                      width={600}
                      height={600}
                      className="rounded-2xl object-cover aspect-square shadow-xl"
                    />
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-r from-green-400 to-blue-400 p-4 rounded-full shadow-xl animate-bounce">
                  <Play className="h-6 w-6 text-white" />
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-pink-400 to-purple-400 p-4 rounded-full shadow-xl animate-bounce delay-500">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>

                <div className="absolute top-1/2 -left-8 bg-gradient-to-r from-yellow-400 to-orange-400 p-3 rounded-full shadow-xl animate-pulse">
                  <Crown className="h-5 w-5 text-white" />
                </div>

                {/* Stats Cards */}
                <div className="absolute -bottom-8 right-0 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">10K+</div>
                      <div className="text-sm text-gray-600">طفل سعيد</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-24 sm:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-pink-300 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-300 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-yellow-300 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-4xl text-center mb-20">
            <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-sm px-4 py-2">
              🎯 كيف يعمل
            </Badge>
            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-6">
              كيف نجعل طفلك
              <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                بطل القصة؟
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              اغرس القيم الإسلامية والأخلاقية في قصص مخصصة بـ 3 خطوات بسيطة وسحرية
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Step 1 */}
            <Card className="group relative flex flex-col items-center p-8 text-center transition-all duration-500 ease-out hover:-translate-y-4 hover:scale-105 bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:border-blue-400 shadow-xl hover:shadow-2xl">
              <div className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 font-bold text-white text-2xl ring-8 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300 group-hover:scale-110">
                1
              </div>
              <div className="mt-8 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wand2 className="h-10 w-10 text-blue-600 group-hover:animate-pulse" />
                </div>
              </div>
              <h3 className="font-headline text-2xl font-bold text-gray-800 mb-4">
                إنشاء القصة السحرية
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                اختر شخصياتك وأدخل أفكارك ودع الذكاء الاصطناعي يكتب لك قصة فريدة ومخصصة باسم طفلك
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-blue-600 font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>66 نقطة</span>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="group relative flex flex-col items-center p-8 text-center transition-all duration-500 ease-out hover:-translate-y-4 hover:scale-105 bg-white/80 backdrop-blur-sm border-2 border-purple-200 hover:border-purple-400 shadow-xl hover:shadow-2xl">
              <div className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 font-bold text-white text-2xl ring-8 ring-purple-100 group-hover:ring-purple-200 transition-all duration-300 group-hover:scale-110">
                2
              </div>
              <div className="mt-8 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Palette className="h-10 w-10 text-purple-600 group-hover:animate-pulse" />
                </div>
              </div>
              <h3 className="font-headline text-2xl font-bold text-gray-800 mb-4">
                التلوين والإبداع
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                استخدم أدوات التلوين الرقمية لإضفاء الحياة على صفحات قصتك بألوان زاهية ومبهجة
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-purple-600 font-semibold">
                <Rainbow className="h-4 w-4" />
                <span>مجاناً</span>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="group relative flex flex-col items-center p-8 text-center transition-all duration-500 ease-out hover:-translate-y-4 hover:scale-105 bg-white/80 backdrop-blur-sm border-2 border-pink-200 hover:border-pink-400 shadow-xl hover:shadow-2xl">
              <div className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-500 font-bold text-white text-2xl ring-8 ring-pink-100 group-hover:ring-pink-200 transition-all duration-300 group-hover:scale-110">
                3
              </div>
              <div className="mt-8 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-100 to-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Download className="h-10 w-10 text-pink-600 group-hover:animate-pulse" />
                </div>
              </div>
              <h3 className="font-headline text-2xl font-bold text-gray-800 mb-4">
                المشاركة والحفظ
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                احفظ إبداعاتك في مكتبتك الخاصة، شاركها مع العائلة أو اطبعها بجودة عالية
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-pink-600 font-semibold">
                <Heart className="h-4 w-4" />
                <span>مكتبة شخصية</span>
              </div>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="mt-20 text-center">
            <Button 
              asChild 
              size="lg" 
              className="group bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            >
              <Link href="/create">
                <Wand2 className="ml-2 h-6 w-6 group-hover:animate-spin" />
                ابدأ رحلتك السحرية الآن
                <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                10K+
              </div>
              <div className="text-gray-300">طفل سعيد</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                50K+
              </div>
              <div className="text-gray-300">قصة منشأة</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                100K+
              </div>
              <div className="text-gray-300">صفحة تلوين</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                4.9★
              </div>
              <div className="text-gray-300">تقييم العائلات</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
