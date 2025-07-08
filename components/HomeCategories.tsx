import React from "react";
import Title from "./Title";
import { Category } from "@/sanity.types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import Link from "next/link";

// Interface mở rộng Category với productCount
interface CategoryWithCount extends Category {
  productCount: number;
}

const HomeCategories = ({ categories }: { categories: CategoryWithCount[] }) => {
  return (
    <div className="bg-white border border-shop_light_green/20 my-10 p-9 lg:p-7 rounded-2xl">
      <Title className="pb-3">Danh mục phổ biến</Title>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories?.map((category) => (
          <Link
            key={category?._id}
            href={`/category/${category?.slug?.current}`}
            className="block"
          >
            <div className="bg-gray-50 hover:bg-white border border-gray-200 hover:border-shop_orange/50 hover:shadow-md p-5 flex items-center gap-3 rounded-2xl group cursor-pointer transition-all duration-300">
              {category?.image && (
                <div className="overflow-hidden border border-shop_orange/30 hover:border-shop_orange transition-colors duration-300 w-20 h-20 p-1 rounded-xl">
                  <Image
                    src={urlFor(category?.image).url()}
                    alt={`${category?.title} category`}
                    width={500}
                    height={500}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-semibold text-gray-900 group-hover:text-shop_light_green transition-colors duration-300">
                  {category?.title}
                </h3>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-shop_dark_green">{`(${category?.productCount || 0})`}</span>{" "}
                  sản phẩm có sẵn
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeCategories;
