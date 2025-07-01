"use client";
import { productType } from "@/constants/data";
import Link from "next/link";
interface Props {
  selectedTab: string;
  onTabSelect: (tab: string) => void;
}

const HomeTabbar = ({ selectedTab, onTabSelect }: Props) => {
  return (
    <>
    <div className="flex items-center">
      <div className="flex items-center gap-1.5 md:gap-3 overflow-x-auto whitespace-nowrap text-sm font-semibold min-w-0 scrollbar-hide">
          {productType?.map((item) => (
            <button
              onClick={() => onTabSelect(item?.title)}
              key={item?.title}
              className={`border border-shop_light_green/30 px-4 py-1.5 md:px-6 md:py-2 rounded-full hover:bg-shop_light_green hover:border-shop_light_green hover:text-white hoverEffect ${selectedTab === item?.title ? "bg-shop_light_green text-white border-shop_light_green" : "bg-shop_light_green/10"}`}
            >
              {item?.title}
            </button>
          ))}
      </div>
    </div>
    <div className="mt-4">

      {/* <Link
        href={"/shop"}
        className="border border-shop_light_green px-3 py-2 rounded-full hover:bg-shop_light_green hover:text-white hover:border-shop_light_green hoverEffect"
      >
        Xem tất cả
      </Link> */}
    </div>
    </>
  );
};

export default HomeTabbar;
