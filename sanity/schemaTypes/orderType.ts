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
      validation: (Rule) => Rule.required(),
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
    // Additional customer info
    defineField({
      name: "orderNotes",
      title: "Ghi chú đơn hàng",
      type: "text",
      description: "Ghi chú đặc biệt từ khách hàng về đơn hàng",
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
      name: "shippingFee",
      title: "Phí vận chuyển",
      type: "number",
      initialValue: 0,
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "estimatedDeliveryDate",
      title: "Thời gian giao hàng dự kiến",
      type: "datetime",
      description: "Thời gian dự kiến giao hàng đến khách hàng",
    }),
    defineField({
      name: "paymentMethod",
      title: "Phương thức thanh toán",
      type: "string",
      options: {
        list: [
          { title: "Thanh toán khi nhận hàng (COD)", value: "cod" },
          { title: "Thanh toán qua MoMo", value: "momo" },
          { title: "Thanh toán qua VNPay", value: "vnpay" },
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
    // VNPay response data
    defineField({
      name: "vnpayResponse",
      title: "Dữ liệu phản hồi VNPay",
      type: "object",
      description: "Dữ liệu trả về từ VNPay sau khi thanh toán",
      fields: [
        {
          name: "vnp_Amount",
          title: "Số tiền",
          type: "string",
        },
        {
          name: "vnp_BankCode",
          title: "Mã ngân hàng",
          type: "string",
        },
        {
          name: "vnp_ResponseCode",
          title: "Mã phản hồi",
          type: "string",
        },
        {
          name: "vnp_TxnRef",
          title: "Mã giao dịch",
          type: "string",
        },
        {
          name: "vnp_TransactionNo",
          title: "Số giao dịch VNPay",
          type: "string",
        },
        {
          name: "vnp_PayDate",
          title: "Thời gian thanh toán",
          type: "string",
        },
      ],
      options: {
        collapsible: true,
        collapsed: true,
      },
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
