"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useStore from '@/store';
import Container from '@/components/Container';
import toast from 'react-hot-toast';

const VnpayReturnPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetCart } = useStore();

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');

    if (responseCode === '00') {
      toast.success('Thanh toán thành công! Đơn hàng của bạn đang được xử lý.');
      resetCart();

      // Lấy dữ liệu đơn hàng tạm thời từ localStorage
      const pendingOrderDataString = localStorage.getItem('vnpayPendingOrder');
      let pendingOrderData = null;
      if (pendingOrderDataString) {
        try {
          pendingOrderData = JSON.parse(pendingOrderDataString);
        } catch (e) {
          console.error('Error parsing pending order data from localStorage:', e);
        }
      }

      // Gửi tất cả các tham số VNPay và dữ liệu đơn hàng tạm thời về API để tạo đơn hàng
      const vnpayReturnParams = Object.fromEntries(searchParams.entries());

      fetch('/api/vnpay/create-order-from-return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vnpayParams: vnpayReturnParams,
          pendingOrderData: pendingOrderData, // Gửi dữ liệu từ localStorage
        }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('Order creation API call successful:', data.message);
          // Xóa dữ liệu tạm thời sau khi đơn hàng được xử lý
          localStorage.removeItem('vnpayPendingOrder');
        } else {
          console.error('Order creation API call failed:', data.message);
          toast.error('Có lỗi xảy ra khi tạo đơn hàng.');
        }
      })
      .catch(error => {
        console.error('Error calling order creation API:', error);
        toast.error('Lỗi kết nối đến server để tạo đơn hàng.');
      });

    } else {
      toast.error('Thanh toán không thành công hoặc đã bị hủy.');
    }

    setTimeout(() => {
      router.push('/orders');
    }, 3000);

  }, [searchParams, router, resetCart]);

  return (
    <Container className="flex items-center justify-center py-20">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Đang xử lý thanh toán VNPAY...</h1>
        <p>Vui lòng chờ trong giây lát. Bạn sẽ được chuyển hướng ngay sau đây.</p>
      </div>
    </Container>
  );
};

export default VnpayReturnPage; 