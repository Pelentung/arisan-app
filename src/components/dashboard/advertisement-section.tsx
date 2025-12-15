'use client';

import { useEffect, useRef, useState } from 'react';

// Define the ad configurations in an array for easier management
const adConfigs = [
    {
        key: '4a8bcfd01f80e85866ef6313080077d4',
        format: 'iframe',
        height: 60,
        width: 468,
        params: {}
    },
    {
        key: 'f52dac102624c4a42d0767b387e4d719',
        format: 'iframe',
        height: 50,
        width: 320,
        params: {}
    }
];

export function AdvertisementSection() {
    const adContainerRef = useRef<HTMLDivElement>(null);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);

    useEffect(() => {
        const loadAd = () => {
            const adContainer = adContainerRef.current;
            if (!adContainer) return;

            adContainer.innerHTML = '';

            const adConfig = adConfigs[currentAdIndex];

            const optionsScript = document.createElement('script');
            optionsScript.type = 'text/javascript';
            optionsScript.innerHTML = `atOptions = ${JSON.stringify(adConfig)};`;
            
            const invokeScript = document.createElement('script');
            invokeScript.type = 'text/javascript';
            invokeScript.src = `//www.highperformanceformat.com/${adConfig.key}/invoke.js`;
            invokeScript.async = true;

            adContainer.appendChild(optionsScript);
            adContainer.appendChild(invokeScript);
        };

        loadAd();

        const interval = setInterval(() => {
            setCurrentAdIndex(prevIndex => (prevIndex + 1) % adConfigs.length);
        }, 8000); // Rotate every 8 seconds

        return () => clearInterval(interval);

    }, [currentAdIndex]);

    return (
        <div className="p-2 flex justify-center items-center gap-4 min-h-[100px]">
            <div ref={adContainerRef} className="flex justify-center items-center">
              {/* Ad will be injected here */}
            </div>
        </div>
    );
}
