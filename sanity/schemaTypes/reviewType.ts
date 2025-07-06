import { StarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

// Schema cho đánh giá sản phẩm
export const reviewType = defineType({
  name: "review",
  title: "Đánh giá sản phẩm",
  type: "document",
  icon: StarIcon,
  fields: [
    defineField({
      name: "product",
      title: "Sản phẩm",
      type: "reference",
      to: [{ type: "product" }],
      validation: (Rule) => Rule.required(),
      description: "Sản phẩm được đánh giá",
    }),
    defineField({
      name: "customerName",
      title: "Tên khách hàng",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(100),
      description: "Tên người đánh giá",
    }),
    defineField({
      name: "customerEmail",
      title: "Email khách hàng",
      type: "string",
      validation: (Rule) => Rule.required().email(),
      description: "Email của người đánh giá",
    }),
    defineField({
      name: "rating",
      title: "Điểm đánh giá",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(5),
      description: "Điểm đánh giá từ 1 đến 5 sao",
    }),
    defineField({
      name: "title",
      title: "Tiêu đề đánh giá",
      type: "string",
      validation: (Rule) => Rule.required().min(5).max(200),
      description: "Tiêu đề ngắn gọn cho đánh giá",
    }),
    defineField({
      name: "comment",
      title: "Nội dung đánh giá",
      type: "text",
      validation: (Rule) => Rule.required().min(10).max(1000),
      description: "Chi tiết về trải nghiệm sử dụng sản phẩm",
    }),
    defineField({
      name: "verified",
      title: "Đã xác minh mua hàng",
      type: "boolean",
      initialValue: false,
      description: "Khách hàng đã mua sản phẩm này",
    }),
    defineField({
      name: "orderNumber",
      title: "Mã đơn hàng",
      type: "string",
      description: "Mã đơn hàng để xác minh việc mua hàng",
    }),
    defineField({
      name: "isApproved",
      title: "Đã duyệt",
      type: "boolean",
      initialValue: false,
      description: "Đánh giá đã được admin duyệt để hiển thị",
    }),
    defineField({
      name: "isRecommended",
      title: "Có khuyên dùng",
      type: "boolean",
      description: "Khách hàng có khuyên dùng sản phẩm này không",
    }),
    defineField({
      name: "pros",
      title: "Ưu điểm",
      type: "array",
      of: [{ type: "string" }],
      description: "Các ưu điểm của sản phẩm",
    }),
    defineField({
      name: "cons",
      title: "Nhược điểm", 
      type: "array",
      of: [{ type: "string" }],
      description: "Các nhược điểm của sản phẩm",
    }),
    defineField({
      name: "images",
      title: "Hình ảnh đánh giá",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "Hình ảnh sản phẩm do khách hàng chụp",
    }),
    defineField({
      name: "helpfulCount",
      title: "Số lượt hữu ích",
      type: "number",
      initialValue: 0,
      description: "Số người đánh giá review này hữu ích",
    }),
    defineField({
      name: "reviewDate",
      title: "Ngày đánh giá",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().toISOString(),
      description: "Thời gian viết đánh giá",
    }),
    defineField({
      name: "adminResponse",
      title: "Phản hồi từ admin",
      type: "object",
      fields: [
        defineField({
          name: "content",
          title: "Nội dung phản hồi",
          type: "text",
          description: "Phản hồi từ cửa hàng",
        }),
        defineField({
          name: "respondedAt",
          title: "Thời gian phản hồi",
          type: "datetime",
          description: "Thời gian admin phản hồi",
        }),
        defineField({
          name: "respondedBy",
          title: "Người phản hồi",
          type: "string",
          description: "Tên admin đã phản hồi",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      customerName: "customerName",
      rating: "rating",
      title: "title",
      productName: "product.name",
      isApproved: "isApproved",
    },
    prepare(select) {
      const { customerName, rating, title, productName, isApproved } = select;
      const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
      return {
        title: `${stars} ${title}`,
        subtitle: `${customerName} - ${productName} ${isApproved ? "✅" : "⏳"}`,
      };
    },
  },
  orderings: [
    {
      title: "Mới nhất",
      name: "reviewDateDesc",
      by: [{ field: "reviewDate", direction: "desc" }],
    },
    {
      title: "Rating cao nhất",
      name: "ratingDesc", 
      by: [{ field: "rating", direction: "desc" }],
    },
    {
      title: "Rating thấp nhất",
      name: "ratingAsc",
      by: [{ field: "rating", direction: "asc" }],
    },
    {
      title: "Hữu ích nhất",
      name: "helpfulDesc",
      by: [{ field: "helpfulCount", direction: "desc" }],
    },
  ],
}); 