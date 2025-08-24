import Link from 'next/link';
import { Button } from './ui/button';
import { User, Globe } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <div className="mr-8 flex">
          <Link href="/" className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16C2 23.732 8.26801 30 16 30Z" fill="#FFD400"/>
              <path d="M13.5707 10.4C13.8827 9.80801 14.7307 9.80801 15.0427 10.4L16.0347 12.296C16.1627 12.536 16.4267 12.688 16.7147 12.688H18.7187C19.3467 12.688 19.6427 13.48 19.1627 13.84L17.5947 14.936C17.3707 15.096 17.2667 15.392 17.3627 15.656L17.9867 17.44C18.1907 18.016 17.5187 18.496 17.0227 18.16L15.4147 17.08C15.1747 16.904 14.8507 16.904 14.6107 17.08L12.9947 18.16C12.4987 18.496 11.8267 18.016 12.0307 17.44L12.6547 15.656C12.7507 15.392 12.6467 15.096 12.4227 14.936L10.8547 13.84C10.3747 13.48 10.6707 12.688 11.2987 12.688H13.3027C13.5907 12.688 13.8547 12.536 13.9827 12.296L14.9747 10.4H13.5707Z" fill="#F48C06"/>
            </svg>
            <span className="font-headline text-xl font-bold">أهلاً بكم في تلوين</span>
          </Link>
        </div>
        <nav className="hidden items-center gap-6 text-sm lg:flex">
          <Link href="#" className="font-semibold transition-colors hover:text-primary">إنشاء</Link>
          <Link href="#" className="font-semibold text-muted-foreground transition-colors hover:text-primary">القوالب</Link>
          <Link href="#" className="font-semibold text-muted-foreground transition-colors hover:text-primary">التلوين</Link>
          <Link href="#" className="font-semibold text-muted-foreground transition-colors hover:text-primary">مكتبتي</Link>
          <Link href="#" className="font-semibold text-muted-foreground transition-colors hover:text-primary">المدارس</Link>
          <Link href="#" className="font-semibold text-muted-foreground transition-colors hover:text-primary">حسابي</Link>
          <Link href="#" className="font-semibold text-muted-foreground transition-colors hover:text-primary">الاشتراك</Link>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-4">
          <Button variant="ghost" size="sm" className="hidden items-center gap-2 md:flex">
            <Globe />
            English
          </Button>
          <Button variant="outline" size="sm" className="hidden items-center gap-2 md:flex">
            <User />
            حسابي
          </Button>
          <Button size="sm">أنشئ قصة</Button>
        </div>
      </div>
    </header>
  );
}
