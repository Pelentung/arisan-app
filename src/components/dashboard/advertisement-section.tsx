'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function AdvertisementSection() {
    const adContainerRef1 = useRef<HTMLDivElement>(null);

    // Ad 1
    useEffect(() => {
        const adContainer = adContainerRef1.current;
        // Check if the container is empty to prevent re-adding scripts on re-renders
        if (adContainer && adContainer.children.length === 0) {
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
      <CardContent className="p-2 flex justify-center items-center min-h-[60px]">
        <div ref={adContainerRef1} className="flex justify-center items-center">
          {/* Adsterra ad 1 will be injected here */}
        </div>
      </CardContent>
    </Card>
  );
}
