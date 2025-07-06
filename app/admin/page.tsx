"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Users, 
  Package, 
  Star,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Eye
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalReviews: number;
  totalRevenue: number;
  pendingOrders: number;
  averageRating: number;
  approvedReviews: number;
  pendingReviews: number;
  featuredProducts: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  customerName: string;
  totalPrice: number;
  status: string;
  orderDate: string;
  productCount: number;
}

interface TodayActivities {
  newOrders: number;
  newCustomers: number;
  newReviews: number;
  outOfStock: number;
}

interface Growth {
  ordersGrowth: string;
  usersGrowth: string;
  productsGrowth: string;
  revenueGrowth: string;
  reviewsGrowth: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  todayActivities: TodayActivities;
  growth: Growth;
}

// Trang chính admin dashboard
export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data từ Sanity
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        const result = await response.json();
        
        if (result.success) {
          setDashboardData(result.data);
        } else {
          console.error("Lỗi API:", result.error);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không thể tải dữ liệu dashboard</p>
      </div>
    );
  }

  const { stats, recentOrders, todayActivities, growth } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Tổng quan về hoạt động website</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tổng đơn hàng */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{growth.ordersGrowth}</span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        {/* Tổng khách hàng */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{growth.usersGrowth}</span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        {/* Tổng sản phẩm */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">{growth.productsGrowth}</span> sản phẩm mới
            </p>
          </CardContent>
        </Card>

        {/* Doanh thu */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRevenue.toLocaleString()}đ
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{growth.revenueGrowth}</span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        {/* Đơn hàng chờ xử lý */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              Đơn hàng cần xử lý
            </p>
          </CardContent>
        </Card>

        {/* Đánh giá trung bình */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá TB</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.averageRating}/5
            </div>
            <p className="text-xs text-muted-foreground">
              Từ {stats.totalReviews} đánh giá
            </p>
          </CardContent>
        </Card>

        {/* Tổng đánh giá */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{growth.reviewsGrowth}</span> đánh giá mới
            </p>
          </CardContent>
        </Card>

        {/* Sản phẩm nổi bật */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SP nổi bật</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featuredProducts}</div>
            <p className="text-xs text-muted-foreground">
              Sản phẩm được đánh dấu nổi bật
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Đơn hàng gần đây */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <CardDescription>Các đơn hàng mới nhất cần xử lý</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.totalPrice.toLocaleString()}đ</p>
                      <Badge variant="secondary" className="text-xs">
                        {order.status === "pending" ? "Chờ xử lý" : 
                         order.status === "processing" ? "Đang xử lý" :
                         order.status === "shipped" ? "Đã giao" : 
                         order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Chưa có đơn hàng nào</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Hoạt động hôm nay */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động hôm nay</CardTitle>
            <CardDescription>Các hoạt động quan trọng trong ngày</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Đơn hàng mới</span>
                <Badge variant="default">{todayActivities.newOrders}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Khách hàng mới</span>
                <Badge variant="secondary">{todayActivities.newCustomers}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Đánh giá mới</span>
                <Badge variant="outline">{todayActivities.newReviews}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sản phẩm hết hàng</span>
                <Badge variant="destructive">{todayActivities.outOfStock}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 