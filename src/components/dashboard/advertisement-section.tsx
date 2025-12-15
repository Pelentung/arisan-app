'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function AdvertisementSection() {
    const adContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const adContainer = adContainerRef.current;
        if (adContainer && !adContainer.hasChildNodes()) {
            const optionsScript = document.createElement('script');
            optionsScript.type = 'text/javascript';
            optionsScript.innerHTML = `
                atOptions = {
                    'key' : '4a8bcfd01f80e85866ef6313080077d4',
                    'format' : 'iframe',
                    'height' : 60,
                    'width' : 468,
                    'params' : {}
                };
            `;
            adContainer.appendChild(optionsScript);

            const invokeScript = document.createElement('script');
            invokeScript.type = 'text/javascript';
            invokeScript.src = 'https://www.highperformanceformat.com/4a8bcfd01f80e85866ef6313080077d4/invoke.js';
            adContainer.appendChild(invokeScript);
        }
    }, []);
    
  return (
    <Card>
      <CardContent ref={adContainerRef} className="p-2 flex justify-center items-center min-h-[60px]">
        {/* Adsterra ad will be injected here */}
      </CardContent>
    </Card>
  );
}
