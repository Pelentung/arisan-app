
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useFirestore } from '@/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ContributionSettings } from '@/app/data';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const settingsSchema = z.object({
  main: z.string().min(1, 'Label tidak boleh kosong'),
  cash: z.string().min(1, 'Label tidak boleh kosong'),
  sick: z.string().min(1, 'Label tidak boleh kosong'),
  bereavement: z.string().min(1, 'Label tidak boleh kosong'),
  other1: z.string().min(1, 'Label tidak boleh kosong'),
  other2: z.string().min(1, 'Label tidak boleh kosong'),
  other3: z.string().min(1, 'Label tidak boleh kosong'),
});

const defaultLabels: ContributionSettings = {
  main: 'Iuran Utama',
  cash: 'Iuran Kas',
  sick: 'Iuran Sakit',
  bereavement: 'Iuran Kemalangan',
  other1: 'Lainnya 1',
  other2: 'Lainnya 2',
  other3: 'Lainnya 3',
};

export default function PengaturanPage() {
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultLabels,
  });

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.isAnonymous) {
        router.push('/');
      } else {
        setUser(currentUser);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    if (!db || !user) return;

    const fetchSettings = async () => {
      const settingsRef = doc(db, 'contributionSettings', 'labels');
      const docSnap = await getDoc(settingsRef);

      if (docSnap.exists()) {
        form.reset(docSnap.data() as ContributionSettings);
      } else {
        // If no settings exist, create them with default values
        await setDoc(settingsRef, defaultLabels);
      }
    };

    fetchSettings();
  }, [db, user, form]);

  const onSubmit = async (data: z.infer<typeof settingsSchema>) => {
    if (!db) return;
    setIsSaving(true);
    try {
      const settingsRef = doc(db, 'contributionSettings', 'labels');
      await setDoc(settingsRef, data, { merge: true });
      toast({
        title: 'Pengaturan Disimpan',
        description: 'Nama label iuran telah berhasil diperbarui.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan pengaturan.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

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
          <Header title="Pengaturan Aplikasi" />
          <main className="flex-1 p-4 md:p-6">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Label Iuran</CardTitle>
                <CardDescription>
                  Ubah nama label untuk berbagai jenis iuran. Perubahan ini akan
                  tercermin di halaman Pengelolaan Keuangan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="main"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label Iuran Utama</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cash"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label Iuran Kas</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sick"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label Iuran Sakit</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bereavement"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label Iuran Kemalangan</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="other1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label Lainnya 1</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="other2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label Lainnya 2</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name="other3"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Label Lainnya 3</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="mr-2 h-4 w-4" />
                        )}
                        Simpan Perubahan
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

