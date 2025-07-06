import { MY_ORDERS_QUERYResult } from "@/sanity.types";
import React from "react";
import { X } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import PriceFormatter from "./PriceFormatter";

interface OrderDetailsDialogProps {
  order: MY_ORDERS_QUERYResult[number] | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailDialog: React.FC<OrderDetailsDialogProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  // Cast order để truy cập các thuộc tính không có trong type definition
  const orderData = order as any;

  // Xử lý click vào backdrop để đóng dialog
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Dịch trạng thái sang tiếng Việt
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý", 
      shipped: "Đã giao vận chuyển",
      out_for_delivery: "Đang giao hàng",
      delivered: "Đã giao thành công",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  // Dịch phương thức thanh toán
  const getPaymentMethodText = (method: string) => {
    const methodMap: { [key: string]: string } = {
      cod: "Thanh toán khi nhận hàng",
      vnpay: "Thanh toán qua VNPay",
      momo: "Thanh toán qua MoMo",
    };
    return methodMap[method] || method;
  };

  // Tính tổng tiền sản phẩm
  const calculateSubtotal = () => {
    return order.products?.reduce((total, item) => {
      const price = (item.product as any)?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0) || 0;
  };

  const subtotal = calculateSubtotal();
  const discount = subtotal - (order.totalPrice || 0);

  return (
    <>
      <style jsx>{`
        .invoice-box {
          position: relative;
        }
        .invoice-box::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 0;
          bottom: 0;
          width: 20px;
          background: radial-gradient(circle at 0 10px, transparent, transparent 4px, #fff 5px) repeat-y;
          background-size: 20px 20px;
        }
        .invoice-box::after {
          content: '';
          position: absolute;
          right: -10px;
          top: 0;
          bottom: 0;
          width: 20px;
          background: radial-gradient(circle at 20px 10px, transparent, transparent 4px, #fff 5px) repeat-y;
          background-size: 20px 20px;
        }
      `}</style>
      
      <div 
        className="fixed inset-0 flex items-center justify-center p-4 backdrop-blur-xl transition-all duration-300 ease-in-out drop-shadow-2xl z-50 "
        onClick={handleBackdropClick}
      >
        <div className="invoice-box w-full max-w-4xl rounded-lg bg-white text-gray-800 shadow-2xl overflow-y-auto scrollbar-hide max-h-[calc(100vh-2rem)] overflow-x-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between overflow-hidden w-full rounded-t-lg bg-[#1856de] p-5 text-white">
            <div>
              <h3 className="md:text-2xl text-lg font-bold tracking-wider">HÓA ĐƠN</h3>
              <p className="mt-1 text-xs opacity-80">
                Mã đơn: {order.orderNumber?.slice(0, 20)}...
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="md:text-lg text-sm font-semibold">Khủng Long Châu</p>
                <p className="text-xs opacity-80">khunglongchau.com</p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="relative p-8">
            
            {/* Stamp trạng thái */}
            <div className="absolute md:right-110 md:bottom-39 right-9 bottom-37">
              <div className={`pointer-events-none -rotate-[15deg] rounded-md border-4 px-6 py-2 text-center font-bold uppercase opacity-50 ${
                orderData.isPaid 
                  ? 'border-green-500 text-green-500' 
                  : 'border-red-500 text-red-500'
              }`}>
                <p className="text-l md:text-2xl lg:text-3xl">
                  {orderData.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </p>
                <p className="text-sm">
                  {orderData.isPaid ? 'Paid' : 'Unpaid'}
                </p>
              </div>
            </div>
            
            {/* Thông tin khách hàng và chi tiết đơn hàng */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h4 className="mb-2 font-semibold text-[#113585]">KHÁCH HÀNG:</h4>
                <p className="font-bold">{order.customerName}</p>
                <p>{order.email}</p>
                <p>{orderData.phone}</p>
                <div className="mt-2">
                  <p>
                    {(order.shippingAddress as any)?.streetAddress}, {' '}
                    {(order.shippingAddress as any)?.ward?.name}, {' '}
                    {(order.shippingAddress as any)?.province?.name}
                  </p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <h4 className="mb-2 font-semibold text-[#113585]">CHI TIẾT:</h4>
                <p>
                  <span className="text-gray-500">Ngày đặt:</span>{' '}
                  <strong>
                    {new Date(order.orderDate || '').toLocaleDateString('vi-VN')}
                  </strong>
                </p>
                <p>
                  <span className="text-gray-500">Giao dự kiến:</span>{' '}
                  <strong>
                    {orderData.estimatedDeliveryDate 
                      ? new Date(orderData.estimatedDeliveryDate).toLocaleDateString('vi-VN')
                      : 'Chưa xác định'
                    }
                  </strong>
                </p>
                <p>
                  <span className="text-gray-500">Thanh toán:</span>{' '}
                  <strong>{getPaymentMethodText(orderData.paymentMethod || '')}</strong>
                </p>
                <p>
                  <span className="text-gray-500">Trạng thái:</span>{' '}
                  <strong className={`${
                    order.status === 'delivered' ? 'text-green-600' :
                    order.status === 'cancelled' ? 'text-red-600' :
                    'text-blue-600'
                  }`}>
                    {getStatusText(order.status || '')}
                  </strong>
                </p>
              </div>
            </div>

            {/* Bảng sản phẩm */}
            <div className="mt-10">
              <table className="w-full text-left">
                <thead className="bg-[#eaeffb]">
                  <tr>
                    <th className="p-3 text-sm font-semibold text-[#113585]">Sản phẩm</th>
                    <th className="p-3 text-center text-sm font-semibold text-[#113585]">SL</th>
                    <th className="p-3 text-right text-sm font-semibold text-[#113585]">Đơn giá</th>
                    <th className="p-3 text-right text-sm font-semibold text-[#113585]">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.products?.map((item, index) => {
                    const product = item.product as any;
                    const price = product?.price || 0;
                    const quantity = item.quantity || 0;
                    const total = price * quantity;
                    
                    return (
                      <tr key={index} className="border-b">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {product?.images && (
                              <img
                                src={urlFor(product.images[0]).width(50).height(50).url()}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium line-clamp-2">
                                {product?.name || 'Sản phẩm không xác định'}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {product?.variant}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono">{quantity}</td>
                        <td className="p-3 text-right font-mono">
                          <PriceFormatter amount={price} />
                        </td>
                        <td className="p-3 text-right font-mono font-semibold">
                          <PriceFormatter amount={total} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tổng cộng */}
            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-xs space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạm tính:</span>
                  <span className="font-mono">
                    <PriceFormatter amount={subtotal} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Giảm giá:</span>
                  <span className="font-mono">
                    - <PriceFormatter amount={discount} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phí vận chuyển:</span>
                  <span className="font-mono">
                    <PriceFormatter amount={orderData.shippingFee || 0} />
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-[#1856de]">
                    <span className="text-lg">TỔNG CỘNG</span>
                    <span className="text-xl font-mono">
                      <PriceFormatter amount={order.totalPrice || 0} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ghi chú đơn hàng */}
            {orderData.orderNotes && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-[#113585] mb-2">GHI CHÚ:</h4>
                <p className="text-sm text-gray-700">{orderData.orderNotes}</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailDialog;
