
'use client';

import { useState, useEffect } from 'react';
import type { Announcement } from '@/app/data';
import { subscribeToData } from '@/app/data';
import { useFirestore } from '@/firebase';

export function AnnouncementsList() {
  const db = useFirestore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = subscribeToData(db, 'announcements', (data) => {
        const sortedData = (data as Announcement[]).sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      setAnnouncements(sortedData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  if (isLoading) {
    return <p className="text-center text-sm text-muted-foreground py-4">Memuat pengumuman...</p>;
  }

  if (announcements.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-4">Belum ada pengumuman.</p>;
  }

  // Combine all announcements into a single string for the marquee effect
  const marqueeText = announcements
    .map(announcement => `${announcement.title}: ${announcement.content}`)
    .join(' *** ');

  return (
    <div className="relative flex w-full overflow-x-hidden rounded-md border bg-accent/50 p-2">
      <div className="animate-marquee whitespace-nowrap text-accent-foreground">
        <span className="mx-4">{marqueeText}</span>
        <span className="mx-4">{marqueeText}</span> 
      </div>
    </div>
  );
}
