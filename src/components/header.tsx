'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { User, Library, Menu, BookOpen, School, ShoppingCart, LogOut, LogIn, Star } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { useAuth } from '@/context/auth-context';

export default function Header() {
    const { user, userData, logout } = useAuth();

    const navLinks = [
        { href: "/create", label: "إنشاء", icon: BookOpen },
        { href: "/library", label: "مكتبتي", icon: Library, auth: true },
        { href: "/account", label: "حسابي", icon: User, auth: true },
        { href: "/packages", label: "الاشتراك", icon: ShoppingCart },
        { href: "#", label: "المدارس", icon: School },
    ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16C2 23.732 8.26801 30 16 30Z" fill="#FFD400"/>
                <path d="M13.5707 10.4C13.8827 9.80801 14.7307 9.80801 15.0427 10.4L16.0347 12.296C16.1627 12.536 16.4267 12.688 16.7147 12.688H18.7187C19.3467 12.688 19.6427 13.48 19.1627 13.84L17.5947 14.936C17.3707 15.096 17.2667 15.392 17.3627 15.656L17.9867 17.44C18.1907 18.016 17.5187 18.496 17.0227 18.16L15.4147 17.08C15.1747 16.904 14.8507 16.904 14.6107 17.08L12.9947 18.16C12.4987 18.496 11.8267 18.016 12.0307 17.44L12.6547 15.656C12.7507 15.392 12.6467 15.096 12.4227 14.936L10.8547 13.84C10.3747 13.48 10.6707 12.688 11.2987 12.688H13.3027C13.5907 12.688 13.8547 12.536 13.9827 12.296L14.9747 10.4H13.5707Z" fill="#F48C06"/>
                </svg>
                 <span className="font-headline text-lg font-bold hidden sm:inline">Talween Studio</span>
            </Link>
             <nav className="hidden items-center gap-6 text-sm lg:flex">
                {navLinks.map(link => {
                    if (link.auth && !user) return null;
                    return <Link key={link.label} href={link.href} className="font-semibold text-muted-foreground transition-colors hover:text-primary">{link.label}</Link>
                })}
            </nav>
        </div>
       
        <div className="flex items-center gap-4">
           {user && userData && (
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
                <Button asChild variant="ghost" size="sm" className="hidden md:flex">
                    <Link href="/login">
                        <LogIn className="ml-2 h-4 w-4" />
                        دخول
                    </Link>
                </Button>
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
