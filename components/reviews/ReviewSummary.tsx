"use client";

import ReviewStars from "./ReviewStars";

interface ReviewSummaryProps {
  stats: {
    total: number;
    average: number;
    ratingBreakdown: {
      "5": number;
      "4": number;
      "3": number;
      "2": number;
      "1": number;
    };
  };
}

// Component progress bar đơn giản
const ProgressBar = ({ value, className = "" }: { value: number; className?: string }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-orange-400 h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

// Component hiển thị tóm tắt đánh giá
const ReviewSummary = ({ stats }: ReviewSummaryProps) => {
  const { total, average, ratingBreakdown } = stats;

  // Tính phần trăm cho mỗi level đánh giá
  const getPercentage = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  if (total === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2">
          <ReviewStars rating={0} size="lg" />
        </div>
        <p className="text-gray-600">Chưa có đánh giá nào</p>
        <p className="text-sm text-gray-500">
          Hãy là người đầu tiên đánh giá sản phẩm này!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Tổng quan đánh giá */}
        <div className="text-center mt-5">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {average.toFixed(1)}
          </div>
          <ReviewStars rating={average} size="lg" className="justify-center mb-2" />
          <p className="text-sm text-gray-600">
            Dựa trên {total} đánh giá
          </p>
        </div>

        {/* Chi tiết phân bổ đánh giá */}
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingBreakdown[rating.toString() as keyof typeof ratingBreakdown];
            const percentage = getPercentage(count);
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 min-w-[60px]">
                  <span className="text-sm font-medium">{rating}</span>
                  <ReviewStars rating={1} maxRating={1} size="sm" />
                </div>
                
                <div className="flex-1">
                  <ProgressBar value={percentage} />
                </div>
                
                <div className="text-sm text-gray-600 min-w-[60px] text-right">
                  {count} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewSummary; 