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
        // This function will clear the container and inject the current ad script
        const loadAd = () => {
            const adContainer = adContainerRef.current;
            if (!adContainer) return;

            // 1. Clear previous ad content
            adContainer.innerHTML = '';

            // 2. Get the config for the current ad
            const adConfig = adConfigs[currentAdIndex];

            // 3. Create and inject the new ad scripts
            const optionsScript = document.createElement('script');
            optionsScript.type = 'text/javascript';
            optionsScript.innerHTML = `atOptions = ${JSON.stringify(adConfig)};`;
            
            const invokeScript = document.createElement('script');
            invokeScript.type = 'text/javascript';
            invokeScript.src = `//www.highperformanceformat.com/${adConfig.key}/invoke.js`;

            adContainer.appendChild(optionsScript);
            adContainer.appendChild(invokeScript);
        };

        loadAd(); // Load the ad when the index changes

        // Set up the interval to rotate the ad index
        const interval = setInterval(() => {
            setCurrentAdIndex(prevIndex => (prevIndex + 1) % adConfigs.length);
        }, 5000); // Rotate every 5 seconds

        return () => clearInterval(interval); // Cleanup on component unmount

    }, [currentAdIndex]); // Re-run this effect whenever the ad index changes

    return (
        <div className="p-2 flex justify-center items-center gap-4 min-h-[100px]">
            {/* Single container for all ads */}
            <div ref={adContainerRef} className="flex justify-center items-center">
              {/* Ad will be injected here by the useEffect hook */}
            </div>
        </div>
    );
}
