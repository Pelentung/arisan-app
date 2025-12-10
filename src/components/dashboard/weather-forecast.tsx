'use client';

import { CloudSun, Thermometer, Loader2, MapPinOff } from 'lucide-react';
import { useState, useEffect } from 'react';

// Data cuaca tiruan. Di aplikasi nyata, ini akan berasal dari API.
const getMockWeatherForCoords = (lat: number, lon: number) => {
    // Di aplikasi nyata, Anda akan memanggil API cuaca di sini dengan lat/lon
    console.log(`Fetching weather for: ${lat}, ${lon}`);
    return {
        location: 'Lokasi Anda',
        temperature: 30, // Suhu tiruan
        condition: 'Cerah', // Kondisi tiruan
    };
};


export function WeatherForecast() {
  const [weather, setWeather] = useState<{location: string, temperature: number, condition: string} | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Efek ini memastikan komponen hanya dirender di sisi klien
    setIsVisible(true);

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        setStatus('loading');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Simulasikan pengambilan data dari API
                setTimeout(() => {
                    const mockData = getMockWeatherForCoords(latitude, longitude);
                    setWeather(mockData);
                    setStatus('success');
                }, 1000); // Penundaan untuk simulasi panggilan jaringan
            },
            (error) => {
                let message = "Terjadi kesalahan saat mengakses lokasi.";
                if (error.code === error.PERMISSION_DENIED) {
                    message = "Akses lokasi ditolak.";
                }
                setErrorMessage(message);
                setStatus('error');
            }
        );
    } else {
        setErrorMessage("Geolocation tidak didukung di peramban ini.");
        setStatus('error');
    }
  }, []);

  if (!isVisible) {
    return null; // Tidak merender apa pun di server atau saat render awal klien
  }

  if (status === 'loading') {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Mencari lokasi...</span>
        </div>
    );
  }

  if (status === 'error') {
     return (
        <div className="flex items-center gap-2 text-sm text-yellow-500">
            <MapPinOff className="h-5 w-5" />
            <span>{errorMessage}</span>
        </div>
    );
  }

  if (status === 'success' && weather) {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CloudSun className="h-5 w-5 text-yellow-400" />
            <span>{weather.condition}</span>
            <Thermometer className="h-5 w-5 text-red-500" />
            <span>{weather.temperature}°C di {weather.location}</span>
        </div>
    );
  }

  return null;
}
