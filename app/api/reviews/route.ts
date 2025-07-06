import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

// Interface cho dữ liệu đánh giá
interface ReviewData {
  product: {
    _type: "reference";
    _ref: string;
  };
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  comment: string;
  verified?: boolean;
  orderNumber?: string;
  isRecommended?: boolean;
  pros?: string[];
  cons?: string[];
  images?: any[];
}

// GET - Lấy danh sách đánh giá theo sản phẩm
export async function GET(request: NextRequest) {
  try {
    console.log("=== Reviews API GET Request ===");
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    console.log("Params:", { productId, limit, offset });

    if (!productId) {
      console.log("Error: Missing productId");
      return NextResponse.json(
        { error: "productId là bắt buộc" },
        { status: 400 }
      );
    }

    // Kiểm tra xem có reviews nào trong database không
    const allReviewsQuery = `*[_type == "review"]`;
    const allReviews = await client.fetch(allReviewsQuery);
    console.log("Total reviews in database:", allReviews.length);

    // Query lấy đánh giá theo sản phẩm  
    const query = `*[_type == "review" && product._ref == $productId] | order(reviewDate desc) [${offset}...${offset + limit}] {
      _id,
      customerName,
      rating,
      title,
      comment,
      verified,
      isRecommended,
      pros,
      cons,
      images,
      helpfulCount,
      reviewDate,
      adminResponse,
      isApproved
    }`;

    console.log("Query:", query);
    const reviews = await client.fetch(query, { productId });
    console.log("Found reviews:", reviews.length);

    // Query lấy thống kê đánh giá - sửa lỗi avg()
    const statsQuery = `{
      "total": count(*[_type == "review" && product._ref == $productId]),
      "ratings": *[_type == "review" && product._ref == $productId].rating,
      "ratingBreakdown": {
        "5": count(*[_type == "review" && product._ref == $productId && rating == 5]),
        "4": count(*[_type == "review" && product._ref == $productId && rating == 4]),
        "3": count(*[_type == "review" && product._ref == $productId && rating == 3]),
        "2": count(*[_type == "review" && product._ref == $productId && rating == 2]),
        "1": count(*[_type == "review" && product._ref == $productId && rating == 1])
      }
    }`;

    const stats = await client.fetch(statsQuery, { productId });
    console.log("Stats raw:", stats);

    // Tính trung bình thủ công
    const average = stats.ratings && stats.ratings.length > 0 
      ? stats.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / stats.ratings.length
      : 0;

    const response = {
      success: true,
      data: {
        reviews,
        stats: {
          total: stats.total || 0,
          average: Math.round(average * 10) / 10, // Làm tròn 1 chữ số thập phân
          ratingBreakdown: stats.ratingBreakdown || {
            "5": 0, "4": 0, "3": 0, "2": 0, "1": 0
          }
        },
        pagination: {
          limit,
          offset,
          hasMore: reviews.length === limit,
        },
      },
    };

    console.log("Response:", JSON.stringify(response, null, 2));
    return NextResponse.json(response);

  } catch (error) {
    console.error("Lỗi lấy đánh giá chi tiết:", error);
    return NextResponse.json(
      { 
        error: "Không thể lấy danh sách đánh giá",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// POST - Tạo đánh giá mới
export async function POST(request: NextRequest) {
  try {
    console.log("=== Reviews API POST Request ===");
    const body = await request.json();
    console.log("Request body:", body);

    const {
      productId,
      customerName,
      customerEmail,
      rating,
      title,
      comment,
      orderNumber,
      isRecommended,
      pros,
      cons,
    } = body;

    // Validation dữ liệu
    if (!productId || !customerName || !customerEmail || !rating || !title || !comment) {
      console.log("Validation failed - missing required fields");
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      console.log("Validation failed - invalid rating:", rating);
      return NextResponse.json(
        { error: "Điểm đánh giá phải từ 1 đến 5" },
        { status: 400 }
      );
    }

    // Kiểm tra sản phẩm có tồn tại không
    const productCheck = await client.fetch(
      `*[_type == "product" && _id == $productId][0]`,
      { productId }
    );
    
    if (!productCheck) {
      console.log("Product not found:", productId);
      return NextResponse.json(
        { error: "Sản phẩm không tồn tại" },
        { status: 404 }
      );
    }

    console.log("Product found:", productCheck.name);

    // Kiểm tra đánh giá đã tồn tại (optional - có thể comment để test)
    const existingReview = await client.fetch(
      `*[_type == "review" && product._ref == $productId && customerEmail == $email][0]`,
      { productId, email: customerEmail }
    );

    if (existingReview) {
      console.log("Review already exists for this user and product");
      return NextResponse.json(
        { error: "Bạn đã đánh giá sản phẩm này rồi" },
        { status: 409 }
      );
    }

    // Chuẩn bị dữ liệu đánh giá
    const reviewData = {
      _type: "review",
      product: {
        _type: "reference",
        _ref: productId,
      },
      customerName,
      customerEmail,
      rating,
      title,
      comment,
      verified: false, // Mặc định false
      orderNumber: orderNumber || null,
      isRecommended: isRecommended || false,
      pros: pros || [],
      cons: cons || [],
      reviewDate: new Date().toISOString(),
      isApproved: true, // Tạm thời set true để test
      helpfulCount: 0,
    };

    console.log("Creating review with data:", reviewData);

    // Tạo đánh giá mới
    const newReview = await client.create(reviewData);
    console.log("Review created successfully:", newReview._id);

    return NextResponse.json({
      success: true,
      message: "Đánh giá đã được gửi thành công",
      data: newReview,
    });

  } catch (error) {
    console.error("Lỗi tạo đánh giá chi tiết:", error);
    return NextResponse.json(
      { 
        error: "Không thể tạo đánh giá",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 