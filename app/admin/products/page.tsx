"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Package 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  discount?: number;
  status: string;
  stock: number;
  variant: string;
  isFeatured: boolean;
  images?: string;
  categories: string[];
  brand?: string;
  _createdAt: string;
  _updatedAt: string;
}

interface ProductsData {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Trang quản lý sản phẩm
export default function AdminProductsPage() {
  const [productsData, setProductsData] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products data từ Sanity
  const fetchProducts = async (page: number = 1, search: string = "", status: string = "all") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status
      });

      const response = await fetch(`/api/admin/products?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setProductsData(result.data);
      } else {
        console.error("Lỗi API:", result.error);
      }
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchProducts(1, searchTerm, filterStatus);
  }, [searchTerm, filterStatus]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts(1, searchTerm, filterStatus);
  };

  // Handle filter change
  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchProducts(1, searchTerm, status);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page, searchTerm, filterStatus);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="default" className="bg-green-100 text-green-800">Mới</Badge>;
      case "hot":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Hot</Badge>;
      case "sale":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Sale</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get stock badge
  const getStockBadge = (stock: number) => {
    if (stock > 10) {
      return <Badge variant="default" className="bg-green-100 text-green-800">{stock} sản phẩm</Badge>;
    } else if (stock > 0) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{stock} sản phẩm</Badge>;
    } else {
      return <Badge variant="destructive">Hết hàng</Badge>;
    }
  };

  if (loading && !productsData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sản phẩm</h1>
          <p className="text-gray-600 mt-1">Quản lý danh sách sản phẩm</p>
        </div>
        
        <Link href="/admin/products/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Button>
        </Link>
      </div>

      {/* Filters và search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm sản phẩm..."
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

            {/* Status filter */}
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => handleFilterChange("all")}
                size="sm"
                disabled={loading}
              >
                Tất cả
              </Button>
              <Button
                variant={filterStatus === "new" ? "default" : "outline"}
                onClick={() => handleFilterChange("new")}
                size="sm"
                disabled={loading}
              >
                Mới
              </Button>
              <Button
                variant={filterStatus === "hot" ? "default" : "outline"}
                onClick={() => handleFilterChange("hot")}
                size="sm"
                disabled={loading}
              >
                Hot
              </Button>
              <Button
                variant={filterStatus === "sale" ? "default" : "outline"}
                onClick={() => handleFilterChange("sale")}
                size="sm"
                disabled={loading}
              >
                Sale
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Danh sách sản phẩm ({productsData?.pagination.totalProducts || 0})
          </CardTitle>
          <CardDescription>
            Quản lý tất cả sản phẩm trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-4 font-medium text-gray-900">Sản phẩm</th>
                    <th className="text-left p-4 font-medium text-gray-900">Trạng thái</th>
                    <th className="text-left p-4 font-medium text-gray-900">Giá</th>
                    <th className="text-left p-4 font-medium text-gray-900">Kho</th>
                    <th className="text-left p-4 font-medium text-gray-900">Danh mục</th>
                    <th className="text-right p-4 font-medium text-gray-900">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {productsData?.products.map((product) => (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {product.images ? (
                              <Image
                                src={product.images}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-500">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="p-4">
                        <div>
                          {product.discount && product.discount > 0 ? (
                            <div>
                              <p className="font-medium text-red-600">
                                {(product.price - product.discount).toLocaleString()}đ
                              </p>
                              <p className="text-sm text-gray-500 line-through">
                                {product.price.toLocaleString()}đ
                              </p>
                            </div>
                          ) : (
                            <p className="font-medium text-gray-900">
                              {product.price.toLocaleString()}đ
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStockBadge(product.stock)}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {product.categories?.map((category, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/product/${product.slug.current}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/products/${product._id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {productsData && productsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600">
                Trang {productsData.pagination.currentPage} / {productsData.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!productsData.pagination.hasPrevPage || loading}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!productsData.pagination.hasNextPage || loading}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}

          {productsData?.products.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sản phẩm</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? "Không tìm thấy sản phẩm phù hợp." : "Bắt đầu bằng cách tạo sản phẩm mới."}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Link href="/admin/products/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm sản phẩm
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 