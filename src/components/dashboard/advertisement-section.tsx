'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

declare global {
  interface Window {
    adsbygoogle: any;
  }
}

export function AdvertisementSection() {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error(err);
        }
    }, []);

    const adClientId = process.env.NEXT_PUBLIC_ADMOB_APP_ID;
    const adSlotId = process.env.NEXT_PUBLIC_ADMOB_AD_UNIT_ID;

    if (!adClientId || !adSlotId) {
        return (
            <Card>
                <CardContent className="p-4 text-center text-muted-foreground">
                    ID Iklan belum dikonfigurasi.
                </CardContent>
            </Card>
        );
    }
    
  return (
    <Card>
      <CardContent className="p-2">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adClientId}
          data-ad-slot={adSlotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </CardContent>
    </Card>
  );
}
