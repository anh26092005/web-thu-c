import { BasketIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Đơn hàng",
  type: "document",
  icon: BasketIcon,
  fields: [
    defineField({
      name: "orderNumber",
      title: "Mã đơn hàng",
      type: "string",
      validation: (Rule) => Rule.required().unique(),
    }),
    // User and Customer Info
    defineField({
      name: "clerkUserId",
      title: "Store User ID",
      type: "string",
    }),
    defineField({
      name: "customerName",
      title: "Tên khách hàng",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email khách hàng",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "phone",
      title: "Số điện thoại",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    // Shipping Address
    defineField({
      name: "shippingAddress",
      title: "Địa chỉ giao hàng",
      type: "vietnameseAddress", // Using the new address schema
      validation: (Rule) => Rule.required(),
    }),
    // Products
    defineField({
      name: "products",
      title: "Sản phẩm",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "product",
              title: "Sản phẩm đã mua",
              type: "reference",
              to: [{ type: "product" }],
            }),
            defineField({
              name: "quantity",
              title: "Số lượng",
              type: "number",
            }),
          ],
          preview: {
            select: {
              product: "product.name",
              quantity: "quantity",
              image: "product.image",
            },
            prepare(select) {
              return {
                title: `${select.product} x ${select.quantity}`,
                media: select.image,
              };
            },
          },
        }),
      ],
    }),
    // Pricing and Payment
    defineField({
      name: "totalPrice",
      title: "Tổng tiền",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Đơn vị tiền tệ",
      type: "string",
      initialValue: "VND",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "amountDiscount",
      title: "Số tiền giảm giá",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "paymentMethod",
      title: "Phương thức thanh toán",
      type: "string",
      options: {
        list: [
          { title: "Thanh toán khi nhận hàng (COD)", value: "cod" },
          { title: "Thanh toán qua MoMo", value: "momo" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isPaid",
      title: "Đã thanh toán?",
      type: "boolean",
      initialValue: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Trạng thái đơn hàng",
      type: "string",
      options: {
        list: [
          { title: "Đang chờ xử lý", value: "pending" },
          { title: "Đang xử lý", value: "processing" },
          { title: "Đã giao cho vận chuyển", value: "shipped" },
          { title: "Đang giao hàng", value: "out_for_delivery" },
          { title: "Đã giao thành công", value: "delivered" },
          { title: "Đã hủy", value: "cancelled" },
        ],
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "orderDate",
      title: "Ngày đặt hàng",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      name: "customerName",
      amount: "totalPrice",
      currency: "currency",
      orderId: "orderNumber",
      status: "status",
      isPaid: "isPaid",
    },
    prepare(select) {
      const orderIdSnippet = select.orderId ? `${select.orderId.slice(0, 5)}...${select.orderId.slice(-5)}` : "";
      return {
        title: `${select.name} (${orderIdSnippet})`,
        subtitle: `${select.amount} ${select.currency} - ${select.status} (${select.isPaid ? 'Đã trả' : 'Chưa trả'})`,
        media: BasketIcon,
      };
    },
  },
});
