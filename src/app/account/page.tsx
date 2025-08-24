import Link from 'next/link';
import { ArrowRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-yellow-50/30">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between">
            <div/>
          <div className="text-right flex items-center gap-3">
            <h1 className="font-headline text-3xl font-bold text-foreground">
              حسابي
            </h1>
            <User className="h-8 w-8 text-primary" />
          </div>
        </header>
         <div className="mt-8 flex h-96 items-center justify-center rounded-lg bg-secondary/50">
            <p className="text-muted-foreground">سيتم بناء هذه الصفحة قريبًا.</p>
        </div>
      </div>
    </div>
  );
}
