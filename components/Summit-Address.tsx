// pages/submit-address.tsx (Ví dụ trang để gửi địa chỉ)
import React, { useState } from 'react';
import { client } from '@/sanity/lib/client';
import AddressForm from '../components/AddressForm';
import { SubmittedAddress } from '@/sanity.types'; // Kiểu dữ liệu để gửi lên Sanity

// Đây là ID của một tài liệu Customer có sẵn mà chúng ta sẽ cập nhật
// THAY THẾ BẰNG ID THỰC TẾ CỦA TÀI LIỆU CẦN CẬP NHẬT HOẶC CƠ CHẾ TẠO MỚI
const CUSTOMER_ID_TO_UPDATE = 'your-customer-document-id';

const SubmitAddressPage: React.FC = () => {
  const [selectedAddress, setSelectedAddress] = useState<SubmittedAddress | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const handleAddressChange = (address: SubmittedAddress | null) => {
    // onAddressChange sẽ trả về object { streetAddress, province: {_ref, _type}, ward: {_ref, _type} }
    // hoặc null nếu chưa đầy đủ
    setSelectedAddress(address);
    console.log('Địa chỉ người dùng đã chọn:', address);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Kiểm tra xem tất cả các trường cần thiết đã được chọn/nhập chưa
    if (!selectedAddress || !selectedAddress.streetAddress || !selectedAddress.province._ref || !selectedAddress.ward._ref) {
      setMessage('Vui lòng điền đầy đủ địa chỉ: Số nhà/đường, Tỉnh và Phường/Xã.');
      setLoading(false);
      return;
    }

    try {
      // Đối tượng địa chỉ để gửi lên Sanity, _type là cần thiết cho object
      const addressToSanity = {
        _type: 'vietnameseAddress', // Tên type của object trong Sanity schema
        streetAddress: selectedAddress.streetAddress,
        province: selectedAddress.province, // Gửi reference object
        ward: selectedAddress.ward,       // Gửi reference object
      };

      // Cách 1: Cập nhật một trường địa chỉ trong một tài liệu HIỆN CÓ
      await client
        .patch(CUSTOMER_ID_TO_UPDATE) // ID của tài liệu bạn muốn cập nhật (ví dụ: khách hàng)
        .set({ shippingAddress: addressToSanity }) // Tên trường trong schema của customer
        .commit();

      setMessage('Địa chỉ đã được cập nhật thành công vào Sanity!');
      // Có thể reset form ở đây
      // setSelectedAddress(null);
      // setStreetAddress(""); // Reset trong AddressForm nếu bạn thêm props
    } catch (error) {
      console.error('Lỗi khi gửi địa chỉ lên Sanity:', error);
      setMessage('Đã xảy ra lỗi khi cập nhật địa chỉ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Nhập và Lưu Địa Chỉ</h1>

      <AddressForm onAddressChange={handleAddressChange} />

      <button
        onClick={handleSubmit}
        disabled={loading || !selectedAddress} // Nút disabled nếu đang loading hoặc địa chỉ chưa đầy đủ
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Đang gửi...' : 'Lưu địa chỉ vào Sanity'}
      </button>

      {message && (
        <p className={`mt-4 text-center ${message.includes('thành công') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Dữ liệu địa chỉ sẽ gửi:</h2>
        <pre className="whitespace-pre-wrap break-words text-sm bg-gray-100 p-3 rounded">
          {JSON.stringify(selectedAddress, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default SubmitAddressPage;