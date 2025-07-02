// components/AddressForm.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { client } from '@/sanity/lib/client'; // Đảm bảo đường dẫn đúng
import { ProvinceData, WardData, SubmittedAddress, InitialSelectedAddress } from '@/sanity.types';

interface AddressFormProps {
  onAddressChange: (address: SubmittedAddress | null) => void; // Có thể trả về null nếu chưa đủ
  initialAddress?: InitialSelectedAddress;
}

const AddressForm: React.FC<AddressFormProps> = ({ onAddressChange, initialAddress }) => {
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [wards, setWards] = useState<WardData[]>([]);

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(initialAddress?.province?._id || '');
  const [selectedWardId, setSelectedWardId] = useState<string>(initialAddress?.ward?._id || '');
  const [streetAddress, setStreetAddress] = useState<string>(initialAddress?.streetAddress || '');

  const [loadingProvinces, setLoadingProvinces] = useState<boolean>(false);
  const [loadingWards, setLoadingWards] = useState<boolean>(false);

  // 1. Fetch tất cả tỉnh/thành phố khi component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const query = `*[_type == "province"]{_id, name, code} | order(name asc)`;
        const data = await client.fetch<ProvinceData[]>(query);
        setProvinces(data);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
        setProvinces([]);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // 2. Fetch phường/xã khi tỉnh/thành phố thay đổi
  useEffect(() => {
    const fetchWards = async () => {
      if (selectedProvinceId) {
        setLoadingWards(true);
        try {
          // GROQ query để chỉ lấy phường/xã của tỉnh đã chọn
          const query = `*[_type == "ward" && province._ref == $provinceId]{_id, name, code, province->{_id}} | order(name asc)`;
          const data = await client.fetch<WardData[]>(query, { provinceId: selectedProvinceId });
          setWards(data);
        } catch (error) {
          console.error("Failed to fetch wards:", error);
          setWards([]);
        } finally {
          setLoadingWards(false);
        }
      } else {
        setWards([]);
      }
      setSelectedWardId(''); // Reset phường/xã khi tỉnh thay đổi
    };
    fetchWards();
  }, [selectedProvinceId, client]); // Dependency: selectedProvinceId and client

  // Gửi địa chỉ đã chọn ra bên ngoài thông qua callback
  // Trả về null nếu địa chỉ chưa đầy đủ
  const emitAddressChange = useCallback(() => {
    if (streetAddress && selectedProvinceId && selectedWardId) {
      onAddressChange({
        streetAddress,
        province: { _ref: selectedProvinceId, _type: 'reference' },
        ward: { _ref: selectedWardId, _type: 'reference' },
        _type: "address",
      });
    } else {
      onAddressChange(null); // Trả về null nếu địa chỉ chưa đầy đủ
    }
  }, [streetAddress, selectedProvinceId, selectedWardId, onAddressChange]);

  // Kích hoạt emitAddressChange mỗi khi các phần của địa chỉ thay đổi
  useEffect(() => {
    emitAddressChange();
  }, [emitAddressChange]);


  return (
    <div className="space-y-4 p-4 border rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Nhập địa chỉ</h3>

      <div>
        <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700">
          Số nhà, Tên đường / Ấp, Thôn, Xóm:
        </label>
        <input
          type="text"
          id="streetAddress"
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={streetAddress}
          onChange={(e) => setStreetAddress(e.target.value)}
          placeholder="Ví dụ: 123 Đường Nguyễn Huệ"
        />
      </div>

      <div>
        <label htmlFor="province" className="block text-sm font-medium text-gray-700">Tỉnh / Thành phố:</label>
        <select
          id="province"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={selectedProvinceId}
          onChange={(e) => setSelectedProvinceId(e.target.value)}
          disabled={loadingProvinces}
        >
          <option value="">
            {loadingProvinces ? 'Đang tải tỉnh...' : '-- Chọn Tỉnh / Thành phố --'}
          </option>
          {provinces.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ward" className="block text-sm font-medium text-gray-700">Phường / Xã:</label>
        <select
          id="ward"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={selectedWardId}
          onChange={(e) => setSelectedWardId(e.target.value)}
          disabled={!selectedProvinceId || loadingWards} // Chỉ cho phép chọn khi tỉnh đã được chọn VÀ không đang tải
        >
          <option value="">
            {loadingWards ? 'Đang tải phường...' : '-- Chọn Phường / Xã --'}
          </option>
          {wards.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AddressForm;