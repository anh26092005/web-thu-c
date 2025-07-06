import { client } from "@/sanity/lib/client";

// Query cho thống kê review nhanh trong Client Components
const PRODUCT_REVIEW_SUMMARY_QUERY = `*[_type == "review" && product._ref == $productId && isApproved == true]{
  rating
}`;

// Function riêng cho Client Components sử dụng client trực tiếp
export const getProductReviewSummaryClient = async (productId: string) => {
  try {
    const data = await client.fetch(PRODUCT_REVIEW_SUMMARY_QUERY, { productId });
    
    if (!data || data.length === 0) {
      return {
        total: 0,
        average: 0
      };
    }

    const total = data.length;
    const sum = data.reduce((acc: number, review: any) => acc + review.rating, 0);
    const average = sum / total;

    return {
      total,
      average: Math.round(average * 10) / 10 // Làm tròn 1 chữ số thập phân
    };
  } catch (error) {
    console.error("Error fetching product review summary:", error);
    return {
      total: 0,
      average: 0
    };
  }
}; 