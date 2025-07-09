"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { Banner } from "@/sanity.types";
import { AnimatePresence, motion } from "motion/react";

interface PromotionPopupProps {
  banner: Banner | null;
}

const PromotionPopup = ({ banner }: PromotionPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Kiểm tra có nên hiển thị popup không dựa trên tần suất
  const shouldShowPopup = (frequency: string = 'daily') => {
    const now = new Date().getTime();
    const storageKey = `popup_${banner?._id}_${frequency}`;
    const lastShown = localStorage.getItem(storageKey);

    if (!lastShown) {
      return true;
    }

    const lastShownTime = parseInt(lastShown);
    const timeDiff = now - lastShownTime;

    switch (frequency) {
      case 'always':
        return true;
      case 'once':
        return false;
      case 'daily':
        return timeDiff > 24 * 60 * 60 * 1000; // 24 giờ
      case 'weekly':
        return timeDiff > 7 * 24 * 60 * 60 * 1000; // 7 ngày
      default:
        return true;
    }
  };

  // Lưu thời gian hiển thị popup
  const markPopupShown = (frequency: string = 'daily') => {
    const now = new Date().getTime();
    const storageKey = `popup_${banner?._id}_${frequency}`;
    localStorage.setItem(storageKey, now.toString());
  };

  // Đóng popup
  const closePopup = () => {
    setIsVisible(false);
    if (banner?.popupFrequency) {
      markPopupShown(banner.popupFrequency);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !banner || !banner.image?.asset?._ref) {
      return;
    }

    const frequency = banner.popupFrequency || 'daily';
    
    if (shouldShowPopup(frequency)) {
      // Delay hiển thị popup 1 giây sau khi load trang
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [mounted, banner]);

  // Không render gì nếu chưa mount (để tránh hydration error)
  if (!mounted || !banner || !banner.image?.asset?._ref) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background overlay với blur effect */}
          <motion.div
            className="absolute inset-0 bg-black/60 opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
          />

          {/* Popup content */}
          <motion.div
            className="relative max-w-[300px] w-1/2 mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
              duration: 0.5
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <motion.button
              onClick={closePopup}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} className="text-gray-600" />
            </motion.button>

            {/* Banner image */}
            <div className="w-full">
              <Image
                src={urlFor(banner.image).url()}
                alt={banner.image.alt || banner.title || 'Popup khuyến mãi'}
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* Content nếu có description */}
            {banner.description && banner.description.length > 0 && (
              <div className="p-6">
                <div className="prose prose-sm max-w-none text-center">
                  {banner.description.map((block: any, index: number) => {
                    if (block._type === 'block') {
                      return (
                        <div key={index} className="mb-2">
                          {block.children?.map((child: any, childIndex: number) => (
                            <span
                              key={childIndex}
                              className={`
                                ${child.marks?.includes('strong') ? 'font-bold' : ''}
                                ${child.marks?.includes('em') ? 'italic' : ''}
                                ${block.style === 'h1' ? 'text-2xl font-bold' : ''}
                                ${block.style === 'h2' ? 'text-xl font-semibold' : ''}
                                ${block.style === 'h3' ? 'text-lg font-medium' : ''}
                              `}
                            >
                              {child.text}
                            </span>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionPopup; 