"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReviewSummary from "./ReviewSummary";
import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewForm";
import ReviewStars from "./ReviewStars";
import { Badge } from "@/components/ui/badge";
import { Edit, Filter, Star } from "lucide-react";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

interface ReviewData {
  reviews: any[];
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
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Component tổng hợp đánh giá sản phẩm
const ProductReviews = ({ productId, productName }: ProductReviewsProps) => {
  
  // State management
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Filters
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Lấy dữ liệu đánh giá từ API
  const fetchReviews = async (offset = 0, reset = false) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        productId,
        limit: "10",
        offset: offset.toString(),
      });

      // Thêm filter
      if (ratingFilter !== "all") {
        params.append("rating", ratingFilter);
      }
      params.append("sort", sortBy);

      console.log("Fetching reviews with params:", params.toString());

      const response = await fetch(`/api/reviews?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("API response:", result);

      if (result.success) {
        setReviewData(prev => {
          if (reset || !prev) {
            return result.data;
          } else {
            // Append new reviews for pagination
            return {
              ...result.data,
              reviews: [...prev.reviews, ...result.data.reviews],
            };
          }
        });
      } else {
        throw new Error(result.error || "Không thể tải đánh giá");
      }
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
      // Tạo dữ liệu mặc định thay vì alert
      setReviewData({
        reviews: [],
        stats: {
          total: 0,
          average: 0,
          ratingBreakdown: {
            "5": 0,
            "4": 0, 
            "3": 0,
            "2": 0,
            "1": 0
          }
        },
        pagination: {
          limit: 10,
          offset: 0,
          hasMore: false
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Load more reviews
  const handleLoadMore = () => {
    if (reviewData) {
      fetchReviews(reviewData.reviews.length, false);
    }
  };

  // Submit review
  const handleSubmitReview = async (formData: any) => {
    try {
      setSubmitLoading(true);

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || "Đánh giá đã được gửi thành công");
        setShowReviewForm(false);
        // Refresh reviews
        fetchReviews(0, true);
      } else {
        throw new Error(result.error || "Không thể gửi đánh giá");
      }
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error);
      alert(error instanceof Error ? error.message : "Không thể gửi đánh giá");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchReviews(0, true);
  }, [productId, ratingFilter, sortBy]);

  return (
    <div className="w-full space-y-6">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Đánh giá sản phẩm</h2>
          {reviewData && (
            <p className="text-gray-600 mt-1">
              {reviewData.stats.total} đánh giá • Trung bình {reviewData.stats.average.toFixed(1)}/5
              <ReviewStars rating={reviewData.stats.average} size="sm" className="inline-flex ml-2" />
            </p>
          )}
        </div>

        <Button onClick={() => setShowReviewForm(true)} className="gap-2">
          <Edit className="w-4 h-4" />
          Viết đánh giá
        </Button>
      </div>

      {/* Review Summary */}
      {reviewData && (
        <ReviewSummary stats={reviewData.stats} />
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ReviewForm
              productId={productId}
              productName={productName}
              onSubmit={handleSubmitReview}
              onCancel={() => setShowReviewForm(false)}
              loading={submitLoading}
            />
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Lọc:</span>
        </div>

        {/* Rating filter */}
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tất cả đánh giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả đánh giá</SelectItem>
            <SelectItem value="5">5 sao</SelectItem>
            <SelectItem value="4">4 sao</SelectItem>
            <SelectItem value="3">3 sao</SelectItem>
            <SelectItem value="2">2 sao</SelectItem>
            <SelectItem value="1">1 sao</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort by */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
            <SelectItem value="highest">Điểm cao nhất</SelectItem>
            <SelectItem value="lowest">Điểm thấp nhất</SelectItem>
            <SelectItem value="helpful">Hữu ích nhất</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter tags */}
        <div className="flex flex-wrap gap-2 ml-auto">
          {ratingFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              <Star className="w-3 h-3" />
              {ratingFilter} sao
              <button
                onClick={() => setRatingFilter("all")}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      </div>

      {/* Review List */}
      <ReviewList
        reviews={reviewData?.reviews || []}
        loading={loading}
        hasMore={reviewData?.pagination.hasMore || false}
        onLoadMore={handleLoadMore}
      />

      {/* Quick stats */}
      {reviewData && reviewData.stats.total > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {reviewData.stats.average.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Điểm trung bình</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(((reviewData.stats.ratingBreakdown["5"] + reviewData.stats.ratingBreakdown["4"]) / reviewData.stats.total) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Đánh giá tích cực</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-indigo-600">
                {reviewData.stats.total}
              </div>
              <div className="text-sm text-gray-600">Tổng đánh giá</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {reviewData.reviews.filter(r => r.verified).length}
              </div>
              <div className="text-sm text-gray-600">Đã mua hàng</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviews; 