
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Header({ title }: { title: string }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <SidebarTrigger className="md:hidden" />
      {!isHomePage && (
        <Button asChild variant="default" size="icon" className="h-8 w-8">
            <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Kembali ke Menu Utama</span>
            </Link>
        </Button>
      )}
      <div className="w-full flex-1">
        <h1 className="font-headline text-lg font-semibold md:text-xl">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
        <Search />
        <span className="sr-only">Cari</span>
        </Button>
      </div>
    </header>
  );
}
