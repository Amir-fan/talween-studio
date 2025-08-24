import Link from 'next/link';
import { Paintbrush } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <Paintbrush className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg font-bold">Talween Studio</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Talween Studio. كل الحقوق محفوظة.
          </p>
          <div className="flex gap-4">
            <Link href="/legal/privacy" className="text-sm text-muted-foreground hover:text-primary">
              الخصوصية
            </Link>
            <Link href="/legal/terms" className="text-sm text-muted-foreground hover:text-primary">
              الشروط
            </Link>
            <Link href="/legal/cookies" className="text-sm text-muted-foreground hover:text-primary">
              الكوكيز
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
