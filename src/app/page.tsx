"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRICING_CONFIG } from '@/lib/pricing';
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
import { HomeCTA } from '@/components/home-cta';
import { HeroVideoPlayer } from '@/components/hero-video-player';
import { useAuth } from '@/context/auth-context';

export default function Home() {
  const { user } = useAuth();
  const targetHref = user ? '/create' : '/signup';
  return (
    <div className="bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-talween-white via-talween-yellow/10 to-talween-pink/10 py-20 sm:py-32 overflow-hidden" role="banner">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-talween-pink/20 to-talween-purple/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-talween-yellow/20 to-talween-orange/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-talween-teal/15 to-talween-green/15 rounded-full blur-3xl animate-pulse delay-500"></div>
              </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* Left Side - Content */}
            <div className="text-center lg:text-right space-y-8 order-2 lg:order-1">
              {/* Badge */}
              <div className="flex items-center justify-center gap-4 mb-8 lg:justify-start">
                <div>
                  <Badge className="mb-2 bg-gradient-to-r from-talween-pink to-talween-purple text-white border-0 animate-pulse">
                    ✨ جديد! الذكاء الاصطناعي
                  </Badge>
                  <h1 className="font-headline text-5xl font-bold tracking-tight text-talween-brown sm:text-6xl md:text-7xl">
                    اجعل خيال طفلك
                    <span className="block bg-gradient-to-r from-talween-pink via-talween-purple to-talween-teal bg-clip-text text-transparent animate-pulse">
                      بطل القصة
                    </span>
                  </h1>
              </div>
            </div>

              <p className="text-xl leading-8 text-talween-brown/80 max-w-2xl mx-auto lg:mx-0">
                حوّل الكلمات إلى قصص سحرية وصفحات تلوين مذهلة بقوة الذكاء الاصطناعي. 
                <span className="font-semibold text-talween-orange"> كل قصة فريدة، كل طفل بطل!</span>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center lg:justify-start z-10 relative">
                <HomeCTA />
              </div>

              {/* Free Trial Card */}
              <Card className="mt-8 bg-gradient-to-r from-talween-yellow/20 via-talween-orange/20 to-talween-pink/20 border-2 border-talween-yellow/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="rounded-full bg-gradient-to-r from-talween-yellow to-talween-orange p-3 animate-pulse">
                          <Star className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-talween-red rounded-full animate-bounce">
                          <span className="text-xs text-white font-bold">!</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-talween-brown">جرب مجاناً الآن!</h3>
                        <p className="text-sm text-talween-brown/70">
                          128 نقطة مجانية - قصة كاملة + صفحات تلوين
                        </p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-talween-orange to-talween-pink hover:from-talween-orange/90 hover:to-talween-pink/90 text-white font-bold rounded-full px-6">
                      ابدأ الآن
                    </Button>
                  </div>
                </CardContent>
                </Card>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm lg:justify-start">
                <div className="flex items-center gap-2 bg-talween-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <ShieldCheck className="h-5 w-5 text-talween-green" />
                  <span className="font-semibold text-talween-brown">أمن للأطفال</span>
                </div>
                <div className="flex items-center gap-2 bg-talween-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <Award className="h-5 w-5 text-talween-teal" />
                  <span className="font-semibold text-talween-brown">معتمد تعليمياً</span>
                </div>
                <div className="flex items-center gap-2 bg-talween-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                  <Heart className="h-5 w-5 text-talween-red" />
                  <span className="font-semibold text-talween-brown">محبوب من العائلات</span>
                </div>
              </div>
            </div>

            {/* Right Side - Visual */}
            <div className="relative flex items-center justify-center order-1 lg:order-2">
              <div className="relative w-full max-w-lg mx-auto">
                {/* Main Video Container */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-4 shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-105">
                    <HeroVideoPlayer
                      videoSrc="/herovideo.mp4"
                      poster="https://images.unsplash.com/photo-1612539466809-8be5e4e01256?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxraWRzJTIwY29sb3Jpbmd8ZW58MHx8fHwxNzU2MTMxMzYzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                      className="w-full h-[300px] xs:h-[350px] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px] rounded-2xl"
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
      <section className="relative bg-gradient-to-br from-talween-white via-talween-teal/5 to-talween-green/5 py-24 sm:py-32 overflow-hidden" role="main">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-talween-pink rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-talween-teal rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-talween-yellow rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-4xl text-center mb-20">
            <Badge className="mb-6 bg-gradient-to-r from-talween-teal to-talween-purple text-white border-0 text-sm px-4 py-2">
              🎯 كيف يعمل
            </Badge>
            <h2 className="font-headline text-4xl font-bold tracking-tight text-talween-brown sm:text-5xl mb-6">
              كيف نجعل طفلك
              <span className="block bg-gradient-to-r from-talween-teal via-talween-purple to-talween-pink bg-clip-text text-transparent">
                بطل القصة؟
              </span>
            </h2>
            <p className="text-xl text-talween-brown/80 max-w-3xl mx-auto">
              اغرس القيم الإسلامية والأخلاقية في قصص مخصصة بـ 3 خطوات بسيطة وسحرية
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {/* Step 1 */}
            <Card className="group relative flex flex-col items-center p-8 text-center transition-all duration-500 ease-out hover:-translate-y-4 hover:scale-105 bg-talween-white/80 backdrop-blur-sm border-2 border-talween-teal/30 hover:border-talween-teal/50 shadow-xl hover:shadow-2xl">
              <div className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-talween-teal to-talween-purple font-bold text-white text-2xl ring-8 ring-talween-teal/20 group-hover:ring-talween-teal/30 transition-all duration-300 group-hover:scale-110">
                1
              </div>
              <div className="mt-8 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-talween-teal/20 to-talween-purple/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wand2 className="h-10 w-10 text-talween-teal group-hover:animate-pulse" />
                </div>
              </div>
              <h3 className="font-headline text-2xl font-bold text-talween-brown mb-4">
                إنشاء القصة السحرية
              </h3>
              <p className="text-talween-brown/70 text-lg leading-relaxed">
                اختر شخصياتك وأدخل أفكارك ودع الذكاء الاصطناعي يكتب لك قصة فريدة ومخصصة باسم طفلك
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-talween-teal font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>{PRICING_CONFIG.FEATURE_COSTS.STORY_WITH_CHILD_NAME} نقطة</span>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="group relative flex flex-col items-center p-8 text-center transition-all duration-500 ease-out hover:-translate-y-4 hover:scale-105 bg-talween-white/80 backdrop-blur-sm border-2 border-talween-purple/30 hover:border-talween-purple/50 shadow-xl hover:shadow-2xl">
              <div className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-talween-purple to-talween-pink font-bold text-white text-2xl ring-8 ring-talween-purple/20 group-hover:ring-talween-purple/30 transition-all duration-300 group-hover:scale-110">
                2
              </div>
              <div className="mt-8 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-talween-purple/20 to-talween-pink/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Palette className="h-10 w-10 text-talween-purple group-hover:animate-pulse" />
                </div>
              </div>
              <h3 className="font-headline text-2xl font-bold text-talween-brown mb-4">
                التلوين والإبداع
              </h3>
              <p className="text-talween-brown/70 text-lg leading-relaxed">
                استخدم أدوات التلوين الرقمية لإضفاء الحياة على صفحات قصتك بألوان زاهية ومبهجة
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-talween-purple font-semibold">
                <Rainbow className="h-4 w-4" />
                <span>مجاناً</span>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="group relative flex flex-col items-center p-8 text-center transition-all duration-500 ease-out hover:-translate-y-4 hover:scale-105 bg-talween-white/80 backdrop-blur-sm border-2 border-talween-pink/30 hover:border-talween-pink/50 shadow-xl hover:shadow-2xl">
              <div className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-talween-pink to-talween-red font-bold text-white text-2xl ring-8 ring-talween-pink/20 group-hover:ring-talween-pink/30 transition-all duration-300 group-hover:scale-110">
                3
              </div>
              <div className="mt-8 mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-talween-pink/20 to-talween-red/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Download className="h-10 w-10 text-talween-pink group-hover:animate-pulse" />
                </div>
              </div>
              <h3 className="font-headline text-2xl font-bold text-talween-brown mb-4">
                المشاركة والحفظ
              </h3>
              <p className="text-talween-brown/70 text-lg leading-relaxed">
                احفظ إبداعاتك في مكتبتك الخاصة، شاركها مع العائلة أو اطبعها بجودة عالية
              </p>
              <div className="mt-6 flex items-center gap-2 text-sm text-talween-pink font-semibold">
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
              className="group bg-gradient-to-r from-talween-teal via-talween-purple to-talween-pink hover:from-talween-teal/90 hover:via-talween-purple/90 hover:to-talween-pink/90 text-white font-bold text-xl px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
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
      <section className="bg-gradient-to-r from-talween-brown via-talween-purple to-talween-brown py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-talween-teal to-talween-purple bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                10K+
              </div>
              <div className="text-talween-white/80">طفل سعيد</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-talween-pink to-talween-red bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                50K+
              </div>
              <div className="text-talween-white/80">قصة منشأة</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-talween-green to-talween-teal bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                100K+
              </div>
              <div className="text-talween-white/80">صفحة تلوين</div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-talween-yellow to-talween-orange bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                4.9★
              </div>
              <div className="text-talween-white/80">تقييم العائلات</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
