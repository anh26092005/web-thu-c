import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";

// GET: Lấy dữ liệu tổng quan cho dashboard
export async function GET() {
  try {
    // Query các thống kê từ Sanity
    const [
      totalProducts,
      totalOrders,
      totalReviews,
      recentOrders,
      pendingReviews,
      featuredProducts
    ] = await Promise.all([
      // Tổng số sản phẩm
      backendClient.fetch(`count(*[_type == "product"])`),
      
      // Tổng số đơn hàng
      backendClient.fetch(`count(*[_type == "order"])`),
      
      // Tổng số đánh giá
      backendClient.fetch(`count(*[_type == "review"])`),
      
      // Đơn hàng gần đây (5 đơn mới nhất)
      backendClient.fetch(`*[_type == "order"] | order(orderDate desc)[0...5] {
        _id,
        orderNumber,
        customerName,
        totalPrice,
        status,
        orderDate,
        "productCount": count(products)
      }`),
      
      // Đánh giá chờ duyệt
      backendClient.fetch(`count(*[_type == "review" && isApproved == false])`),
      
      // Sản phẩm nổi bật
      backendClient.fetch(`count(*[_type == "product" && isFeatured == true])`)
    ]);

    // Lấy thêm thống kê đánh giá
    const reviewStats = await backendClient.fetch(`
      *[_type == "review"] {
        rating,
        isApproved,
        reviewDate
      }
    `);

    // Tính toán các thống kê
    const approvedReviews = reviewStats.filter((r: any) => r.isApproved).length;
    const averageRating = reviewStats.length > 0 
      ? reviewStats.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewStats.length
      : 0;

    // Thống kê đơn hàng theo trạng thái
    const orderStats = await backendClient.fetch(`
      *[_type == "order"] {
        status,
        totalPrice,
        isPaid,
        orderDate
      }
    `);

    const pendingOrders = orderStats.filter((o: any) => o.status === "pending").length;
    const totalRevenue = orderStats
      .filter((o: any) => o.isPaid)
      .reduce((sum: number, o: any) => sum + o.totalPrice, 0);

    // Mock data cho customers (nếu chưa có schema user)
    const totalUsers = 856; // Có thể thay bằng query thật nếu có schema

    // Hoạt động hôm nay (mock data - có thể tính thật từ createdAt)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orderStats.filter((o: any) => 
      new Date(o.orderDate) >= today
    ).length;

    const todayReviews = reviewStats.filter((r: any) => 
      new Date(r.reviewDate) >= today
    ).length;

    return NextResponse.json({
      success: true,
      data: {
        // Thống kê tổng quan
        stats: {
          totalOrders,
          totalUsers,
          totalProducts,
          totalReviews,
          totalRevenue,
          pendingOrders,
          averageRating: Math.round(averageRating * 10) / 10,
          approvedReviews,
          pendingReviews,
          featuredProducts
        },
        
        // Đơn hàng gần đây
        recentOrders,
        
        // Hoạt động hôm nay
        todayActivities: {
          newOrders: todayOrders,
          newCustomers: Math.floor(Math.random() * 10), // Mock data
          newReviews: todayReviews,
          outOfStock: await backendClient.fetch(`count(*[_type == "product" && stock <= 0])`)
        },

        // Thống kê tăng trưởng (mock data - có thể tính thật)
        growth: {
          ordersGrowth: "+12%",
          usersGrowth: "+8%", 
          productsGrowth: "+5",
          revenueGrowth: "+15%",
          reviewsGrowth: "+23"
        }
      }
    });

  } catch (error) {
    console.error("Lỗi lấy dữ liệu dashboard:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Không thể lấy dữ liệu dashboard" 
      },
      { status: 500 }
    );
  }
} 