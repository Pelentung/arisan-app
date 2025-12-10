
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useFirestore } from '@/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Loader2, Save, PlusCircle, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ContributionSettings, OtherContribution } from '@/app/data';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, getMonth, getYear, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const otherContributionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nama iuran tidak boleh kosong'),
});

const settingsSchema = z.object({
  main: z.coerce.number().min(0, 'Nominal tidak boleh negatif'),
  cash: z.coerce.number().min(0, 'Nominal tidak boleh negatif'),
  sick: z.coerce.number().min(0, 'Nominal tidak boleh negatif'),
  bereavement: z.coerce.number().min(0, 'Nominal tidak boleh negatif'),
  otherContributions: z.array(otherContributionSchema),
  others: z.record(z.coerce.number().min(0, 'Nominal tidak boleh negatif')),
});

type FormValues = z.infer<typeof settingsSchema>;

const defaultAmounts: FormValues = {
  main: 90000,
  cash: 10000,
  sick: 0,
  bereavement: 0,
  otherContributions: [],
  others: {},
};

const generateMonthOptions = () => {
    const options = [];
    let currentDate = new Date();
    for (let i = 0; i < 12; i++) {
        const monthValue = `${getYear(currentDate)}-${getMonth(currentDate)}`;
        const monthLabel = format(currentDate, 'MMMM yyyy', { locale: id });
        options.push({ value: monthValue, label: monthLabel });
        currentDate = subMonths(currentDate, 1);
    }
    return options;
};

