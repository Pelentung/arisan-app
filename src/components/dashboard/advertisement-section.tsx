
'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function AdvertisementSection() {
    const adContainerRef1 = useRef<HTMLDivElement>(null);
    const adContainerRef2 = useRef<HTMLDivElement>(null);
    const [visibleAd, setVisibleAd] = useState<'ad1' | 'ad2'>('ad1');

    // Effect to rotate the ads every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleAd(currentAd => (currentAd === 'ad1' ? 'ad2' : 'ad1'));
        }, 30000); // 30 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);


    // Ad 1 script injection
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
            invokeScript.src = '//www.highperformanceformat.com/4a8bcfd01f80e85866ef6313080077d4/invoke.js';
            adContainer.appendChild(invokeScript);
        }
    }, []);

    // Ad 2 script injection
    useEffect(() => {
        const adContainer = adContainerRef2.current;
        if (adContainer && adContainer.children.length === 0) {
            const optionsScript = document.createElement('script');
            optionsScript.type = 'text/javascript';
            optionsScript.innerHTML = `
                atOptions = {
                    'key' : 'f52dac102624c4a42d0767b387e4d719',
                    'format' : 'iframe',
                    'height' : 50,
                    'width' : 320,
                    'params' : {}
                };
            `;
            adContainer.appendChild(optionsScript);

            const invokeScript = document.createElement('script');
            invokeScript.type = 'text/javascript';
            invokeScript.src = '//www.highperformanceformat.com/f52dac102624c4a42d0767b387e4d719/invoke.js';
            adContainer.appendChild(invokeScript);
        }
    }, []);

    
  return (
    <Card>
      <CardContent className="p-2 flex justify-center items-center gap-4 min-h-[60px]">
        {/* Container for Ad 1 */}
        <div ref={adContainerRef1} className={cn("flex justify-center items-center", { 'hidden': visibleAd !== 'ad1' })}>
          {/* Ad 1 will be injected here */}
        </div>
        
        {/* Container for Ad 2 */}
        <div ref={adContainerRef2} className={cn("flex justify-center items-center", { 'hidden': visibleAd !== 'ad2' })}>
          {/* Ad 2 will be injected here */}
        </div>
      </CardContent>
    </Card>
  );
}
