'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const ads = [
  {
    id: 1,
    imageUrl: 'https://picsum.photos/seed/ad1/800/400',
    title: 'Promosi Spesial Minggu Ini!',
    description: 'Dapatkan diskon 50% untuk semua produk fashion. Jangan sampai ketinggalan!',
    hint: 'fashion sale',
  },
  {
    id: 2,
    imageUrl: 'https://picsum.photos/seed/ad2/800/400',
    title: 'Kuliner Lezat, Harga Bersahabat',
    description: 'Cicipi menu baru kami. Pesan antar gratis untuk wilayah Anda.',
    hint: 'food delivery',
  },
  {
    id: 3,
    imageUrl: 'https://picsum.photos/seed/ad3/800/400',
    title: 'Liburan Impian? Bisa!',
    description: 'Paket wisata hemat ke berbagai destinasi populer. Pesan sekarang!',
    hint: 'travel package',
  },
];

export function AdvertisementSection() {
  return (
    <Card>
      <CardContent className="p-0">
        <Carousel className="w-full" opts={{ loop: true }}>
          <CarouselContent>
            {ads.map((ad) => (
              <CarouselItem key={ad.id}>
                <div className="relative h-64 w-full">
                  <Image
                    src={ad.imageUrl}
                    alt={ad.title}
                    fill
                    className="object-cover rounded-lg"
                    data-ai-hint={ad.hint}
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex flex-col justify-end p-6">
                    <h3 className="text-xl font-bold text-white">
                      {ad.title}
                    </h3>
                    <p className="text-white/90">{ad.description}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