const OtherContributionDialog = ({
    contribution,
    isOpen,
    onClose,
    onSave,
}: {
    contribution: Partial<OtherContribution> | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (contribution: OtherContribution) => void;
}) => {
    const [name, setName] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen && contribution) {
            setName(contribution.name || '');
        }
    }, [isOpen, contribution]);
    
    const handleSave = () => {
        if (!name.trim()) {
            toast({ title: "Nama Iuran Kosong", description: "Nama iuran tidak boleh kosong.", variant: "destructive" });
            return;
        }
        onSave({ id: contribution?.id || `other_${Date.now()}`, name });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{contribution?.id ? 'Ubah Nama Iuran' : 'Tambah Iuran Lainnya'}</DialogTitle>
                    <DialogDescription>Masukkan nama yang deskriptif untuk iuran ini.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="iuran-name">Nama Iuran</Label>
                    <Input id="iuran-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Iuran Agustusan" />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Batal</Button>
                    <Button onClick={handleSave}>Simpan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function KetetapanIuranPage() {
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingSettings, setIsFetchingSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isOtherContribDialogOpen, setIsOtherContribDialogOpen] = useState(false);
  const [selectedOtherContrib, setSelectedOtherContrib] = useState<Partial<OtherContribution> | null>(null);

  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  const form = useForm<FormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultAmounts,
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "otherContributions",
  });

  const resetForm = useCallback((data: ContributionSettings) => {
        const formData: FormValues = {
            main: data.main ?? 0,
            cash: data.cash ?? 0,
            sick: data.sick ?? 0,
            bereavement: data.bereavement ?? 0,
            otherContributions: data.otherContributions ?? [],
            others: data.others ?? {},
        };
        form.reset(formData);
  }, [form]);

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
      setIsFetchingSettings(true);
      const settingsRef = doc(db, 'contributionSettings', selectedMonth);
      const docSnap = await getDoc(settingsRef);

      if (docSnap.exists()) {
        resetForm(docSnap.data() as ContributionSettings);
      } else {
        const q = query(collection(db, 'contributionSettings'), orderBy('__name__', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const mostRecentData = querySnapshot.docs[0].data();
            resetForm(mostRecentData as ContributionSettings);
        } else {
            resetForm(defaultAmounts as ContributionSettings);
        }
      }
      setIsFetchingSettings(false);
    };

    fetchSettings();
  }, [db, user, form, selectedMonth, resetForm]);

  const handleOpenDialog = (contribution: Partial<OtherContribution> | null = null) => {
    setSelectedOtherContrib(contribution);
    setIsOtherContribDialogOpen(true);
  };
  
  const handleSaveOtherContribution = (contribution: OtherContribution) => {
    const existingIndex = fields.findIndex(f => f.id === contribution.id);
    if (existingIndex > -1) {
        update(existingIndex, contribution);
    } else {
        append(contribution);
        // Also add a default amount for the new contribution
        form.setValue(`others.${contribution.id}`, 0);
    }
    setIsOtherContribDialogOpen(false);
    setSelectedOtherContrib(null);
  };

  const handleRemoveOtherContribution = (index: number) => {
      const idToRemove = fields[index].id;
      const currentOthers = form.getValues('others');
      delete currentOthers[idToRemove];
      form.setValue('others', currentOthers);
      remove(index);
  };


  const onSubmit = async (data: FormValues) => {
    if (!db) return;
    setIsSaving(true);
    try {
      const settingsRef = doc(db, 'contributionSettings', selectedMonth);
      await setDoc(settingsRef, data, { merge: true });
      toast({
        title: 'Ketetapan Disimpan',
        description: `Nominal iuran untuk bulan ${monthOptions.find(m => m.value === selectedMonth)?.label} telah berhasil diperbarui.`,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan ketetapan iuran.',
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
          <Header title="Ketetapan Iuran" />
          <main className="flex-1 p-4 md:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                        <div>
                            <CardTitle>Ketetapan Nominal Iuran</CardTitle>
                            <CardDescription>
                              Atur nominal default untuk setiap jenis iuran per bulan.
                            </CardDescription>
                        </div>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth} disabled={isFetchingSettings}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Pilih Bulan" />
                            </SelectTrigger>
                            <SelectContent>{monthOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isFetchingSettings ? (
                        <div className="flex items-center justify-center h-96">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* --- Main Contributions --- */}
                            <Card>
                                <CardHeader><CardTitle>Iuran Pokok</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="main" render={({ field }) => (<FormItem><FormLabel>Iuran Utama</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="cash" render={({ field }) => (<FormItem><FormLabel>Iuran Kas</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </CardContent>
                            </Card>

                             {/* --- Social Contributions --- */}
                            <Card>
                                <CardHeader><CardTitle>Iuran Sosial</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField control={form.control} name="sick" render={({ field }) => (<FormItem><FormLabel>Iuran Sakit</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="bereavement" render={({ field }) => (<FormItem><FormLabel>Iuran Kemalangan</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </CardContent>
                            </Card>
                            
                            {/* --- Other Contributions --- */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Iuran Lainnya</CardTitle>
                                        <CardDescription>Tambah, ubah, atau hapus iuran insidental.</CardDescription>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={() => handleOpenDialog()}><PlusCircle className="mr-2"/>Tambah Iuran</Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-4 p-3 rounded-lg border bg-background">
                                        <FormField
                                            control={form.control}
                                            name={`others.${field.id}`}
                                            render={({ field: amountField }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel>{form.getValues('otherContributions')[index].name}</FormLabel>
                                                    <FormControl><Input type="number" {...amountField} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className='flex items-end h-full gap-2 pt-8'>
                                            <Button type="button" size="icon" variant="ghost" onClick={() => handleOpenDialog(field)}><Edit className="h-4 w-4"/></Button>
                                            <Button type="button" size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleRemoveOtherContribution(index)}><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                ))}
                                {fields.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">Belum ada iuran lainnya.</p>}
                                </CardContent>
                            </Card>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Simpan Ketetapan untuk {monthOptions.find(m => m.value === selectedMonth)?.label}
                                </Button>
                            </div>
                        </div>
                    )}
                  </CardContent>
                </Card>
              </form>
            </Form>
          </main>
        </div>
        
        {isOtherContribDialogOpen && (
             <OtherContributionDialog 
                isOpen={isOtherContribDialogOpen}
                onClose={() => setIsOtherContribDialogOpen(false)}
                contribution={selectedOtherContrib}
                onSave={handleSaveOtherContribution}
             />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
