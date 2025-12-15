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
        <div className="flex w-full justify-center text-center">
            <ins
                className="adsbygoogle"
                style={{ display: 'block', textAlign: 'center' }}
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client="ca-pub-8805948047019009"
                data-ad-slot="3421678091"
            ></ins>
        </div>
    );
}
