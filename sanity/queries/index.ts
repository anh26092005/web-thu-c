import { sanityFetch } from "@/sanity/lib/live";
import {
  BRANDS_QUERY,
  LATEST_BLOG_QUERY,
  DEAL_PRODUCTS,
  PRODUCT_BY_SLUG_QUERY,
  BANNER_QUERY,
  BRAND_QUERY,
  MY_ORDERS_QUERY,
  GET_ALL_BLOG,
  SINGLE_BLOG_QUERY,
  BLOG_CATEGORIES,
  CATEGORIES_QUERY,
  OTHERS_BLOG_QUERY,
  PROVINCES_QUERY,
  WARDS_BY_PROVINCE_QUERY,
  REVIEWS_BY_PRODUCT_QUERY,
  PRODUCT_REVIEW_STATS_QUERY,
  CREATE_REVIEW_QUERY,
  ALL_REVIEWS_QUERY,
  PRODUCT_REVIEW_SUMMARY_QUERY,
} from "./query";

// Existing functions cho Server Components
export const getBrands = async () => {
  const { data } = await sanityFetch({
    query: BRANDS_QUERY,
  });
  return data || [];
};

export const getLatestBlog = async () => {
  const { data } = await sanityFetch({
    query: LATEST_BLOG_QUERY,
  });
  return data || [];
};

export const getDealProducts = async () => {
  const { data } = await sanityFetch({
    query: DEAL_PRODUCTS,
  });
  return data || [];
};

export const getProductBySlug = async (slug: string) => {
  const { data } = await sanityFetch({
    query: PRODUCT_BY_SLUG_QUERY,
    params: { slug },
  });
  return data || null;
};

export const getBanners = async () => {
  const { data } = await sanityFetch({
    query: BANNER_QUERY,
  });
  return data || [];
};

export const getBrandBySlug = async (slug: string) => {
  const { data } = await sanityFetch({
    query: BRAND_QUERY,
    params: { slug },
  });
  return data || null;
};

export const getMyOrders = async (userId: string) => {
  const { data } = await sanityFetch({
    query: MY_ORDERS_QUERY,
    params: { userId },
  });
  return data || [];
};

export const getAllBlog = async (quantity: number) => {
  const { data } = await sanityFetch({
    query: GET_ALL_BLOG,
    params: { quantity },
  });
  return data || [];
};

export const getSingleBlog = async (slug: string) => {
  const { data } = await sanityFetch({
    query: SINGLE_BLOG_QUERY,
    params: { slug },
  });
  return data || null;
};

export const getBlogCategories = async () => {
  const { data } = await sanityFetch({
    query: BLOG_CATEGORIES,
  });
  return data || [];
};

// Function lấy danh sách categories sản phẩm
export const getCategories = async () => {
  const { data } = await sanityFetch({
    query: CATEGORIES_QUERY,
  });
  return data || [];
};

export const getOthersBlog = async (slug: string, quantity: number) => {
  const { data } = await sanityFetch({
    query: OTHERS_BLOG_QUERY,
    params: { slug, quantity },
  });
  return data || [];
};

export const getProvinces = async () => {
  const { data } = await sanityFetch({
    query: PROVINCES_QUERY,
  });
  return data || [];
};

export const getWardsByProvince = async (provinceId: string) => {
  const { data } = await sanityFetch({
    query: WARDS_BY_PROVINCE_QUERY,
    params: { provinceId },
  });
  return data || [];
};

// Reviews functions cho Server Components
export const getReviewsByProduct = async (productId: string) => {
  const { data } = await sanityFetch({
    query: REVIEWS_BY_PRODUCT_QUERY,
    params: { productId },
  });
  return data || [];
};

export const getProductReviewStats = async (productId: string) => {
  const { data } = await sanityFetch({
    query: PRODUCT_REVIEW_STATS_QUERY,
    params: { productId },
  });
  return data || [];
};

export const checkExistingReview = async (productId: string, email: string) => {
  const { data } = await sanityFetch({
    query: CREATE_REVIEW_QUERY,
    params: { productId, email },
  });
  return data || null;
};

export const getAllReviews = async (limit: number = 10) => {
  const { data } = await sanityFetch({
    query: ALL_REVIEWS_QUERY,
    params: { limit },
  });
  return data || [];
};

// Function cho Server Components sử dụng sanityFetch
export const getProductReviewSummary = async (productId: string) => {
  try {
    const { data } = await sanityFetch({
      query: PRODUCT_REVIEW_SUMMARY_QUERY,
      params: { productId },
    });
    
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
