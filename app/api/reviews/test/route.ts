import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

// API để tạo sample reviews cho testing
export async function POST(request: NextRequest) {
  try {
    // Lấy danh sách sản phẩm
    const products = await client.fetch(`*[_type == "product"][0...3]`);
    
    if (products.length === 0) {
      return NextResponse.json({
        error: "Không có sản phẩm nào để tạo review"
      }, { status: 400 });
    }

    const sampleReviews = [
      {
        _type: "review",
        product: {
          _type: "reference",
          _ref: products[0]._id,
        },
        customerName: "Nguyễn Văn A",
        customerEmail: "nguyen.van.a@email.com",
        rating: 5,
        title: "Sản phẩm rất tốt",
        comment: "Tôi rất hài lòng với sản phẩm này. Chất lượng tuyệt vời, giao hàng nhanh.",
        verified: true,
        isRecommended: true,
        pros: ["Chất lượng cao", "Giao hàng nhanh", "Giá hợp lý"],
        cons: [],
        reviewDate: new Date().toISOString(),
        isApproved: true,
        helpfulCount: 5,
      },
      {
        _type: "review",
        product: {
          _type: "reference",
          _ref: products[0]._id,
        },
        customerName: "Trần Thị B",
        customerEmail: "tran.thi.b@email.com",
        rating: 4,
        title: "Khá ổn",
        comment: "Sản phẩm khá tốt, tuy nhiên vẫn có một số điểm cần cải thiện.",
        verified: true,
        isRecommended: true,
        pros: ["Hiệu quả", "Dễ sử dụng"],
        cons: ["Giá hơi cao"],
        reviewDate: new Date(Date.now() - 86400000).toISOString(), // 1 ngày trước
        isApproved: true,
        helpfulCount: 3,
      },
      {
        _type: "review",
        product: {
          _type: "reference",
          _ref: products[0]._id,
        },
        customerName: "Lê Văn C",
        customerEmail: "le.van.c@email.com",
        rating: 3,
        title: "Bình thường",
        comment: "Sản phẩm ở mức trung bình, không có gì đặc biệt.",
        verified: false,
        isRecommended: false,
        pros: ["Giá hợp lý"],
        cons: ["Chất lượng trung bình", "Đóng gói không đẹp"],
        reviewDate: new Date(Date.now() - 172800000).toISOString(), // 2 ngày trước
        isApproved: true,
        helpfulCount: 1,
      }
    ];

    const createdReviews = [];
    
    for (const reviewData of sampleReviews) {
      const review = await client.create(reviewData);
      createdReviews.push(review);
    }

    return NextResponse.json({
      success: true,
      message: `Đã tạo ${createdReviews.length} sample reviews`,
      data: {
        product: products[0],
        reviews: createdReviews
      }
    });

  } catch (error) {
    console.error("Lỗi tạo sample reviews:", error);
    return NextResponse.json({
      error: "Không thể tạo sample reviews",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// API để xóa tất cả reviews (cho testing)
export async function DELETE() {
  try {
    const reviews = await client.fetch(`*[_type == "review"]`);
    
    for (const review of reviews) {
      await client.delete(review._id);
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa ${reviews.length} reviews`
    });

  } catch (error) {
    console.error("Lỗi xóa reviews:", error);
    return NextResponse.json({
      error: "Không thể xóa reviews",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
} 