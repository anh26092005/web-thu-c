import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { checkAdminAuth } from "@/lib/adminAuth";

// GET: Lấy dữ liệu analytics cho admin
export async function GET(request: NextRequest) {
  // Kiểm tra quyền admin
  const authCheck = await checkAdminAuth();
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "7d";

    // Tính toán ngày bắt đầu và kết thúc dựa trên range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (range) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "3m":
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    // Query các dữ liệu cần thiết từ Sanity
    const [
      allOrders,
      allProducts,
      allReviews
    ] = await Promise.all([
      // Tất cả đơn hàng
      backendClient.fetch(`*[_type == "order"] {
        _id,
        orderNumber,
        customerName,
        totalPrice,
        status,
        isPaid,
        orderDate,
        products[]{
          ...,
          product->
        }
      }`),
      
      // Tất cả sản phẩm
      backendClient.fetch(`*[_type == "product"] {
        _id,
        name,
        price,
        stock,
        images
      }`),
      
      // Tất cả đánh giá
      backendClient.fetch(`*[_type == "review"] {
        rating,
        isApproved,
        reviewDate
      }`)
    ]);

    // Filter đơn hàng trong khoảng thời gian
    const ordersInRange = allOrders.filter((order: any) => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });

    // Tính toán thống kê tổng quan
    const totalRevenue = ordersInRange
      .filter((order: any) => order.isPaid)
      .reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);

    const totalOrders = ordersInRange.length;

    // Tính AOV
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Tính tăng trưởng (so với kỳ trước)
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(endDate);
    
    switch (range) {
      case "7d":
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        previousEndDate.setDate(previousEndDate.getDate() - 7);
        break;
      case "30d":
        previousStartDate.setDate(previousStartDate.getDate() - 30);
        previousEndDate.setDate(previousEndDate.getDate() - 30);
        break;
      case "3m":
        previousStartDate.setMonth(previousStartDate.getMonth() - 3);
        previousEndDate.setMonth(previousEndDate.getMonth() - 3);
        break;
      case "1y":
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
        previousEndDate.setFullYear(previousEndDate.getFullYear() - 1);
        break;
    }

    const previousOrders = allOrders.filter((order: any) => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= previousStartDate && orderDate <= previousEndDate;
    });

    const previousRevenue = previousOrders
      .filter((order: any) => order.isPaid)
      .reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);

    // Tính % tăng trưởng
    const revenueGrowth = previousRevenue > 0 
      ? `${((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)}%`
      : "+100%";

    const ordersGrowth = previousOrders.length > 0
      ? `${((totalOrders - previousOrders.length) / previousOrders.length * 100).toFixed(1)}%`
      : "+100%";

    // Mock growth data cho AOV
    const aovGrowth = "+5.2%";

    // Tạo dữ liệu cho biểu đồ theo giờ (cập nhật mỗi giờ)
    const currentHour = new Date().getHours();
    const hourlyData = [];
    const hourlyLabels = [];
    
    if (range === "7d") {
      // 24 giờ gần nhất
      for (let i = 23; i >= 0; i--) {
        const hour = (currentHour - i + 24) % 24;
        hourlyLabels.push(`${hour}:00`);
        // Mock data với xu hướng tăng vào giờ cao điểm
        const baseRevenue = 50000;
        const peakMultiplier = (hour >= 9 && hour <= 11) || (hour >= 19 && hour <= 21) ? 2.5 : 1;
        hourlyData.push(Math.floor(baseRevenue * peakMultiplier * (0.8 + Math.random() * 0.4)));
      }
    } else if (range === "30d") {
      // 30 ngày qua
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        hourlyLabels.push(`${date.getDate()}/${date.getMonth() + 1}`);
        hourlyData.push(Math.floor(Math.random() * 500000 + 200000));
      }
    } else if (range === "3m") {
      // 12 tuần qua
      for (let i = 11; i >= 0; i--) {
        hourlyLabels.push(`Tuần ${12 - i}`);
        hourlyData.push(Math.floor(Math.random() * 2000000 + 1000000));
      }
    } else {
      // 12 tháng qua
      const months = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
      for (let i = 11; i >= 0; i--) {
        const monthIndex = (new Date().getMonth() - i + 12) % 12;
        hourlyLabels.push(months[monthIndex]);
        hourlyData.push(Math.floor(Math.random() * 8000000 + 4000000));
      }
    }

    const salesChart = {
      labels: hourlyLabels,
      data: hourlyData
    };

    // Top sản phẩm dựa trên đơn hàng thực
    const productSales = new Map();
    ordersInRange.forEach((order: any) => {
      order.products?.forEach((item: any) => {
        const productId = item.product?._id;
        if (productId) {
          const current = productSales.get(productId) || { sales: 0, revenue: 0, name: item.product.name };
          productSales.set(productId, {
            _id: productId,
            name: item.product.name,
            sales: current.sales + (item.quantity || 1),
            revenue: current.revenue + (item.quantity || 1) * (item.product.price || 0)
          });
        }
      });
    });

    const topProducts = Array.from(productSales.values())
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);

    // Đơn hàng gần đây
    const recentOrders = ordersInRange
      .sort((a: any, b: any) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 10);

    // Thống kê sản phẩm
    const productStats = {
      totalProducts: allProducts.length,
      inStock: allProducts.filter((product: any) => (product.stock || 0) > 0).length,
      outOfStock: allProducts.filter((product: any) => (product.stock || 0) === 0).length,
      lowStock: allProducts.filter((product: any) => (product.stock || 0) > 0 && (product.stock || 0) <= 10).length
    };

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          revenueGrowth,
          totalOrders,
          ordersGrowth,
          averageOrderValue,
          aovGrowth
        },
        salesChart,
        topProducts,
        recentOrders,
        productStats
      }
    });

  } catch (error) {
    console.error("Lỗi lấy dữ liệu analytics:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Không thể lấy dữ liệu analytics" 
      },
      { status: 500 }
    );
  }
} 