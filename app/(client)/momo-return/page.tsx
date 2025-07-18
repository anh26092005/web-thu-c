"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useStore from '@/store';
import Container from '@/components/Container';
import toast from 'react-hot-toast';

// Component con để xử lý logic với useSearchParams
const MomoReturnContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetCart } = useStore();

  useEffect(() => {
    const resultCode = searchParams.get('resultCode');

    if (resultCode === '0') {
      toast.success('Thanh toán thành công! Đơn hàng của bạn đang được xử lý.');
      resetCart();
    } else {
      toast.error('Thanh toán không thành công hoặc đã bị hủy.');
    }

    // Redirect to the orders page after a short delay
    setTimeout(() => {
      router.push('/orders');
    }, 3000);

  }, [searchParams, router, resetCart]);

  return (
    <Container className="flex items-center justify-center py-20">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Đang xử lý thanh toán MoMo...</h1>
        <p>Vui lòng chờ trong giây lát. Bạn sẽ được chuyển hướng ngay sau đây.</p>
      </div>
    </Container>
  );
};

// Component loading fallback
const MomoReturnLoading = () => (
  <Container className="flex items-center justify-center py-20">
    <div className="text-center">
      <h1 className="text-2xl font-bold">Đang tải...</h1>
      <p>Vui lòng chờ trong giây lát.</p>
    </div>
  </Container>
);

// Component chính được wrap trong Suspense
const MomoReturnPage = () => {
  return (
    <Suspense fallback={<MomoReturnLoading />}>
      <MomoReturnContent />
    </Suspense>
  );
};

export default MomoReturnPage;