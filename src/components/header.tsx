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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
                <Image
                  src="/talween logo.png"
                  alt="Talween Studio Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
            </Link>
             <nav className="hidden items-center gap-6 text-sm lg:flex">
                {navLinks.map(link => {
                    if (link.auth && !user) return null;
                    return <Link key={link.label} href={link.href} className="font-semibold text-muted-foreground transition-colors hover:text-primary">{link.label}</Link>
                })}
            </nav>
        </div>
       
        <div className="flex items-center gap-4">
           {(user && userData) && (
             <Button variant="outline" className="rounded-full hidden sm:flex">
               <Star className="h-4 w-4 ml-2 text-yellow-500 fill-yellow-400" />
               <span className="font-bold">{userData.credits}</span>
               <span className="mr-1">نقطة</span>
             </Button>
           )}
            {user ? (
                 <Button onClick={logout} variant="ghost" size="sm" className="hidden md:flex">
                    <LogOut className="ml-2 h-4 w-4" />
                    خروج
                </Button>
            ) : (
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="sm" className="hidden md:flex">
                        <Link href="/login">
                            <LogIn className="ml-2 h-4 w-4" />
                            دخول
                        </Link>
                    </Button>
                </div>
            )}
            <Button asChild size="sm" className="hidden md:flex">
                <Link href="/create">أنشئ قصة</Link>
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
                                <SheetClose asChild>
                                    <Link href="/login" className='w-full'>
                                        <Button variant="outline" className="w-full justify-center">
                                            <LogIn className="ml-2 h-4 w-4" />
                                            دخول
                                        </Button>
                                    </Link>
                                </SheetClose>
                             )}
                             <SheetClose asChild>
                                <Button asChild className="w-full">
                                    <Link href="/create">أنشئ قصة</Link>
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
