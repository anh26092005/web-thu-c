"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  FileText
} from "lucide-react";
import Link from "next/link";

// Interface cho danh mục blog
interface BlogCategory {
  _id: string;
  title: string;
  description?: string;
  slug: { current: string };
  postCount: number;
  color?: string;
}

// Trang quản lý danh mục blog
export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    color: "#3B82F6"
  });

  // Fetch categories data
  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Mock data vì chưa có API categories
      const mockCategories: BlogCategory[] = [
        {
          _id: "1",
          title: "Sức khỏe",
          description: "Các bài viết về sức khỏe và chăm sóc sức khỏe",
          slug: { current: "suc-khoe" },
          postCount: 12,
          color: "#10B981"
        },
        {
          _id: "2", 
          title: "Dinh dưỡng",
          description: "Thông tin về dinh dưỡng và chế độ ăn uống",
          slug: { current: "dinh-duong" },
          postCount: 8,
          color: "#F59E0B"
        },
        {
          _id: "3",
          title: "Thuốc",
          description: "Hướng dẫn sử dụng thuốc và thông tin y học",
          slug: { current: "thuoc" },
          postCount: 15,
          color: "#EF4444"
        },
        {
          _id: "4",
          title: "Phòng bệnh",
          description: "Các biện pháp phòng ngừa bệnh tật",
          slug: { current: "phong-benh" },
          postCount: 6,
          color: "#8B5CF6"
        }
      ];
      
      setCategories(mockCategories);
    } catch (error) {
      console.error("Lỗi tải danh mục:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Update existing category
        console.log("Updating category:", editingCategory._id, formData);
      } else {
        // Create new category
        console.log("Creating new category:", formData);
      }
      
      // Reset form
      setFormData({ title: "", description: "", color: "#3B82F6" });
      setShowAddDialog(false);
      setEditingCategory(null);
      
      // Refresh data
      fetchCategories();
    } catch (error) {
      console.error("Lỗi lưu danh mục:", error);
    }
  };

  // Handle edit
  const handleEdit = (category: BlogCategory) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      description: category.description || "",
      color: category.color || "#3B82F6"
    });
    setShowAddDialog(true);
  };

  // Handle delete
  const handleDelete = async (categoryId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        console.log("Deleting category:", categoryId);
        fetchCategories();
      } catch (error) {
        console.error("Lỗi xóa danh mục:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh mục Blog</h1>
            <p className="text-gray-600 mt-1">Quản lý danh mục bài viết blog</p>
          </div>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCategory(null);
              setFormData({ title: "", description: "", color: "#3B82F6" });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Cập nhật thông tin danh mục" : "Tạo danh mục mới cho blog"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Tên danh mục</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Nhập tên danh mục..."
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả về danh mục..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Màu sắc</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Hủy
                </Button>
                <Button type="submit">
                  {editingCategory ? "Cập nhật" : "Tạo mới"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng danh mục</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Danh mục đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài viết</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + cat.postCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Bài viết đã phân loại
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TB bài viết/danh mục</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.length > 0 
                ? Math.round(categories.reduce((sum, cat) => sum + cat.postCount, 0) / categories.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Bài viết trung bình
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search và Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Danh sách danh mục</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Danh mục</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Số bài viết</TableHead>
                <TableHead>Màu sắc</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">
                      {category.title}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {category.description || "Không có mô tả"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {category.slug.current}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {category.postCount} bài viết
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-full border"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <code className="text-sm">{category.color}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(category._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? "Không tìm thấy danh mục" : "Chưa có danh mục"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm 
                        ? "Thử tìm kiếm với từ khóa khác" 
                        : "Hãy tạo danh mục đầu tiên cho blog"
                      }
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setShowAddDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm danh mục
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 