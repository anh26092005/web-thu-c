"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ShoppingCart, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  Package,
  DollarSign,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText
} from "lucide-react";
import Image from "next/image";

// Interfaces cho order data
interface OrderProduct {
  product: {
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  province: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  totalPrice: number;
  amountDiscount?: number;
  shippingFee?: number;
  status: string;
  paymentMethod: string;
  isPaid: boolean;
  orderDate: string;
  estimatedDeliveryDate?: string;
  products: OrderProduct[];
  shippingAddress: ShippingAddress;
  orderNotes?: string;
}

interface OrderStats {
  total: number;
  totalRevenue: number;
  statusCounts: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

interface OrdersData {
  orders: Order[];
  stats: OrderStats;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Trang quản lý đơn hàng
export default function AdminOrdersPage() {
  const [ordersData, setOrdersData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch orders data từ Sanity
  const fetchOrders = async (page: number = 1, search: string = "", status: string = "all") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setOrdersData(result.data);
      } else {
        console.error("Lỗi API:", result.error);
      }
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders(1, searchTerm, filterStatus);
  }, [searchTerm, filterStatus]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders(1, searchTerm, filterStatus);
  };

  // Handle filter change
  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchOrders(1, searchTerm, status);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page, searchTerm, filterStatus);
  };

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdateLoading(orderId);
      
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh data
        fetchOrders(currentPage, searchTerm, filterStatus);
      } else {
        console.error("Lỗi cập nhật đơn hàng:", result.error);
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    } finally {
      setUpdateLoading(null);
    }
  };

  // Get status badge với icon và màu sắc
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 gap-1">
            <Clock className="h-3 w-3" />
            Chờ xử lý
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800 gap-1">
            <Package className="h-3 w-3" />
            Đang xử lý
          </Badge>
        );
      case "shipped":
        return (
          <Badge variant="default" className="bg-purple-100 text-purple-800 gap-1">
            <Truck className="h-3 w-3" />
            Đang giao
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 gap-1">
            <CheckCircle className="h-3 w-3" />
            Đã giao
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get next status for workflow
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "processing";
      case "processing":
        return "shipped";
      case "shipped":
        return "delivered";
      default:
        return null;
    }
  };

  // Get payment method badge
  const getPaymentBadge = (method: string, isPaid: boolean) => {
    const paymentText = method === "cod" ? "COD" : 
                       method === "banking" ? "Chuyển khoản" :
                       method === "momo" ? "MoMo" :
                       method === "vnpay" ? "VNPay" : method;
    
    return (
      <div className="flex items-center gap-2">
        <Badge variant={isPaid ? "default" : "secondary"} className="gap-1">
          <CreditCard className="h-3 w-3" />
          {paymentText}
        </Badge>
        {isPaid && (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Đã thanh toán
          </Badge>
        )}
      </div>
    );
  };

  if (loading && !ordersData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = ordersData?.stats || { 
    total: 0, 
    totalRevenue: 0, 
    statusCounts: { pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 } 
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Đơn hàng</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả đơn hàng từ khách hàng</p>
        </div>
        
        {stats.statusCounts.pending > 0 && (
          <Badge variant="destructive" className="gap-1">
            <Clock className="h-3 w-3" />
            {stats.statusCounts.pending} đơn chờ xử lý
          </Badge>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng đơn</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.statusCounts.pending}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-blue-600">{stats.statusCounts.processing}</p>
              </div>
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Đang giao</p>
                <p className="text-2xl font-bold text-purple-600">{stats.statusCounts.shipped}</p>
              </div>
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{stats.statusCounts.delivered}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                <p className="text-lg font-bold text-green-600">{stats.totalRevenue.toLocaleString()}đ</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters và Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo mã đơn, tên khách hàng, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              Tìm kiếm
            </Button>

            {/* Quick filters */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => handleFilterChange("all")}
                size="sm"
                disabled={loading}
              >
                Tất cả
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => handleFilterChange("pending")}
                size="sm"
                disabled={loading}
                className="gap-1"
              >
                <Clock className="h-3 w-3" />
                Chờ xử lý
              </Button>
              <Button
                variant={filterStatus === "processing" ? "default" : "outline"}
                onClick={() => handleFilterChange("processing")}
                size="sm"
                disabled={loading}
                className="gap-1"
              >
                <Package className="h-3 w-3" />
                Đang xử lý
              </Button>
              <Button
                variant={filterStatus === "shipped" ? "default" : "outline"}
                onClick={() => handleFilterChange("shipped")}
                size="sm"
                disabled={loading}
                className="gap-1"
              >
                <Truck className="h-3 w-3" />
                Đang giao
              </Button>
              <Button
                variant={filterStatus === "delivered" ? "default" : "outline"}
                onClick={() => handleFilterChange("delivered")}
                size="sm"
                disabled={loading}
                className="gap-1"
              >
                <CheckCircle className="h-3 w-3" />
                Hoàn thành
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders list */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse h-40 bg-gray-200 rounded-lg"></div>
          ))
        ) : (
          ordersData?.orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {order.totalPrice.toLocaleString()}đ
                    </p>
                    {getPaymentBadge(order.paymentMethod, order.isPaid)}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Thông tin khách hàng
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span>{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{order.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{order.phone}</span>
                      </div>
                      {order.shippingAddress && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                          <span>
                            {order.shippingAddress.address}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Products preview */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Sản phẩm ({order.products.length})
                    </h4>
                    <div className="space-y-2">
                      {order.products.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                            {item.product.image ? (
                              <Image
                                src={item.product.image}
                                alt={item.product.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-gray-500">
                              {item.quantity} x {item.product.price.toLocaleString()}đ
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.products.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{order.products.length - 2} sản phẩm khác
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order notes */}
                {order.orderNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Ghi chú:</span>
                    </div>
                    <p className="text-sm text-gray-600">{order.orderNotes}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    {order.estimatedDeliveryDate && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-3 w-3" />
                        Dự kiến: {new Date(order.estimatedDeliveryDate).toLocaleDateString('vi-VN')}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getNextStatus(order.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(order._id, getNextStatus(order.status)!)}
                        disabled={updateLoading === order._id}
                        className="gap-1"
                      >
                        {updateLoading === order._id ? (
                          "Đang cập nhật..."
                        ) : (
                          <>
                            {getNextStatus(order.status) === "processing" && <Package className="h-3 w-3" />}
                            {getNextStatus(order.status) === "shipped" && <Truck className="h-3 w-3" />}
                            {getNextStatus(order.status) === "delivered" && <CheckCircle className="h-3 w-3" />}
                            {getNextStatus(order.status) === "processing" && "Xử lý"}
                            {getNextStatus(order.status) === "shipped" && "Giao hàng"}
                            {getNextStatus(order.status) === "delivered" && "Hoàn thành"}
                          </>
                        )}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {ordersData && ordersData.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Trang {ordersData.pagination.currentPage} / {ordersData.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!ordersData.pagination.hasPrevPage || loading}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!ordersData.pagination.hasNextPage || loading}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {ordersData?.orders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đơn hàng</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Không tìm thấy đơn hàng phù hợp." : "Chưa có đơn hàng nào từ khách hàng."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 