
'use client';

import { useState, useEffect } from 'react';
import type { Group, Member } from '@/app/data';
import { subscribeToData } from '@/app/data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function WinnerHistory() {
  const db = useFirestore();
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    
    let groupsLoaded = false;
    let membersLoaded = false;
    
    const checkAllLoaded = () => {
        if(groupsLoaded && membersLoaded) setIsLoading(false);
    }

    const unsubGroups = subscribeToData(db, 'groups', (data) => {
        setGroups(data as Group[]);
        groupsLoaded = true;
        checkAllLoaded();
    });
    const unsubMembers = subscribeToData(db, 'members', (data) => {
        setMembers(data as Member[]);
        membersLoaded = true;
        checkAllLoaded();
    });
    return () => {
        unsubGroups();
        unsubMembers();
    };
  }, [db]);

  if (isLoading) {
    return <p>Memuat riwayat pemenang...</p>
  }

  if (!groups.length || !members.length) {
    return (
        <Card>
            <CardContent>
                <p>Gagal memuat data riwayat.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue={groups.length > 0 ? groups[0].id : undefined}>
      {groups.map(group => {
        const winners = (group.winnerHistory || [])
          .map(history => {
            const member = members.find(
              m => m.id === history.memberId
            );
            return member ? { ...member, month: history.month } : null;
          })
          .filter(Boolean);

        return (
          <AccordionItem key={group.id} value={group.id}>
            <AccordionTrigger>{group.name}</AccordionTrigger>
            <AccordionContent>
              {winners.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-foreground">Nama</TableHead>
                      <TableHead className="text-right text-muted-foreground">Menarik pada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {winners.map(winner => (
                      <TableRow key={winner!.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={winner!.avatarUrl}
                                data-ai-hint={winner!.avatarHint}
                              />
                              <AvatarFallback>
                                {winner!.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">
                              {winner!.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-foreground">
                           {new Date(winner!.month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric'})}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada riwayat penarikan untuk grup ini.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
