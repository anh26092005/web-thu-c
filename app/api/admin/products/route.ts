import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";

// Query GROQ để lấy sản phẩm cho admin
const ADMIN_PRODUCTS_QUERY = `*[_type == "product"] | order(_createdAt desc) {
  _id,
  name,
  slug,
  price,
  discount,
  stock,
  status,
  variant,
  isFeatured,
  "images": images[0].asset->url,
  "categories": categories[]->name,
  "brand": brand->name,
  _createdAt,
  _updatedAt
}`;

// GET: Lấy danh sách sản phẩm cho admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Query cơ bản
    let query = ADMIN_PRODUCTS_QUERY;

    // Thêm filter tìm kiếm nếu có
    if (search) {
      query = `*[_type == "product" && (
        name match "*${search}*" ||
        brand->name match "*${search}*"
      )] | order(_createdAt desc) {
        _id,
        name,
        slug,
        price,
        discount,
        stock,
        status,
        variant,
        isFeatured,
        "images": images[0].asset->url,
        "categories": categories[]->name,
        "brand": brand->name,
        _createdAt,
        _updatedAt
      }`;
    }

    // Lấy dữ liệu từ Sanity
    const allProducts = await backendClient.fetch(query);

    // Filter theo status nếu cần
    let filteredProducts = allProducts;
    if (status !== "all") {
      filteredProducts = allProducts.filter((product: any) => product.status === status);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Tính toán các thống kê
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error("Lỗi lấy dữ liệu sản phẩm:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Không thể lấy dữ liệu sản phẩm" 
      },
      { status: 500 }
    );
  }
} 