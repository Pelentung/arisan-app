'use client';

import { useEffect } from 'react';

export function AdvertisementSection() {
    useEffect(() => {
        try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (err) {
            console.error('AdSense error:', err);
        }
    }, []);

    return (
        <div className="flex w-full justify-center">
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-8805948047019009"
                data-ad-slot="4529927399"
                data-ad-format="auto"
                data-full-width-responsive="true"
            ></ins>
        </div>
    );
}
