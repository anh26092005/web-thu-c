"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ReviewStars from "./ReviewStars";
import { ThumbsUp, Shield, CheckCircle, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  isRecommended?: boolean;
  pros?: string[];
  cons?: string[];
  images?: any[];
  helpfulCount: number;
  reviewDate: string;
  adminResponse?: {
    content: string;
    responseDate: string;
    adminName: string;
  };
}

interface ReviewListProps {
  reviews: Review[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

// Component hiển thị một đánh giá
const ReviewItem = ({ review }: { review: Review }) => {
  const [showFullComment, setShowFullComment] = useState(false);
  
  const shouldTruncate = review.comment.length > 300;
  const displayComment = shouldTruncate && !showFullComment 
    ? review.comment.slice(0, 300) + "..."
    : review.comment;

  const reviewDate = new Date(review.reviewDate);
  const timeAgo = formatDistanceToNow(reviewDate, { 
    addSuffix: true, 
    locale: vi 
  });

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        {/* Header thông tin reviewer */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">
                {review.customerName.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {review.customerName}
                </span>
                {review.verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Đã mua hàng
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <ReviewStars rating={review.rating} size="sm" />
                <span className="text-xs text-gray-500">{timeAgo}</span>
              </div>
            </div>
          </div>

          {review.isRecommended && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Khuyên dùng
            </Badge>
          )}
        </div>

        {/* Tiêu đề đánh giá */}
        <h4 className="font-semibold text-gray-900 mb-2">
          {review.title}
        </h4>

        {/* Nội dung đánh giá */}
        <p className="text-gray-700 mb-4 leading-relaxed">
          {displayComment}
          {shouldTruncate && (
            <button
              onClick={() => setShowFullComment(!showFullComment)}
              className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
            >
              {showFullComment ? "Thu gọn" : "Xem thêm"}
            </button>
          )}
        </p>

        {/* Điểm mạnh */}
        {review.pros && review.pros.length > 0 && (
          <div className="mb-3">
            <span className="text-sm font-medium text-green-700 mb-2 block">
              Điểm mạnh:
            </span>
            <div className="flex flex-wrap gap-1">
              {review.pros.map((pro, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-green-50 text-green-700 text-xs"
                >
                  + {pro}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Điểm yếu */}
        {review.cons && review.cons.length > 0 && (
          <div className="mb-3">
            <span className="text-sm font-medium text-red-700 mb-2 block">
              Điểm yếu:
            </span>
            <div className="flex flex-wrap gap-1">
              {review.cons.map((con, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-red-50 text-red-700 text-xs"
                >
                  - {con}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Hình ảnh đánh giá */}
        {review.images && review.images.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto">
              {review.images.map((image, index) => (
                <div key={index} className="flex-shrink-0">
                  <img
                    src={image.asset?.url || image.url}
                    alt={`Ảnh đánh giá ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Phản hồi từ admin */}
        {review.adminResponse && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Phản hồi từ {review.adminResponse.adminName}
              </span>
              <span className="text-xs text-blue-600">
                {formatDistanceToNow(new Date(review.adminResponse.responseDate), {
                  addSuffix: true,
                  locale: vi
                })}
              </span>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed">
              {review.adminResponse.content}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
            <ThumbsUp className="w-4 h-4 mr-1" />
            Hữu ích ({review.helpfulCount})
          </Button>
          
          <span className="text-xs text-gray-500">
            ID: {review._id.slice(-6)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// Component danh sách đánh giá
const ReviewList = ({ 
  reviews, 
  loading = false, 
  hasMore = false, 
  onLoadMore 
}: ReviewListProps) => {
  
  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border border-gray-200">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <MessageCircle className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Chưa có đánh giá nào
        </h3>
        <p className="text-gray-600">
          Hãy là người đầu tiên chia sẻ trải nghiệm về sản phẩm này!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewItem key={review._id} review={review} />
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
            className="px-8"
          >
            {loading ? "Đang tải..." : "Xem thêm đánh giá"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewList; 