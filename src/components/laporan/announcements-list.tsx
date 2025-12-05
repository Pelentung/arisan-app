
'use client';

import { useState, useEffect } from 'react';
import type { Announcement } from '@/app/data';
import { subscribeToData } from '@/app/data';
import { useFirestore } from '@/firebase';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function AnnouncementsList() {
  const db = useFirestore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = subscribeToData(db, 'announcements', (data) => {
        // Sort by most recent
        const sortedData = (data as Announcement[]).sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      setAnnouncements(sortedData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  if (isLoading) {
    return <p>Memuat pengumuman...</p>;
  }

  if (announcements.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-4">Belum ada pengumuman.</p>;
  }

  return (
    <Accordion type="single" collapsible defaultValue={announcements[0]?.id}>
      {announcements.map((announcement) => (
        <AccordionItem value={announcement.id} key={announcement.id} className="border-border/40">
          <AccordionTrigger>
            <div className="flex flex-col items-start text-left w-full overflow-hidden">
                <div className="font-semibold w-full truncate">
                    {announcement.title}
                </div>
                <span className="text-xs text-muted-foreground">
                    Diperbarui: {format(new Date(announcement.updatedAt), 'd MMMM yyyy', { locale: id })}
                </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="whitespace-pre-wrap text-foreground/90">
             {announcement.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
