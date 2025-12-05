
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import type { Group, Member } from '@/app/data';
import { subscribeToData } from '@/app/data';
import { LotteryCard } from '@/components/undian/lottery-card';
import { useFirestore } from '@/firebase';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Loader2 } from 'lucide-react';

export default function UndianPage() {
  const db = useFirestore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    
    let groupsLoaded = false;
    let membersLoaded = false;

    const checkLoading = () => {
        if (groupsLoaded && membersLoaded) {
            setIsLoading(false);
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
  }, [db]);
    
  const groupMain = groups.find(g => g.name === 'Arisan Utama');
  const group10k = groups.find(g => g.name === 'Arisan Uang Kaget Rp. 10.000');
  const group20k = groups.find(g => g.name === 'Arisan Uang Kaget Rp. 20.000');
  
  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarNav />
        </Sidebar>
        <SidebarInset>
            <div className="flex flex-col min-h-screen">
                <Header title="Yang Sudah Narik" />
                <main className="flex-1 p-4 md:p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center pt-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-4 text-muted-foreground">Memuat data undian...</p>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </main>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}
