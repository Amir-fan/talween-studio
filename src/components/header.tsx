import Link from 'next/link';
import { Button } from './ui/button';
import { Paintbrush } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center gap-2">
            <Paintbrush className="h-7 w-7 text-primary" />
            <span className="font-headline text-xl font-bold">Talween Studio</span>
          </Link>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            الرئيسية
          </Link>
          <Link
            href="/create"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            إنشاء
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-4">
          <Button>تسجيل الدخول</Button>
        </div>
      </div>
    </header>
  );
}
