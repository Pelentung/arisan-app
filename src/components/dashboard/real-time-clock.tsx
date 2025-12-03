'use client';

import { useState, useEffect } from 'react';

export function RealTimeClock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      const dateFormatter = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      setTime(timeFormatter.format(now).replace(/\./g, ':'));
      setDate(dateFormatter.format(now));
    };

    // Set initial time and date on the client
    updateDateTime();
    
    // Update every second
    const timerId = setInterval(updateDateTime, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timerId);
  }, []); // Empty dependency array ensures this runs only once on the client after mount

  if (!time) {
    // Return a placeholder or null during server-side rendering and initial client render
    return null; 
  }

  return (
    <div className="text-sm text-muted-foreground text-left sm:text-right">
      <span>{time}</span> - <span>{date}</span>
    </div>
  );
}
