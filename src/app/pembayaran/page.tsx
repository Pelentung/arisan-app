'use client';

import { useState } from 'react';
import { arisanData, type Payment, type Member } from '@/app/data';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type PaymentDetail = Payment & { member?: Member };

export default function PaymentPage() {
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentDetail[]>(arisanData.payments);
  const [selectedGroup, setSelectedGroup] = useState('g1');

  const handlePaymentChange = (paymentId: string, isPaid: boolean) => {
    setPayments(prevPayments =>
      prevPayments.map(p => {
        if (p.id === paymentId) {
          const newStatus = isPaid ? 'Paid' : 'Unpaid';
          
          const dueDate = new Date(p.dueDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let finalStatus: Payment['status'] = newStatus;
          if (newStatus === 'Unpaid' && dueDate < today) {
            finalStatus = 'Late';
          }

          if (p.status !== finalStatus) {
            const memberName = arisanData.members.find(m => m.id === p.memberId)?.name || 'Anggota';
            toast({
              title: 'Status Pembayaran Diperbarui',
              description: `Pembayaran untuk ${memberName} ditandai sebagai ${
                isPaid ? 'Lunas' : 'Belum Lunas'
              }.`,
            });
          }
          return { ...p, status: finalStatus };
        }
        return p;
      })
    );
  };

  const filteredPayments = payments
    .filter(p => p.groupId === selectedGroup)
    .map(p => {
      const member = arisanData.members.find(m => m.id === p.memberId);
      const dueDate = new Date(p.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentStatus: Payment['status'] = p.status;
      if (p.status === 'Unpaid' && dueDate < today) {
        currentStatus = 'Late';
      }

      return {
        ...p,
        status: currentStatus,
        member,
      };
    });

  const selectedGroupName = arisanData.groups.find(g => g.id === selectedGroup)?.name;

  const saveAllChanges = () => {
    // In a real app, this would send the updated 'payments' state to your backend API.
    console.log("Saving changes:", payments);
    toast({
        title: "Perubahan Disimpan",
        description: "Semua status pembayaran telah disimpan."
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Kelola Pembayaran" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Transaksi Pembayaran</CardTitle>
              <CardDescription>
                Kelola status pembayaran untuk grup arisan yang dipilih.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-full sm:w-[280px]">
                    <SelectValue placeholder="Pilih Grup" />
                </SelectTrigger>
                <SelectContent>
                    {arisanData.groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                        {group.name}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <Button onClick={saveAllChanges} className="w-full sm:w-auto">Simpan Perubahan</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Lunas</TableHead>
                  <TableHead>Anggota</TableHead>
                  <TableHead>Bulan Berjalan</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map(payment => (
                    <TableRow key={payment.id} data-state={payment.status === 'Paid' ? 'selected' : ''}>
                      <TableCell>
                        <Checkbox
                          id={`paid-${payment.id}`}
                          checked={payment.status === 'Paid'}
                          onCheckedChange={checked =>
                            handlePaymentChange(payment.id, !!checked)
                          }
                          aria-label={`Tandai ${payment.member?.name} sebagai lunas`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={payment.member?.avatarUrl} data-ai-hint={payment.member?.avatarHint} />
                            <AvatarFallback>
                              {payment.member?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{payment.member?.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.dueDate).toLocaleDateString('id-ID', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(payment.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Tidak ada data pembayaran untuk grup ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
