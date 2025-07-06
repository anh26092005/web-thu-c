"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

// Component hiển thị sao đánh giá
const ReviewStars = ({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: ReviewStarsProps) => {
  
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5",
  };

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={cn("flex gap-0.5", className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starNumber = index + 1;
        const isFullStar = starNumber <= Math.floor(rating);
        const isHalfStar = starNumber === Math.ceil(rating) && rating % 1 !== 0;
        
        return (
          <div
            key={index}
            className={cn(
              "relative",
              interactive && "cursor-pointer hover:scale-110 transition-transform"
            )}
            onClick={() => handleStarClick(starNumber)}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "stroke-orange-400",
                isFullStar 
                  ? "fill-orange-400 text-orange-400" 
                  : "fill-gray-200 text-gray-200"
              )}
            />
            {/* Sao nửa ngôi sao */}
            {isHalfStar && (
              <div 
                className="absolute top-0 left-0 overflow-hidden"
                style={{ width: "50%" }}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    "fill-orange-400 text-orange-400 stroke-orange-400"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReviewStars; 