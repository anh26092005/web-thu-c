"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReviewStars from "./ReviewStars";
import { Plus, X } from "lucide-react";

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSubmit: (reviewData: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

// Component form viết đánh giá
const ReviewForm = ({
  productId,
  productName,
  onSubmit,
  onCancel,
  loading = false,
}: ReviewFormProps) => {
  
  // State cho form
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    rating: 0,
    title: "",
    comment: "",
    orderNumber: "",
    isRecommended: false,
    pros: [] as string[],
    cons: [] as string[],
  });

  // State cho pros/cons input
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");

  // Validation form
  const isFormValid = () => {
    return (
      formData.customerName.trim() &&
      formData.customerEmail.trim() &&
      formData.rating > 0 &&
      formData.title.trim() &&
      formData.comment.trim()
    );
  };

  // Xử lý submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    onSubmit({
      productId,
      ...formData,
    });
  };

  // Thêm điểm mạnh
  const addPro = () => {
    if (newPro.trim() && !formData.pros.includes(newPro.trim())) {
      setFormData(prev => ({
        ...prev,
        pros: [...prev.pros, newPro.trim()],
      }));
      setNewPro("");
    }
  };

  // Xóa điểm mạnh
  const removePro = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index),
    }));
  };

  // Thêm điểm yếu
  const addCon = () => {
    if (newCon.trim() && !formData.cons.includes(newCon.trim())) {
      setFormData(prev => ({
        ...prev,
        cons: [...prev.cons, newCon.trim()],
      }));
      setNewCon("");
    }
  };

  // Xóa điểm yếu
  const removeCon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index),
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Viết đánh giá cho: {productName}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Chia sẻ trải nghiệm của bạn để giúp những người mua khác
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cá nhân */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">
                Họ tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Nhập họ tên của bạn"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Số đơn hàng */}
          <div className="space-y-2">
            <Label htmlFor="orderNumber">
              Số đơn hàng (tùy chọn)
            </Label>
            <Input
              id="orderNumber"
              value={formData.orderNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
              placeholder="Nhập số đơn hàng để xác minh"
            />
            <p className="text-xs text-gray-500">
              Nhập số đơn hàng để được đánh dấu "Đã mua hàng"
            </p>
          </div>

          {/* Đánh giá sao */}
          <div className="space-y-2">
            <Label>
              Đánh giá <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <ReviewStars
                rating={formData.rating}
                interactive
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                size="lg"
              />
              <span className="text-sm text-gray-600">
                {formData.rating > 0 ? `${formData.rating}/5 sao` : "Chọn số sao"}
              </span>
            </div>
          </div>

          {/* Tiêu đề đánh giá */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Tiêu đề đánh giá <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Tóm tắt ngắn gọn về trải nghiệm của bạn"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">
              {formData.title.length}/100 ký tự
            </p>
          </div>

          {/* Nội dung đánh giá */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Nội dung đánh giá <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Chia sẻ chi tiết về trải nghiệm sử dụng sản phẩm..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">
              {formData.comment.length}/1000 ký tự
            </p>
          </div>

          {/* Điểm mạnh */}
          <div className="space-y-2">
            <Label>Điểm mạnh của sản phẩm</Label>
            <div className="flex gap-2">
              <Input
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                placeholder="Nhập điểm mạnh..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPro())}
              />
              <Button type="button" size="sm" onClick={addPro}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.pros.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.pros.map((pro, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {pro}
                    <button
                      type="button"
                      onClick={() => removePro(index)}
                      className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Điểm yếu */}
          <div className="space-y-2">
            <Label>Điểm yếu của sản phẩm</Label>
            <div className="flex gap-2">
              <Input
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                placeholder="Nhập điểm yếu..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCon())}
              />
              <Button type="button" size="sm" onClick={addCon}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.cons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.cons.map((con, index) => (
                  <Badge key={index} variant="secondary" className="bg-red-100 text-red-800">
                    {con}
                    <button
                      type="button"
                      onClick={() => removeCon(index)}
                      className="ml-1 hover:bg-red-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Có khuyên dùng không */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRecommended"
              checked={formData.isRecommended}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isRecommended: !!checked }))
              }
            />
            <Label htmlFor="isRecommended">
              Tôi sẽ khuyên bạn bè mua sản phẩm này
            </Label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="submit"
              disabled={!isFormValid() || loading}
              className="flex-1"
            >
              {loading ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Hủy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm; 