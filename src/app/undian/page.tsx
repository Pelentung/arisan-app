
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import type { Group, Member } from '@/app/data';
import { subscribeToData } from '@/app/data';
import { LotteryCard } from '@/components/undian/lottery-card';
import { useFirestore, useAuth } from '@/firebase';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function UndianPage() {
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.isAnonymous) {
        router.push('/');
      } else {
        setUser(currentUser);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    if (!db || !user) return;
    
    let groupsLoaded = false;
    let membersLoaded = false;

    const checkLoading = () => {
        if (groupsLoaded && membersLoaded) {
            setIsLoadingData(false);
        }
    }

    const unsubGroups = subscribeToData(db, 'groups', (data) => {
        setGroups(data as Group[]);
        groupsLoaded = true;
        checkLoading();
    });

    const unsubMembers = subscribeToData(db, 'members', (data) => {
        setMembers(data as Member[]);
        membersLoaded = true;
        checkLoading();
    });

    return () => {
        unsubGroups();
        unsubMembers();
    };
  }, [db, user]);

  const isLoading = isLoadingAuth || isLoadingData;
    
  const groupMain = groups.find(g => g.name === 'Arisan Utama');
  const group10k = groups.find(g => g.name === 'Arisan Uang Kaget Rp. 10.000');
  const group20k = groups.find(g => g.name === 'Arisan Uang Kaget Rp. 20.000');
  
    if (isLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarNav />
        </Sidebar>
        <SidebarInset>
            <div className="flex flex-col min-h-screen">
                <Header title="Yang Sudah Narik" />
                <main className="flex-1 p-4 md:p-6 space-y-6">
                    
                    <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
                        Daftar Anggota Yang Sudah Narik
                    </h1>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {groupMain && (
                        <LotteryCard 
                        group={groupMain}
                        members={members}
                        title="Grup Arisan Utama"
                        description="Daftar anggota yang sudah menarik dari grup utama."
                        />
                    )}
                    {group20k && (
                        <LotteryCard 
                        group={group20k}
                        members={members}
                        title="Arisan Uang Kaget Rp. 20.000"
                        description="Daftar anggota yang sudah menarik dari grup Uang Kaget Rp. 20.000."
                        />
                    )}
                    {group10k && (
                        <LotteryCard 
                        group={group10k}
                        members={members}
                        title="Arisan Uang Kaget Rp. 10.000"
                        description="Daftar anggota yang sudah menarik dari grup Uang Kaget Rp. 10.000."
                        />
                    )}
                    </div>
                </main>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}

    