import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const couponType = defineType({
  name: "coupon",
  title: "Mã giảm giá",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "code",
      title: "Mã giảm giá",
      type: "string",
      validation: (Rule) => Rule.required().min(3).max(20),
      description: "Mã giảm giá mà khách hàng sẽ nhập (VD: GIAM10, FREESHIP)",
    }),
    defineField({
      name: "name",
      title: "Tên mã giảm giá",
      type: "string",
      validation: (Rule) => Rule.required(),
      description: "Tên mô tả cho mã giảm giá",
    }),
    defineField({
      name: "description",
      title: "Mô tả",
      type: "text",
      description: "Mô tả chi tiết về mã giảm giá",
    }),
    defineField({
      name: "discountType",
      title: "Loại giảm giá",
      type: "string",
      options: {
        list: [
          { title: "Giảm theo phần trăm", value: "percentage" },
          { title: "Giảm theo số tiền cố định", value: "fixed_amount" },
          { title: "Miễn phí vận chuyển", value: "free_shipping" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "discountValue",
      title: "Giá trị giảm",
      type: "number",
      validation: (Rule) => 
        Rule.custom((value, context: any) => {
          const discountType = context.parent?.discountType;
          if (discountType === "free_shipping") {
            return true; // Không cần giá trị cho free shipping
          }
          if (!value || value <= 0) {
            return "Giá trị giảm phải lớn hơn 0";
          }
          if (discountType === "percentage" && value > 100) {
            return "Giá trị giảm theo phần trăm không được vượt quá 100%";
          }
          return true;
        }),
      description: "Giá trị giảm giá (% hoặc số tiền VND)",
    }),
    defineField({
      name: "maxDiscountAmount",
      title: "Số tiền giảm tối đa",
      type: "number",
      description: "Áp dụng cho giảm theo phần trăm - số tiền giảm tối đa (VND)",
      hidden: ({ parent }: any) => parent?.discountType !== "percentage",
    }),
    defineField({
      name: "minOrderAmount",
      title: "Giá trị đơn hàng tối thiểu",
      type: "number",
      description: "Giá trị đơn hàng tối thiểu để áp dụng mã giảm giá (VND)",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "usageLimit",
      title: "Giới hạn sử dụng",
      type: "number",
      description: "Số lần tối đa mã giảm giá có thể được sử dụng (để trống = không giới hạn)",
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "usageCount",
      title: "Số lần đã sử dụng",
      type: "number",
      initialValue: 0,
      readOnly: true,
      description: "Số lần mã giảm giá đã được sử dụng",
    }),
    defineField({
      name: "userLimit",
      title: "Giới hạn cho mỗi người dùng",
      type: "number",
      description: "Số lần tối đa một người dùng có thể sử dụng mã này (để trống = không giới hạn)",
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: "startDate",
      title: "Ngày bắt đầu",
      type: "datetime",
      validation: (Rule) => Rule.required(),
      description: "Ngày bắt đầu có hiệu lực",
    }),
    defineField({
      name: "endDate",
      title: "Ngày kết thúc",
      type: "datetime",
      validation: (Rule) => 
        Rule.custom((endDate, context: any) => {
          const startDate = context.parent?.startDate;
          if (!endDate) return true; // Có thể để trống = không giới hạn thời gian
          if (startDate && new Date(endDate) <= new Date(startDate)) {
            return "Ngày kết thúc phải sau ngày bắt đầu";
          }
          return true;
        }),
      description: "Ngày kết thúc hiệu lực (để trống = không giới hạn)",
    }),
    defineField({
      name: "isActive",
      title: "Đang hoạt động",
      type: "boolean",
      initialValue: true,
      description: "Bật/tắt mã giảm giá",
    }),
    defineField({
      name: "applicableCategories",
      title: "Áp dụng cho danh mục",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "category" }],
        },
      ],
      description: "Chỉ áp dụng cho sản phẩm thuộc các danh mục này (để trống = áp dụng tất cả)",
    }),
    defineField({
      name: "applicableProducts",
      title: "Áp dụng cho sản phẩm",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }],
        },
      ],
      description: "Chỉ áp dụng cho các sản phẩm cụ thể (để trống = áp dụng tất cả)",
    }),
    defineField({
      name: "excludedProducts",
      title: "Loại trừ sản phẩm",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "product" }],
        },
      ],
      description: "Không áp dụng cho các sản phẩm này",
    }),
  ],
  preview: {
    select: {
      title: "code",
      subtitle: "name",
      discountType: "discountType",
      discountValue: "discountValue",
      isActive: "isActive",
    },
    prepare(select) {
      const { title, subtitle, discountType, discountValue, isActive } = select;
      let discountText = "";
      
      if (discountType === "percentage") {
        discountText = `${discountValue}%`;
      } else if (discountType === "fixed_amount") {
        discountText = `${discountValue?.toLocaleString()}đ`;
      } else if (discountType === "free_shipping") {
        discountText = "Miễn phí ship";
      }
      
      return {
        title: `${title} - ${discountText}`,
        subtitle: `${subtitle} ${isActive ? "✅" : "❌"}`,
      };
    },
  },
  orderings: [
    {
      title: "Ngày tạo mới nhất",
      name: "createdAtDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
    {
      title: "Mã giảm giá A-Z",
      name: "codeAsc",
      by: [{ field: "code", direction: "asc" }],
    },
  ],
}); 