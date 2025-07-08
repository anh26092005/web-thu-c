"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Eye,
  Calendar,
  Star,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

// Interface cho dữ liệu analytics
interface AnalyticsData {
  overview: {
    totalRevenue: number;
    revenueGrowth: string;
    totalOrders: number;
    ordersGrowth: string;
    averageOrderValue: number;
    aovGrowth: string;
  };
  salesChart: {
    labels: string[];
    data: number[];
  };
  topProducts: Array<{
    _id: string;
    name: string;
    sales: number;
    revenue: number;
    image?: string;
  }>;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customerName: string;
    totalPrice: number;
    status: string;
    orderDate: string;
  }>;
  productStats: {
    totalProducts: number;
    inStock: number;
    outOfStock: number;
    lowStock: number;
  };
}

// Trang analytics chính
export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Cập nhật thời gian theo giờ
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 3600000); // Cập nhật mỗi giờ

    return () => clearInterval(timer);
  }, []);

  // Fetch analytics data từ API
  const fetchAnalytics = async (range: string = "7d") => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${range}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        console.error("Lỗi API:", result.error);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(dateRange);
  }, [dateRange]);

  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    fetchAnalytics(range);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không thể tải dữ liệu thống kê</p>
      </div>
    );
  }

  const { overview, salesChart, topProducts, recentOrders, productStats } = analyticsData;

  return (
    <div className="space-y-6">
      {/* Page title và date filter */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Phân tích hiệu suất kinh doanh - Cập nhật lúc {currentTime.toLocaleTimeString('vi-VN')}
          </p>
        </div>
        <Select value={dateRange} onValueChange={handleDateRangeChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 ngày qua</SelectItem>
            <SelectItem value="30d">30 ngày qua</SelectItem>
            <SelectItem value="3m">3 tháng qua</SelectItem>
            <SelectItem value="1y">1 năm qua</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Doanh thu */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalRevenue.toLocaleString('vi-VN')}đ</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {overview.revenueGrowth.startsWith('+') ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={overview.revenueGrowth.startsWith('+') ? "text-green-600" : "text-red-600"}>
                {overview.revenueGrowth}
              </span>
              <span className="ml-1">so với kỳ trước</span>
            </div>
          </CardContent>
        </Card>

        {/* Đơn hàng */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalOrders.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {overview.ordersGrowth.startsWith('+') ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={overview.ordersGrowth.startsWith('+') ? "text-green-600" : "text-red-600"}>
                {overview.ordersGrowth}
              </span>
              <span className="ml-1">so với kỳ trước</span>
            </div>
          </CardContent>
        </Card>

        {/* AOV */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giá trị đơn TB</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.averageOrderValue.toLocaleString('vi-VN')}đ</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {overview.aovGrowth.startsWith('+') ? (
                <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={overview.aovGrowth.startsWith('+') ? "text-green-600" : "text-red-600"}>
                {overview.aovGrowth}
              </span>
              <span className="ml-1">so với kỳ trước</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts và detailed stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ doanh thu */}
        <Card>
          <CardHeader>
            <CardTitle>Xu hướng doanh thu theo giờ</CardTitle>
            <CardDescription>
              Doanh thu trong {dateRange === '7d' ? '7 ngày' : dateRange === '30d' ? '30 ngày' : dateRange === '3m' ? '3 tháng' : '1 năm'} qua
              - Cập nhật mỗi giờ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Biểu đồ cập nhật theo giờ</p>
                <p className="text-sm text-gray-500">
                  Dữ liệu: {salesChart.data.map(d => `${(d/1000).toFixed(0)}k`).join(', ')}đ
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Cập nhật lần cuối: {currentTime.toLocaleTimeString('vi-VN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sản phẩm bán chạy */}
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
            <CardDescription>Top sản phẩm có doanh số cao nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.sales} bán • {product.revenue.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Chưa có dữ liệu bán hàng</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thống kê sản phẩm */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê kho hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tổng sản phẩm</span>
              <span className="font-semibold">{productStats.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Còn hàng</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {productStats.inStock}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Hết hàng</span>
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                {productStats.outOfStock}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sắp hết</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                {productStats.lowStock}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Đơn hàng gần đây */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-gray-600">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.totalPrice.toLocaleString('vi-VN')}đ</p>
                      <Badge variant="outline" className="text-xs">
                        {order.status === "pending" ? "Chờ xử lý" : 
                         order.status === "processing" ? "Đang xử lý" :
                         order.status === "shipped" ? "Đã giao" : 
                         order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Chưa có đơn hàng</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 