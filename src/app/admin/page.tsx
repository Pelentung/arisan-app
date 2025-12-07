
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ContributionSettings, OtherContribution } from '@/app/data';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, PlusCircle, Trash2, Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subMonths, getYear, getMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const parseCurrency = (value: string) => {
    return Number(value.replace(/[^0-9]/g, ''));
}

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

export default function AdminPage() {
  const { toast } = useToast();
  const db = useFirestore();
  const [settings, setSettings] = useState<ContributionSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const monthOptions = useMemo(() => generateMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  useEffect(() => {
    if (!db) return;

    setIsLoading(true);
    const docId = selectedMonth;
    const docRef = doc(db, 'contributionSettings', docId);

    getDoc(docRef).then(docSnap => {
        if (docSnap.exists()) {
            setSettings(docSnap.data() as ContributionSettings);
        } else {
            // If settings for the selected month don't exist,
            // try to fetch from the previous month as a fallback.
            const [year, month] = selectedMonth.split('-').map(Number);
            const prevMonthDate = subMonths(new Date(year, month), 1);
            const prevMonthId = `${getYear(prevMonthDate)}-${getMonth(prevMonthDate)}`;
            const prevDocRef = doc(db, 'contributionSettings', prevMonthId);

            getDoc(prevDocRef).then(prevDocSnap => {
                if (prevDocSnap.exists()) {
                    setSettings(prevDocSnap.data() as ContributionSettings);
                     toast({
                        title: `Pengaturan untuk ${format(new Date(year, month), 'MMMM yyyy', { locale: id })} belum ada.`,
                        description: `Menampilkan pengaturan dari ${format(prevMonthDate, 'MMMM yyyy', { locale: id })} sebagai gantinya.`,
                        variant: 'default',
                    });
                } else {
                    setSettings({ main: 0, cash: 0, sick: 0, bereavement: 0, others: [] });
                }
            });
        }
        setIsLoading(false);
    });
  }, [db, selectedMonth, toast]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Omit<ContributionSettings, 'others'>
  ) => {
    if (!settings) return;
    const value = parseCurrency(e.target.value);
    const formattedValue = formatCurrency(value);
    e.target.value = formattedValue;
    setSettings({ ...settings, [field]: value });
  };
  
  const handleOtherAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    if (!settings) return;
    const value = parseCurrency(e.target.value);
    const formattedValue = formatCurrency(value);
    e.target.value = formattedValue;
    const newOthers = settings.others.map(o =>
      o.id === id ? { ...o, amount: value } : o
    );
    setSettings({ ...settings, others: newOthers });
  };
  
  const handleOtherDescriptionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    if (!settings) return;
    const newOthers = settings.others.map(o =>
      o.id === id ? { ...o, description: e.target.value } : o
    );
    setSettings({ ...settings, others: newOthers });
  };

  const addOtherContribution = () => {
    if (!settings) return;
    const newOther: OtherContribution = {
      id: `other-${Date.now()}`,
      description: '',
      amount: 0,
    };
    setSettings({ ...settings, others: [...settings.others, newOther] });
  };
  
  const removeOtherContribution = (id: string) => {
    if (!settings) return;
    const newOthers = settings.others.filter(o => o.id !== id);
    setSettings({ ...settings, others: newOthers });
  };

  const handleSave = async () => {
    if (!db || !settings) return;
    
    setIsLoading(true);
    const docId = selectedMonth;
    const docRef = doc(db, 'contributionSettings', docId);

    try {
      await setDoc(docRef, settings);
      toast({
        title: 'Pengaturan Disimpan',
        description: `Ketetapan iuran untuk ${monthOptions.find(m => m.value === selectedMonth)?.label} telah disimpan.`,
      });
    } catch (error) {
      console.error("Error saving settings: ", error);
      toast({
        title: 'Gagal Menyimpan',
        description: 'Terjadi kesalahan saat menyimpan pengaturan.',
        variant: 'destructive',
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarNav />
        </Sidebar>
        <SidebarInset>
            <div className="flex flex-col min-h-screen">
                <Header title="Ketetapan Iuran" />
                <main className="flex-1 p-4 md:p-6">
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <CardTitle>Ketetapan Iuran Bulanan</CardTitle>
                                <CardDescription>
                                Atur nominal iuran untuk setiap kategori pada bulan yang dipilih.
                                </CardDescription>
                            </div>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-full md:w-[220px]">
                                    <SelectValue placeholder="Pilih Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : settings ? (
                                <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {([
                                    { id: 'main', label: 'Iuran Utama' },
                                    { id: 'cash', label: 'Iuran Kas' },
                                    { id: 'sick', label: 'Iuran Sakit' },
                                    { id: 'bereavement', label: 'Iuran Kemalangan' },
                                    ] as const).map(item => (
                                    <div key={item.id} className="space-y-2">
                                        <Label htmlFor={item.id} className="flex items-center gap-2 text-base">
                                            <Shield className="h-5 w-5 text-primary" /> {item.label}
                                        </Label>
                                        <Input
                                        id={item.id}
                                        type="text"
                                        inputMode="numeric"
                                        defaultValue={formatCurrency(settings[item.id])}
                                        onBlur={(e) => handleInputChange(e, item.id)}
                                        placeholder="Rp 0"
                                        />
                                    </div>
                                    ))}
                                </div>
                                
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-medium">Iuran Lainnya</h3>
                                        <Button variant="outline" size="sm" onClick={addOtherContribution}>
                                            <PlusCircle className="mr-2 h-4 w-4" /> Tambah
                                        </Button>
                                    </div>
                                    {settings.others.map((other, index) => (
                                    <div key={other.id} className="grid grid-cols-1 md:grid-cols-10 gap-2 items-end p-3 rounded-lg border bg-muted/50">
                                        <div className="md:col-span-5 space-y-1">
                                            <Label htmlFor={`other-desc-${other.id}`}>Deskripsi</Label>
                                            <Input
                                                id={`other-desc-${other.id}`}
                                                value={other.description}
                                                onChange={(e) => handleOtherDescriptionChange(e, other.id)}
                                                placeholder={`Contoh: Iuran Baju Seragam`}
                                            />
                                        </div>
                                        <div className="md:col-span-4 space-y-1">
                                            <Label htmlFor={`other-amount-${other.id}`}>Jumlah</Label>
                                            <Input
                                                id={`other-amount-${other.id}`}
                                                type="text"
                                                inputMode="numeric"
                                                defaultValue={formatCurrency(other.amount)}
                                                onBlur={(e) => handleOtherAmountChange(e, other.id)}
                                                placeholder="Rp 0"
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <Button variant="destructive" size="icon" onClick={() => removeOtherContribution(other.id)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Hapus</span>
                                            </Button>
                                        </div>
                                    </div>
                                    ))}
                                </div>

                                <div className="flex justify-end pt-6">
                                    <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan Pengaturan untuk {monthOptions.find(m => m.value === selectedMonth)?.label}
                                    </Button>
                                </div>
                                </div>
                            ) : (
                                <p>Gagal memuat pengaturan.</p>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </SidebarInset>
    </SidebarProvider>
  );
}

    