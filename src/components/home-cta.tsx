"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Wand2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export function HomeCTA() {
  const { user } = useAuth();
  const targetHref = user ? '/create' : '/signup';

  return (
    <>
      <Button
        asChild
        size="lg"
        className="group w-full sm:w-auto rounded-full bg-gradient-to-r from-talween-green to-talween-teal hover:from-talween-green/90 hover:to-talween-teal/90 text-white font-bold text-xl px-10 py-7 shadow-2xl hover:shadow-talween-green/25 transition-all duration-300 hover:scale-110 animate-pulse"
      >
        <Link href={targetHref} className="inline-flex items-center">
          <Star className="ml-2 h-7 w-7 group-hover:animate-spin" />
          ابدأ مجاناً الآن
          <ArrowRight className="mr-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>

      <Button
        asChild
        size="lg"
        className="group w-full sm:w-auto rounded-full bg-gradient-to-r from-talween-pink via-talween-purple to-talween-teal hover:from-talween-pink/90 hover:via-talween-purple/90 hover:to-talween-teal/90 text-white font-bold text-xl px-10 py-7 shadow-2xl hover:shadow-talween-pink/25 transition-all duration-300 hover:scale-110"
      >
        <Link href={targetHref} className="inline-flex items-center">
          <Wand2 className="ml-2 h-7 w-7 group-hover:animate-spin" />
          أنشئ قصة سحرية
          <ArrowRight className="mr-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
        </Link>
      </Button>
    </>
  );
}


