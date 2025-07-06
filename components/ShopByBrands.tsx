import React from "react";
import Title from "./Title";
import Link from "next/link";
import { getBrands } from "@/sanity/queries";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { GitCompareArrows, Headset, ShieldCheck, Truck } from "lucide-react";

const extraData = [
  {
    title: "Miễn phí vận chuyển",
    description: "theo chính sách giao hàng",
    icon: <Truck size={45} />,
  },
  {
    title: "Đổi trả trong 30 ngày",
    description: "kể từ ngày mua hàng",
    icon: <GitCompareArrows size={45} />,
  },
  {
    title: "Hỗ trợ khách hàng",
    description: "tư vấn thân thiện 24/7",
    icon: <Headset size={45} />,
  },
  {
    title: "Thuốc chính hãng",
    description: "đa dạng và chuyên sâu",
    icon: <ShieldCheck size={45} />,
  },
];

const ShopByBrands = async () => {
  const brands = await getBrands();
  return (
    <div className="mb-10 lg:mb-20 bg-white p-5 lg:p-7 rounded-2xl border border-shop_light_green/20">
      <div className="flex items-center gap-5 justify-between mb-10">
        <Title>Mua theo thương hiệu</Title>
        <Link
          href={"/shop"}
          className="text-sm font-semibold tracking-wide hover:text-shop_btn_dark_green hoverEffect"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {brands?.map((brand: any) => (
          <Link
            key={brand?._id}
            href={{ pathname: "/shop", query: { brand: brand?.slug?.current } }}
            className="bg-white w-34 h-24 flex items-center justify-center rounded-md overflow-hidden hover:shadow-lg shadow-shop_dark_green/20 hoverEffect"
          >
            {brand?.image && (
              <Image
                src={urlFor(brand?.image).url()}
                alt="brandImage"
                width={250}
                height={250}
                className="w-32 h-20 object-contain rounded-2xl"
              />
            )}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16 p-4 rounded-2xl shadow-lg hover:shadow-shop_light_green/20 py-5">
        {extraData?.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 group text-lightColor hover:text-shop_light_green"
          >
            <span className="inline-flex scale-100 group-hover:scale-90 hoverEffect">
              {item?.icon}
            </span>
            <div className="text-sm">
              <p className="text-darkColor/80 font-bold capitalize">
                {item?.title}
              </p>
              <p className="text-lightColor">{item?.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopByBrands;
