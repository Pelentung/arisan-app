'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, PiggyBank, CircleAlert } from 'lucide-react';
import { arisanData } from '@/app/data';
import { useMemo } from 'react';

export function FinancialSummary() {
  const { totalContributions, currentPayout, outstandingPaymentsCount } =
    useMemo(() => {
      const paidPayments = arisanData.payments.filter((p) => p.status === 'Paid');
      const totalContributions = paidPayments.reduce((sum, p) => sum + p.amount, 0);
      
      const mainGroup = arisanData.groups[0];
      const currentPayout = mainGroup ? mainGroup.contributionAmount * mainGroup.memberIds.length : 0;
      
      const outstandingPaymentsCount = arisanData.payments.filter(
        (p) => p.status === 'Unpaid' || p.status === 'Late'
      ).length;

      return { totalContributions, currentPayout, outstandingPaymentsCount };
    }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Iuran (Siklus Ini)
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(totalContributions)}
          </div>
          <p className="text-xs text-muted-foreground">+2 pembayaran dari siklus lalu</p>
        </CardContent>
      </Card>
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Jumlah Pencairan Saat Ini</CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(currentPayout)}
          </div>
          <p className="text-xs text-muted-foreground">Untuk grup "Arisan Utama 2024"</p>
        </CardContent>
      </Card>
      <Card className="hover:border-destructive/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pembayaran Tertunggak</CardTitle>
          <CircleAlert className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{outstandingPaymentsCount} Anggota</div>
          <p className="text-xs text-muted-foreground">Untuk siklus saat ini</p>
        </CardContent>
      </Card>
    </div>
  );
}
