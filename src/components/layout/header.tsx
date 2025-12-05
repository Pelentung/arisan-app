
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { initializeFirebase } from '@/firebase';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function Header({ title, isMarquee = false }: { title: string, isMarquee?: boolean }) {
  const { auth } = initializeFirebase();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Don't show sidebar trigger for anonymous users as they don't have a sidebar
  const showSidebarTrigger = user && !user.isAnonymous;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      {showSidebarTrigger && <SidebarTrigger className="md:hidden" />}
      <div className={cn("w-full flex-1", isMarquee && "overflow-hidden")}>
        {isMarquee ? (
           <h1 className="font-headline text-lg font-semibold md:text-xl block whitespace-nowrap animate-marquee">
             {title}
           </h1>
        ) : (
          <h1 className="font-headline text-lg font-semibold md:text-xl">
            {title}
          </h1>
        )}
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
