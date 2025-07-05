import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import PriceFormatter from "./PriceFormatter";

interface ExtendedOrder {
  _id: string;
  _type: "order";
  _createdAt: string;
  _updatedAt: string;
  _rev: string;
  orderNumber?: string;
  invoice?: {
    id?: string;
    number?: string;
    hosted_invoice_url?: string;
  };
  stripeCheckoutSessionId?: string;
  stripeCustomerId?: string;
  clerkUserId?: string;
  customerName?: string;
  email?: string;
  stripePaymentIntentId?: string;
  products: Array<{
    product: {
      _id: string;
      _type: "product";
      _createdAt: string;
      _updatedAt: string;
      _rev: string;
      name?: string;
      slug?: any;
      images?: Array<{
        asset?: {
          _ref: string;
          _type: "reference";
          _weak?: boolean;
        };
        hotspot?: any;
        crop?: any;
        _type: "image";
        _key: string;
      }>;
      description?: string;
      price?: number;
      discount?: number;
      categories?: Array<{
        _ref: string;
        _type: "reference";
        _weak?: boolean;
        _key: string;
      }>;
      stock?: number;
      brand?: {
        _ref: string;
        _type: "reference";
        _weak?: boolean;
      };
      status?: "hot" | "new" | "sale";
      variant?: "thuc-pham-chuc-nang" | "gadget" | "others" | "refrigerators";
      isFeatured?: boolean;
    } | null;
    quantity?: number;
    _key: string;
  }> | null;
  totalPrice?: number;
  currency?: string;
  amountDiscount?: number;
  address?: {
    state?: string;
    zip?: string;
    city?: string;
    address?: string;
    name?: string;
  };
  status?: "cancelled" | "delivered" | "out_for_delivery" | "paid" | "pending" | "processing" | "shipped";
  orderDate?: string;
  phone?: string;
  estimatedDeliveryDate?: string;
  paymentMethod?: string;
  isPaid?: boolean;
  orderNotes?: string;
  shippingAddress?: {
    streetAddress?: string;
    ward?: { name?: string };
    province?: { name?: string };
  };
  vnpayResponse?: any;
}

interface OrderDetailsDialogProps {
  order: ExtendedOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!order) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Order Details - {order?.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p>
            <strong>Khách hàng:</strong> {order.customerName}
          </p>
          <p>
            <strong>Email:</strong> {order.email}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {order.phone}
          </p>
          <p>
            <strong>Ngày đặt hàng:</strong>{" "}
            {order.orderDate && new Date(order.orderDate).toLocaleDateString("vi-VN")}
          </p>
          {order.estimatedDeliveryDate && (
            <p>
              <strong>Thời gian giao hàng dự kiến:</strong>{" "}
              {new Date(order.estimatedDeliveryDate).toLocaleDateString("vi-VN")}
            </p>
          )}
          <p>
            <strong>Phương thức thanh toán:</strong>{" "}
            <span className="capitalize font-medium">
              {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 
               order.paymentMethod === 'vnpay' ? 'VNPay' : 
               order.paymentMethod === 'momo' ? 'MoMo' : order.paymentMethod}
            </span>
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            <span className="capitalize text-green-600 font-medium">
              {order.status === 'pending' ? 'Đang chờ xử lý' :
               order.status === 'processing' ? 'Đang xử lý' :
               order.status === 'shipped' ? 'Đã giao cho vận chuyển' :
               order.status === 'out_for_delivery' ? 'Đang giao hàng' :
               order.status === 'delivered' ? 'Đã giao thành công' :
               order.status === 'cancelled' ? 'Đã hủy' : order.status}
            </span>
          </p>
          <p>
            <strong>Trạng thái thanh toán:</strong>{" "}
            <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
              {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </span>
          </p>
          {order.orderNotes && (
            <div className="mt-3">
              <strong>Ghi chú đơn hàng:</strong>
              <p className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                {order.orderNotes}
              </p>
            </div>
          )}
          {order.shippingAddress && (
            <div className="mt-3">
              <strong>Địa chỉ giao hàng:</strong>
              <p className="mt-1 text-sm">
                {order.shippingAddress.streetAddress}, {order.shippingAddress.ward?.name}, {order.shippingAddress.province?.name}
              </p>
            </div>
          )}
          <p>
            <strong>Mã hóa đơn:</strong> {order?.invoice?.number || 'Chưa có'}
          </p>
          {order?.invoice && (
            <Button className="bg-transparent border text-darkColor/80 mt-2 hover:text-darkColor hover:border-darkColor hover:bg-darkColor/10 hoverEffect ">
              {order?.invoice?.hosted_invoice_url && (
                <Link href={order?.invoice?.hosted_invoice_url} target="_blank">
                  Tải hóa đơn
                </Link>
              )}
            </Button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.products?.map((product, index) => (
              <TableRow key={index}>
                <TableCell className="flex items-center gap-2">
                  {product?.product?.images && (
                    <Image
                      src={urlFor(product?.product?.images[0]).url()}
                      alt="productImage"
                      width={50}
                      height={50}
                      className="border rounded-sm"
                    />
                  )}

                  {product?.product && product?.product?.name}
                </TableCell>
                <TableCell>{product?.quantity}</TableCell>
                <TableCell>
                  <PriceFormatter
                    amount={product?.product?.price}
                    className="text-black font-medium"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 text-right flex items-center justify-end">
          <div className="w-44 flex flex-col gap-1">
            {order?.amountDiscount !== 0 && (
              <div className="w-full flex items-center justify-between">
                <strong>Discount: </strong>
                <PriceFormatter
                  amount={order?.amountDiscount}
                  className="text-black font-bold"
                />
              </div>
            )}
            {order?.amountDiscount !== 0 && (
              <div className="w-full flex items-center justify-between">
                <strong>Subtotal: </strong>
                <PriceFormatter
                  amount={
                    (order?.totalPrice as number) +
                    (order?.amountDiscount as number)
                  }
                  className="text-black font-bold"
                />
              </div>
            )}
            <div className="w-full flex items-center justify-between">
              <strong>Total: </strong>
              <PriceFormatter
                amount={order?.totalPrice}
                className="text-black font-bold"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { OrderDetailDialog };