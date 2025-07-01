"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
// import { Title } from "./ui/text";
// import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { getBanners } from "@/sanity/queries";
import { Banner } from "@/sanity.types";

const HomeBanner = async () => {
  const bannerData: Banner[] = await getBanners();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true }));

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleDotClick = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <>
    <div className="relative py-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-shop_orange via-shop_dark_green to-shop_light_green opacity-10"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-shop_orange/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
      <div className="absolute top-4 right-10 w-16 h-16 bg-shop_light_green/20 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
      <div className="absolute bottom-4 left-20 w-12 h-12 bg-shop_dark_green/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
      
      {/* Main title with effects */}
      <div className="relative z-10 text-center">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold py-4 animate-pulse">
          <span className="bg-gradient-to-r from-shop_orange via-shop_dark_green to-shop_light_green bg-clip-text text-transparent animate-gradient-x">
            🎉 Các chương trình khuyến mãi đang diễn ra tại Khủng Long Châu 🎉
          </span>
        </h2>
        
        {/* Subtitle with typing effect */}
        <p className="text-lg md:text-xl text-gray-600 mt-2 animate-fade-in-up">
          <span className="inline-block animate-bounce" style={{ animationDelay: '0.5s' }}>🔥</span>
          <span className="mx-2 font-semibold text-shop_dark_green">Giảm giá sốc</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '1s' }}>💎</span>
          <span className="mx-2 font-semibold text-shop_orange">Ưu đãi độc quyền</span>
          <span className="inline-block animate-bounce" style={{ animationDelay: '1.5s' }}>⚡</span>
        </p>
        
        {/* Decorative line */}
        {/* <div className="flex justify-center items-center mt-4">
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-shop_orange to-transparent animate-pulse"></div>
          <div className="w-4 h-4 bg-shop_dark_green rounded-full mx-4 animate-ping"></div>
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-shop_light_green to-transparent animate-pulse"></div>
        </div> */}
      </div>
    </div>
    
    <div className="relative md:py-0 bg-shop_light_pink rounded-lg lg:px-0" onMouseEnter={plugin.current.stop} onMouseLeave={plugin.current.reset}>
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {bannerData.map((item, index) => (
            <CarouselItem key={index}>
              <div className="flex items-center justify-between rounded-lg">
                {/* <div className="space-y-5 flex-1">
                  <Title>
                    {item.title}
                  </Title>
                  <p className="text-gray-600 max-w-md">
                    {item.description}
                  </p>
                  <Link
                    href={item.buttonLink}
                    className="bg-shop_dark_green/90 text-white/90 px-5 py-2 rounded-md text-sm font-semibold hover:text-white hover:bg-shop_dark_green hoverEffect inline-block"
                  >
                    {item.buttonText}
                  </Link>
                </div> */}
                <div className="block flex-1">
                  <Image
                    src={urlFor(item.image).url()}
                    alt={item.image.alt || item.title}
                    width={400}
                    height={300}
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-7 text-shop_light_green size-6" />
        <CarouselNext className="right-7 text-shop_light_green size-6" />
      </Carousel>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-x-2">
        {bannerData.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-1 h-1 rounded-full ${
              index + 1 === current ? "bg-shop_dark_green" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
    </>
  );
};

export default HomeBanner;
