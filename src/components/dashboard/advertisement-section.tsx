'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export function AdvertisementSection() {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Gunakan useRef untuk memastikan skrip hanya dimuat sekali
    if (adContainerRef.current && adContainerRef.current.children.length === 0) {
      const configScript = document.createElement('script');
      configScript.type = 'text/javascript';
      configScript.innerHTML = `
        atOptions = {
          'key' : 'f52dac102624c4a42d0767b387e4d719',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;
      adContainerRef.current.appendChild(configScript);

      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.src = 'https://www.highperformanceformat.com/f52dac102624c4a42d0767b387e4d719/invoke.js';
      invokeScript.async = true;
      adContainerRef.current.appendChild(invokeScript);
    }
  }, []);

  return (
    <div
      ref={adContainerRef}
      className="flex w-full justify-center my-4"
      // Style ini memastikan kontainer memiliki ukuran yang sesuai untuk iklan
      style={{ minHeight: '50px' }} 
    />
  );
}
