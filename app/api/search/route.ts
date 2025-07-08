import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";

// API route để tìm kiếm sản phẩm và blog
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const type = searchParams.get("type") || "all"; // all, products, blogs
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query || query.trim() === "") {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          blogs: [],
          total: 0
        }
      });
    }

    const searchTerm = query.trim().toLowerCase();

    let products = [];
    let blogs = [];

    // Tìm kiếm sản phẩm
    if (type === "all" || type === "products") {
      const productQuery = `
        *[_type == "product" && (
          name match $searchTerm + "*" ||
          pt::text(description) match $searchTerm + "*" ||
          categories[]->title match $searchTerm + "*" ||
          brand->name match $searchTerm + "*"
        )] | order(_score desc, name asc) [0...${limit}] {
          _id,
          name,
          slug,
          price,
          discount,
          images[0] {
            asset-> {
              url
            }
          },
          categories[]-> {
            title
          },
          brand-> {
            name
          },
          stock,
          status
        }
      `;

      products = await client.fetch(productQuery, { 
        searchTerm: `*${searchTerm}*` 
      });
    }

    // Tìm kiếm blog
    if (type === "all" || type === "blogs") {
      const blogQuery = `
        *[_type == "blog" && (
          title match $searchTerm + "*" ||
          pt::text(excerpt) match $searchTerm + "*" ||
          pt::text(body) match $searchTerm + "*" ||
          blogcategories[]->title match $searchTerm + "*"
        )] | order(_score desc, publishedAt desc) [0...${limit}] {
          _id,
          title,
          slug,
          excerpt,
          publishedAt,
          mainImage {
            asset-> {
              url
            }
          },
          author-> {
            name,
            image
          },
          blogcategories[]-> {
            title
          },
          "readTime": round(length(pt::text(body)) / 5 / 200)
        }
      `;

      blogs = await client.fetch(blogQuery, { 
        searchTerm: `*${searchTerm}*` 
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        products: products || [],
        blogs: blogs || [],
        total: (products?.length || 0) + (blogs?.length || 0),
        query: query
      }
    });

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Lỗi khi tìm kiếm" 
      },
      { status: 500 }
    );
  }
} 