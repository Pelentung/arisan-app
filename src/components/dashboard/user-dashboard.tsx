
'use client';

import { Header } from '@/components/layout/header';
import { MonthlyReport } from '@/components/laporan/monthly-report';
import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';
import { initializeFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { WinnerHistory } from './winner-history';
import { AnnouncementsList } from '../laporan/announcements-list';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';

export function UserDashboard() {
    const { auth } = initializeFirebase();
    const router = useRouter();

    const handleSignOut = async () => {
        await auth.signOut();
        router.push('/');
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header title="Menu Utama" />
            <main className="flex-1 p-4 md:p-6 space-y-6">
                 <div className="flex items-center justify-between">
                    <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
                        Laporan & Pengumuman
                    </h1>
                    <Button variant="outline" onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar
                    </Button>
                 </div>
                 
                 <Card>
                    <CardHeader>
                        <CardTitle>Pengumuman</CardTitle>
                        <CardDescription>Informasi penting dan terkini dari pengurus arisan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnnouncementsList />
                    </CardContent>
                 </Card>

                <MonthlyReport />
                
                <Card>
                    <CardHeader>
                        <CardTitle>Anggota Yang Sudah Narik</CardTitle>
                        <CardDescription>Daftar anggota yang sudah pernah memenangkan undian di setiap grup.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WinnerHistory />
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

    