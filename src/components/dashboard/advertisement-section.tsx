'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function AdvertisementSection() {
    const adContainerRef = useRef<HTMLDivElement>(null);
    const adsterraId = process.env.NEXT_PUBLIC_ADSTERRA_AD_ID;

    useEffect(() => {
        if (adContainerRef.current && !adContainerRef.current.querySelector('script')) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.innerHTML = `
                atOptions = {
                    'key' : '${adsterraId}',
                    'format' : 'native',
                    'height' : 250,
                    'width' : 300,
                    'params' : {}
                };
            `;
            adContainerRef.current.appendChild(script);

            const adScript = document.createElement('script');
            adScript.type = 'text/javascript';
            adScript.src = '//www.profitabledisplaynetwork.com/e5/a8/19/e5a8192329391d575727937402f153b9.js';
            adContainerRef.current.appendChild(adScript);
        }
    }, [adsterraId]);
    
    if (!adsterraId) {
        return (
            <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                    ID Iklan Adsterra belum dikonfigurasi.
                </CardContent>
            </Card>
        );
    }
    
  return (
    <Card>
      <CardContent ref={adContainerRef} className="p-2 flex justify-center items-center">
        {/* Adsterra ad will be injected here */}
      </CardContent>
    </Card>
  );
}
