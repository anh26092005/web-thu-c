import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";

// Query GROQ để lấy đánh giá cho admin
const ADMIN_REVIEWS_QUERY = `*[_type == "review"] | order(reviewDate desc) {
  _id,
  customerName,
  customerEmail,
  rating,
  title,
  comment,
  "productName": product->name,
  "productId": product._ref,
  isApproved,
  verified,
  reviewDate,
  helpfulCount,
  adminResponse
}`;

// GET: Lấy danh sách đánh giá cho admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const rating = searchParams.get("rating") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Query cơ bản
    let query = ADMIN_REVIEWS_QUERY;

    // Thêm filter tìm kiếm nếu có
    if (search) {
      query = `*[_type == "review" && (
        customerName match "*${search}*" ||
        product->name match "*${search}*" ||
        comment match "*${search}*"
      )] | order(reviewDate desc) {
        _id,
        customerName,
        customerEmail,
        rating,
        title,
        comment,
        "productName": product->name,
        "productId": product._ref,
        isApproved,
        verified,
        reviewDate,
        helpfulCount,
        adminResponse
      }`;
    }

    // Lấy dữ liệu từ Sanity
    const allReviews = await backendClient.fetch(query);

    // Filter theo status và rating
    let filteredReviews = allReviews;
    
    if (status !== "all") {
      filteredReviews = filteredReviews.filter((review: any) => {
        if (status === "approved") return review.isApproved;
        if (status === "pending") return !review.isApproved;
        return true;
      });
    }

    if (rating !== "all") {
      filteredReviews = filteredReviews.filter((review: any) => 
        review.rating.toString() === rating
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

    // Tính toán thống kê
    const totalReviews = allReviews.length;
    const approvedCount = allReviews.filter((r: any) => r.isApproved).length;
    const pendingCount = allReviews.filter((r: any) => !r.isApproved).length;
    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        reviews: paginatedReviews,
        stats: {
          total: totalReviews,
          approved: approvedCount,
          pending: pendingCount,
          averageRating: Math.round(averageRating * 10) / 10
        },
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredReviews.length / limit),
          totalReviews: filteredReviews.length,
          hasNextPage: page < Math.ceil(filteredReviews.length / limit),
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Lỗi lấy dữ liệu đánh giá:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Không thể lấy dữ liệu đánh giá" 
      },
      { status: 500 }
    );
  }
}

// PATCH: Cập nhật trạng thái đánh giá (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, action } = body;

    if (!reviewId || !action) {
      return NextResponse.json(
        { success: false, error: "Thiếu reviewId hoặc action" },
        { status: 400 }
      );
    }

    // Cập nhật trạng thái đánh giá
    const updatedReview = await backendClient
      .patch(reviewId)
      .set({ 
        isApproved: action === "approve",
        ...(action === "approve" && { approvedAt: new Date().toISOString() })
      })
      .commit();

    return NextResponse.json({
      success: true,
      data: updatedReview
    });

  } catch (error) {
    console.error("Lỗi cập nhật đánh giá:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Không thể cập nhật đánh giá" 
      },
      { status: 500 }
    );
  }
} 