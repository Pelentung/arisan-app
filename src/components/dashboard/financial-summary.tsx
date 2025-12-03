'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { arisanData } from '@/app/data';
import { useMemo } from 'react';

export function FinancialSummary() {
  const { remainingCash } =
    useMemo(() => {
      const totalIncome = arisanData.payments
        .filter((p) => p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0);

      const totalExpenses = arisanData.expenses.reduce((sum, e) => sum + e.amount, 0);

      const remainingCash = totalIncome - totalExpenses;

      return { remainingCash };
    }, []);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:border-primary/50 transition-colors lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Sisa Kas
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(remainingCash)}
          </div>
          <p className="text-xs text-muted-foreground">Saldo kas sampai dengan saat ini</p>
        </CardContent>
      </Card>
    </div>
  );
}
