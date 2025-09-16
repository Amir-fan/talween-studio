'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { User, Library, Menu, BookOpen, School, ShoppingCart, LogOut, LogIn, Star } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { useAuth } from '@/context/auth-context';

export default function Header() {
    const { user, userData, logout, isAdmin, loginAsAdmin } = useAuth();

    const navLinks = [
        { href: "/create", label: "إنشاء", icon: BookOpen },
        { href: "/library", label: "مكتبتي", icon: Library, auth: true },
        { href: "/account", label: "حسابي", icon: User, auth: true },
        { href: "/packages", label: "الاشتراك", icon: ShoppingCart },
        { href: "/schools", label: "المدارس", icon: School },
    ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-talween-yellow/20 bg-talween-white/95 backdrop-blur supports-[backdrop-filter]:bg-talween-white/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
                <Image
                  src="/talween logo new.png"
                  alt="Talween Studio Logo"
                  width={70}
                  height={70}
                  className="h-18 w-18"
                />
            </Link>
             <nav className="hidden items-center gap-6 text-sm lg:flex">
                {navLinks.map(link => {
                    if (link.auth && !user) return null;
                    return <Link key={link.label} href={link.href} className="font-semibold text-talween-brown/70 transition-colors hover:text-talween-orange">{link.label}</Link>
                })}
            </nav>
        </div>
       
        <div className="flex items-center gap-4">
           {(user && userData) && (
             <Button variant="outline" className="rounded-full hidden sm:flex border-talween-yellow/30 bg-talween-yellow/10 hover:bg-talween-yellow/20">
               <Star className="h-4 w-4 ml-2 text-talween-yellow fill-talween-yellow" />
               <span className="font-bold text-talween-brown">{userData.credits}</span>
               <span className="mr-1 text-talween-brown">نقطة</span>
             </Button>
           )}
            {user ? (
                 <Button onClick={logout} variant="ghost" size="sm" className="hidden md:flex">
                    <LogOut className="ml-2 h-4 w-4" />
                    خروج
                </Button>
            ) : (
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="sm" className="hidden md:flex">
                        <Link href="/login">
                            <LogIn className="ml-2 h-4 w-4" />
                            دخول
                        </Link>
                    </Button>
                    <Button asChild size="lg" className="hidden md:flex bg-gradient-to-r from-talween-green to-talween-teal hover:from-talween-green/90 hover:to-talween-teal/90 text-white font-bold px-6 py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                        <Link href="/signup">إنشاء حساب</Link>
                    </Button>
                </div>
            )}
            <Button asChild size="lg" className="hidden md:flex bg-gradient-to-r from-talween-pink to-talween-purple hover:from-talween-pink/90 hover:to-talween-purple/90 text-white font-bold px-6 py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Link href="/signup">أنشئ قصة</Link>
            </Button>
            
            {/* Mobile Menu */}
            <div className="lg:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                        <SheetHeader>
                            <SheetTitle className="sr-only">القائمة</SheetTitle>
                        </SheetHeader>
                         <nav className="flex flex-col gap-4 mt-8">
                            {navLinks.map((link) => {
                                 if (link.auth && !user) return null;
                                 return (
                                    <SheetClose asChild key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-lg font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
                                        >
                                            <link.icon className="h-5 w-5" />
                                            {link.label}
                                        </Link>
                                    </SheetClose>
                                )
                            })}
                        </nav>
                        <div className="absolute bottom-4 right-4 left-4 flex flex-col gap-2">
                             {user ? (
                                <Button onClick={() => {logout();}} variant="outline" className="w-full justify-center">
                                    <LogOut className="ml-2 h-4 w-4" />
                                    خروج
                                </Button>
                             ) : (
                                <>
                                    <SheetClose asChild>
                                        <Link href="/login" className='w-full'>
                                            <Button variant="outline" className="w-full justify-center">
                                                <LogIn className="ml-2 h-4 w-4" />
                                                دخول
                                            </Button>
                                        </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                        <Link href="/signup" className='w-full'>
                                            <Button className="w-full justify-center bg-gradient-to-r from-talween-green to-talween-teal hover:from-talween-green/90 hover:to-talween-teal/90 text-white font-bold">
                                                إنشاء حساب
                                            </Button>
                                        </Link>
                                    </SheetClose>
                                </>
                             )}
                             <SheetClose asChild>
                                <Button asChild className="w-full bg-gradient-to-r from-talween-pink to-talween-purple hover:from-talween-pink/90 hover:to-talween-purple/90 text-white font-bold">
                                    <Link href="/signup">أنشئ قصة</Link>
                                </Button>
                             </SheetClose>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
