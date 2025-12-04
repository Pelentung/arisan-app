
'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { subscribeToData } from '@/app/data';
import type { DetailedPayment, Expense, Group } from '@/app/data';
import { useFirestore } from '@/firebase';

export function FinancialSummary() {
  const db = useFirestore();
  const [payments, setPayments] = useState<DetailedPayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (!db) return;
    const unsubPayments = subscribeToData(db, 'payments', (data) => setPayments(data as DetailedPayment[]));
    const unsubExpenses = subscribeToData(db, 'expenses', (data) => setExpenses(data as Expense[]));
    const unsubGroups = subscribeToData(db, 'groups', (data) => setGroups(data as Group[]));

    return () => {
        unsubPayments();
        unsubExpenses();
        unsubGroups();
    };
  }, [db]);


  const { remainingCash } =
    useMemo(() => {
      const mainArisanGroup = groups.find(g => g.name === 'Arisan Utama');
      if (!mainArisanGroup) return { remainingCash: 0 };

      // Calculate total income ONLY from the 'cash' contribution of the main group
      const totalCashIncome = payments
        .filter(p => p.groupId === mainArisanGroup.id && p.contributions.cash?.paid)
        .reduce((sum, p) => sum + (p.contributions.cash?.amount || 0), 0);

      // Calculate total expenses related to cash (e.g., 'Talangan Kas')
      const totalCashExpenses = expenses
        .filter(e => e.category === 'Talangan Kas')
        .reduce((sum, e) => sum + e.amount, 0);

      const remainingCash = totalCashIncome - totalCashExpenses;

      return { remainingCash };
    }, [payments, expenses, groups]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:border-primary/50 transition-colors lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Saldo Kas Saat Ini
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
          <p className="text-xs text-muted-foreground">Saldo kas dari Iuran Kas dikurangi pengeluaran Talangan Kas</p>
        </CardContent>
      </Card>
    </div>
  );
}
