"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ReviewStars from "@/components/reviews/ReviewStars";
import { 
  Search, 
  Star, 
  Check, 
  X, 
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

interface Review {
  _id: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  productName: string;
  productId: string;
  isApproved: boolean;
  verified: boolean;
  reviewDate: string;
  helpfulCount: number;
  adminResponse?: any;
}

interface ReviewStats {
  total: number;
  approved: number;
  pending: number;
  averageRating: number;
}

interface ReviewsData {
  reviews: Review[];
  stats: ReviewStats;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalReviews: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Trang quản lý đánh giá
export default function AdminReviewsPage() {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch reviews data từ Sanity
  const fetchReviews = async (
    page: number = 1, 
    search: string = "", 
    status: string = "all", 
    rating: string = "all"
  ) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search,
        status,
        rating
      });

      const response = await fetch(`/api/admin/reviews?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setReviewsData(result.data);
      } else {
        console.error("Lỗi API:", result.error);
      }
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchReviews(1, searchTerm, filterStatus, filterRating);
  }, []);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchReviews(1, searchTerm, filterStatus, filterRating);
  };

  // Handle filter change
  const handleFilterChange = (type: 'status' | 'rating', value: string) => {
    setCurrentPage(1);
    if (type === 'status') {
      setFilterStatus(value);
      fetchReviews(1, searchTerm, value, filterRating);
    } else {
      setFilterRating(value);
      fetchReviews(1, searchTerm, filterStatus, value);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchReviews(page, searchTerm, filterStatus, filterRating);
  };

  // Approve/reject review
  const handleReviewAction = async (reviewId: string, action: "approve" | "reject") => {
    try {
      setActionLoading(reviewId);
      
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewId, action }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh data
        fetchReviews(currentPage, searchTerm, filterStatus, filterRating);
      } else {
        console.error("Lỗi cập nhật đánh giá:", result.error);
      }
    } catch (error) {
      console.error(`Lỗi ${action} đánh giá:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (review: Review) => {
    if (review.isApproved) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 gap-1">
          <CheckCircle className="h-3 w-3" />
          Đã duyệt
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 gap-1">
          <Clock className="h-3 w-3" />
          Chờ duyệt
        </Badge>
      );
    }
  };

  if (loading && !reviewsData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = reviewsData?.stats || { total: 0, approved: 0, pending: 0, averageRating: 0 };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đánh giá</h1>
          <p className="text-gray-600 mt-1">Quản lý đánh giá sản phẩm từ khách hàng</p>
        </div>
        
        {stats.pending > 0 && (
          <Badge variant="destructive" className="gap-1">
            <Clock className="h-3 w-3" />
            {stats.pending} chờ duyệt
          </Badge>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đánh giá</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đã duyệt</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điểm trung bình</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo tên khách hàng, sản phẩm, nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              Tìm kiếm
            </Button>

            {/* Status filter */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => handleFilterChange('status', "all")}
                size="sm"
                disabled={loading}
              >
                Tất cả
              </Button>
              <Button
                variant={filterStatus === "approved" ? "default" : "outline"}
                onClick={() => handleFilterChange('status', "approved")}
                size="sm"
                disabled={loading}
              >
                Đã duyệt
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => handleFilterChange('status', "pending")}
                size="sm"
                disabled={loading}
              >
                Chờ duyệt
              </Button>
            </div>

            {/* Rating filter */}
            <div className="flex gap-2">
              <Button
                variant={filterRating === "all" ? "default" : "outline"}
                onClick={() => handleFilterChange('rating', "all")}
                size="sm"
                disabled={loading}
              >
                Tất cả sao
              </Button>
              {[5, 4, 3, 2, 1].map(rating => (
                <Button
                  key={rating}
                  variant={filterRating === rating.toString() ? "default" : "outline"}
                  onClick={() => handleFilterChange('rating', rating.toString())}
                  size="sm"
                  disabled={loading}
                >
                  {rating}★
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews list */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>
          ))
        ) : (
          reviewsData?.reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{review.customerName}</p>
                        <p className="text-sm text-gray-500">{review.customerEmail}</p>
                      </div>
                      {review.verified && (
                        <Badge variant="outline" className="text-xs">
                          Đã mua hàng
                        </Badge>
                      )}
                      {getStatusBadge(review)}
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <ReviewStars rating={review.rating} size="sm" />
                        <span className="text-sm text-gray-600">
                          {new Date(review.reviewDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{review.title}</h3>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Sản phẩm: <strong>{review.productName}</strong></span>
                      <span>Hữu ích: {review.helpfulCount} người</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!review.isApproved && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewAction(review._id, "approve")}
                          disabled={actionLoading === review._id}
                          className="gap-1 text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                          {actionLoading === review._id ? "Đang xử lý..." : "Duyệt"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReviewAction(review._id, "reject")}
                          disabled={actionLoading === review._id}
                          className="gap-1 text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                          Từ chối
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {reviewsData && reviewsData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Trang {reviewsData.pagination.currentPage} / {reviewsData.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!reviewsData.pagination.hasPrevPage || loading}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!reviewsData.pagination.hasNextPage || loading}
              >
              Sau
            </Button>
          </div>
        </div>
      )}

      {reviewsData?.reviews.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đánh giá</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Không tìm thấy đánh giá phù hợp." : "Chưa có đánh giá nào từ khách hàng."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 