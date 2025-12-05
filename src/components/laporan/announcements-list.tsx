
'use client';

import { useState, useEffect } from 'react';
import type { Announcement } from '@/app/data';
import { subscribeToData } from '@/app/data';
import { useFirestore } from '@/firebase';
import { cn } from '@/lib/utils';

export function AnnouncementsList() {
  const db = useFirestore();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

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

  useEffect(() => {
    if (announcements.length > 1) {
      const intervalId = setInterval(() => {
        setIsFading(true);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
          setIsFading(false);
        }, 500); // Duration of the fade-out effect
      }, 5000); // Change announcement every 5 seconds

      return () => clearInterval(intervalId);
    }
  }, [announcements.length]);


  if (isLoading) {
    return <p className="text-center text-sm text-muted-foreground py-4">Memuat pengumuman...</p>;
  }

  if (announcements.length === 0) {
    return <p className="text-center text-sm text-muted-foreground py-4">Belum ada pengumuman.</p>;
  }
  
  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className={cn(
        "relative w-full overflow-hidden rounded-md border bg-accent/50 p-4 transition-opacity duration-500",
        isFading ? "opacity-0" : "opacity-100"
      )}>
      {currentAnnouncement && (
        <div className="text-accent-foreground">
          <h3 className="font-bold text-md mb-1">{currentAnnouncement.title}</h3>
          <p className="text-sm whitespace-pre-wrap">{currentAnnouncement.content}</p>
        </div>
      )}
    </div>
  );
}
