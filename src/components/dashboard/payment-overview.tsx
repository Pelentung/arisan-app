'use client';

import { useState } from 'react';
import { arisanData, type Member } from '@/app/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Bot, MoreHorizontal } from 'lucide-react';
import { ReminderOptimizer } from '../optimize/reminder-optimizer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

const memberDetails = arisanData.payments.map((payment) => {
  const member = arisanData.members.find((m) => m.id === payment.memberId);
  return { ...payment, member };
});

export function PaymentOverview() {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleOptimizeClick = (member: Member) => {
    setSelectedMember(member);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Overview</CardTitle>
        <CardDescription>
          Track payments for the current cycle of "Arisan Utama 2024".
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Sheet open={!!selectedMember} onOpenChange={(isOpen) => !isOpen && setSelectedMember(null)}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberDetails.map((detail) => (
                <TableRow key={detail.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={detail.member?.avatarUrl} data-ai-hint={detail.member?.avatarHint} />
                        <AvatarFallback>
                          {detail.member?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{detail.member?.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        detail.status === 'Paid'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className={detail.status === 'Paid' ? 'bg-green-500/20 text-green-400 border-green-500/20' : ''}
                    >
                      {detail.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(detail.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {detail.status !== 'Paid' && (
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleOptimizeClick(detail.member!)}>
                                <Bot className="h-4 w-4 text-primary" />
                                <span className="sr-only">Optimize Reminder</span>
                            </Button>
                        </SheetTrigger>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More actions</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>Log Payment</DropdownMenuItem>
                            <DropdownMenuItem>View History</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {selectedMember && (
            <SheetContent className="sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Optimize Payment Reminder</SheetTitle>
                <SheetDescription>
                  Generate an optimal reminder schedule for {selectedMember.name} using AI.
                </SheetDescription>
              </SheetHeader>
              <ReminderOptimizer member={selectedMember} />
            </SheetContent>
          )}
        </Sheet>
      </CardContent>
    </Card>
  );
}
