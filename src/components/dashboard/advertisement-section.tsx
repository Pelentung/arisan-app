
'use client';

import { useEffect, useState, useRef } from 'react';

// Daftar konfigurasi iklan yang akan ditampilkan bergantian
const adConfigs = [
  {
    key: 'f52dac102624c4a42d0767b387e4d719',
    format: 'iframe',
    height: 50,
    width: 320,
    invokeUrl: 'https://www.highperformanceformat.com/f52dac102624c4a42d0767b387e4d719/invoke.js',
  },
  {
    key: '4a8bcfd01f80e85866ef6313080077d4',
    format: 'iframe',
    height: 60,
    width: 468,
    invokeUrl: 'https://www.highperformanceformat.com/4a8bcfd01f80e85866ef6313080077d4/invoke.js',
  },
];

export function AdvertisementSection() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const adContainerRef = useRef<HTMLDivElement>(null);

  // Efek untuk mengganti iklan setiap 10 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex(prevIndex => (prevIndex + 1) % adConfigs.length);
    }, 10000); // Ganti setiap 10 detik

    // Bersihkan interval saat komponen di-unmount
    return () => clearInterval(timer);
  }, []);

  // Efek untuk memuat skrip iklan saat indeks berubah
  useEffect(() => {
    const adContainer = adContainerRef.current;
    if (!adContainer) return;

    // Bersihkan kontainer dari skrip iklan sebelumnya
    adContainer.innerHTML = '';

    // Ambil konfigurasi iklan saat ini
    const ad = adConfigs[currentAdIndex];

    // Buat skrip konfigurasi
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `
      atOptions = {
        'key' : '${ad.key}',
        'format' : '${ad.format}',
        'height' : ${ad.height},
        'width' : ${ad.width},
        'params' : {}
      };
    `;
    adContainer.appendChild(configScript);

    // Buat dan tambahkan skrip utama iklan
    const invokeScript = document.createElement('script');
    invokeScript.type = 'text/javascript';
    invokeScript.src = ad.invokeUrl;
    invokeScript.async = true;
    adContainer.appendChild(invokeScript);

    // Fungsi cleanup untuk menghapus skrip saat komponen di-unmount atau sebelum efek berikutnya berjalan
    return () => {
      if (adContainer) {
        adContainer.innerHTML = '';
      }
    };
  }, [currentAdIndex]); // Jalankan kembali efek ini setiap kali iklan berubah

  return (
    <div
      ref={adContainerRef}
      className="flex w-full justify-center my-4"
      // Mengatur tinggi minimum untuk mengakomodasi iklan terbesar
      style={{ minHeight: `${Math.max(...adConfigs.map(ad => ad.height))}px` }} 
    />
  );
}
