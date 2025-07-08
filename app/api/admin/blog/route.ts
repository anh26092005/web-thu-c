import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { checkAdminAuth } from "@/lib/adminAuth";

// GET: Lấy danh sách bài viết blog cho admin
export async function GET(request: NextRequest) {
  // Kiểm tra quyền admin
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";

    // Query lấy tất cả bài viết với thông tin chi tiết
    const allPosts = await backendClient.fetch(`
      *[_type == "blog"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        publishedAt,
        mainImage{
          asset->{
            url
          }
        },
        excerpt,
        author->{
          name,
          image
        },
        blogcategories[]->{
          title
        },
        isLatest,
        body,
        "views": coalesce(views, 0)
      }
    `);

    // Filter theo search term nếu có
    let filteredPosts = allPosts;
    if (search) {
      filteredPosts = allPosts.filter((post: any) =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Filter theo status nếu có
    if (status !== "all") {
      switch (status) {
        case "published":
          filteredPosts = filteredPosts.filter((post: any) => post.publishedAt);
          break;
        case "draft":
          filteredPosts = filteredPosts.filter((post: any) => !post.publishedAt);
          break;
        case "featured":
          filteredPosts = filteredPosts.filter((post: any) => post.isLatest);
          break;
      }
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

    // Thống kê tổng quan
    const stats = {
      total: allPosts.length,
      published: allPosts.filter((post: any) => post.publishedAt).length,
      draft: allPosts.filter((post: any) => !post.publishedAt).length,
      featured: allPosts.filter((post: any) => post.isLatest).length,
      thisMonth: allPosts.filter((post: any) => {
        if (!post.publishedAt) return false;
        const postDate = new Date(post.publishedAt);
        const now = new Date();
        return postDate.getMonth() === now.getMonth() && postDate.getFullYear() === now.getFullYear();
      }).length
    };

    return NextResponse.json({
      success: true,
      data: {
        posts: paginatedPosts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredPosts.length / limit),
          totalItems: filteredPosts.length,
          hasNextPage: endIndex < filteredPosts.length,
          hasPreviousPage: page > 1
        },
        stats
      }
    });

  } catch (error) {
    console.error("Lỗi lấy danh sách blog:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Không thể lấy danh sách bài viết" 
      },
      { status: 500 }
    );
  }
}

// POST: Tạo bài viết mới (có thể thêm sau)
export async function POST(request: NextRequest) {
  // Kiểm tra quyền admin
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    
    // Validation và tạo bài viết mới
    const newPost = await backendClient.create({
      _type: "blog",
      ...body,
      publishedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: newPost
    });

  } catch (error) {
    console.error("Lỗi tạo bài viết:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Không thể tạo bài viết mới" 
      },
      { status: 500 }
    );
  }
}

// PUT: Cập nhật bài viết
export async function PUT(request: NextRequest) {
  // Kiểm tra quyền admin
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, error: "ID bài viết không được cung cấp" },
        { status: 400 }
      );
    }

    const updatedPost = await backendClient
      .patch(_id)
      .set(updateData)
      .commit();

    return NextResponse.json({
      success: true,
      data: updatedPost
    });

  } catch (error) {
    console.error("Lỗi cập nhật bài viết:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Không thể cập nhật bài viết" 
      },
      { status: 500 }
    );
  }
}

// DELETE: Xóa bài viết (có thể thêm sau)
export async function DELETE(request: NextRequest) {
  // Kiểm tra quyền admin
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return NextResponse.json(
        { success: false, error: "ID bài viết không được cung cấp" },
        { status: 400 }
      );
    }

    await backendClient.delete(postId);

    return NextResponse.json({
      success: true,
      message: "Đã xóa bài viết thành công"
    });

  } catch (error) {
    console.error("Lỗi xóa bài viết:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Không thể xóa bài viết" 
      },
      { status: 500 }
    );
  }
} 