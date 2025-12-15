
'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle } from 'lucide-react';

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
    const [isAdLoaded, setIsAdLoaded] = useState(false);

    useEffect(() => {
        const loadAd = () => {
            const adContainer = adContainerRef.current;
            if (!adContainer) return;

            adContainer.innerHTML = '';
            setIsAdLoaded(false); 

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

            // Simple check to see if the ad script added any content.
            // This is not foolproof but works for many ad scripts.
            const observer = new MutationObserver(() => {
                if (adContainer.children.length > 2) { // More than the 2 scripts we added
                    setIsAdLoaded(true);
                    observer.disconnect();
                }
            });
            observer.observe(adContainer, { childList: true });

            // Fallback timer
            setTimeout(() => {
                 if (adContainer.children.length <= 2) {
                    setIsAdLoaded(false);
                 }
                 observer.disconnect();
            }, 2000);
        };

        loadAd();

        const interval = setInterval(() => {
            setCurrentAdIndex(prevIndex => (prevIndex + 1) % adConfigs.length);
        }, 8000); // Rotate every 8 seconds

        return () => clearInterval(interval);

    }, [currentAdIndex]);

    return (
        <div className="p-2 flex justify-center items-center gap-4 min-h-[100px] border-dashed border rounded-lg bg-muted/50">
            <div ref={adContainerRef} className="flex justify-center items-center">
              {/* Ad will be injected here */}
            </div>
             {!isAdLoaded && (
                <div className="text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>Area Iklan</span>
                    <span className="text-xs">(Jika tidak muncul, mungkin terblokir oleh Ad Blocker Anda)</span>
                </div>
            )}
        </div>
    );
}
