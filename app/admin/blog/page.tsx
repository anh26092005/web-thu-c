"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  Tag,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Interface cho dữ liệu blog
interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  mainImage?: {
    asset: {
      url: string;
    };
  };
  excerpt?: string;
  author?: {
    name: string;
    image?: any;
  };
  blogcategories?: Array<{
    title: string;
  }>;
  isLatest: boolean;
  views?: number;
}

interface BlogData {
  posts: BlogPost[];
  stats: {
    total: number;
    published: number;
    draft: number;
    thisMonth: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Trang quản lý blog
export default function AdminBlogPage() {
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch blog data từ API
  const fetchBlogs = async (page: number = 1, search: string = "", status: string = "all") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status
      });

      const response = await fetch(`/api/admin/blog?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setBlogData(result.data);
      } else {
        console.error("Lỗi API:", result.error);
      }
    } catch (error) {
      console.error("Lỗi tải bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBlogs(1, searchTerm, filterStatus);
  }, [searchTerm, filterStatus]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchBlogs(1, searchTerm, filterStatus);
  };

  // Handle filter change
  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    setCurrentPage(1);
    fetchBlogs(1, searchTerm, status);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchBlogs(page, searchTerm, filterStatus);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không thể tải dữ liệu blog</p>
      </div>
    );
  }

  const { posts, stats, pagination } = blogData;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Blog</h1>
          <p className="text-gray-600 mt-1">Quản lý bài viết, danh mục và thẻ blog</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/blog/categories">
            <Button variant="outline">
              <Tag className="h-4 w-4 mr-2" />
              Danh mục
            </Button>
          </Link>
          <Link href="/studio/structure/blog">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm bài viết
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả bài viết
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <p className="text-xs text-muted-foreground">
              Bài viết công khai
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">
              Chưa xuất bản
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tháng này</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Bài viết mới
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search và Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách bài viết</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="featured">Nổi bật</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>

          {/* Blog posts table */}
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {post.mainImage ? (
                      <Image
                        src={post.mainImage.asset.url}
                        alt={post.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{post.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {post.excerpt || "Không có mô tả"}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                          </div>
                          {post.author && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {post.author.name}
                            </div>
                          )}
                          {post.views && (
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views} lượt xem
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions và badges */}
                      <div className="flex items-center gap-2 ml-4">
                        {post.isLatest && (
                          <Badge variant="secondary">Nổi bật</Badge>
                        )}
                        {post.blogcategories?.map((cat, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cat.title}
                          </Badge>
                        ))}
                        <div className="flex gap-1">
                          <Link href={`/blog/${post.slug.current}`} target="_blank">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/studio/structure/blog;${post._id}`}>
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết</h3>
                <p className="text-gray-600 mb-4">Hãy tạo bài viết đầu tiên cho blog</p>
                <Link href="/studio/structure/blog">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm bài viết
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Pagination */}
          {posts.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 