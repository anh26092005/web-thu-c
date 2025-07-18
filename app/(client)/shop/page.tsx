import Shop from "@/components/Shop";
import { getBrands, getCategories } from "@/sanity/queries";
import React from "react";

const ShopPage = async () => {
  const categories = await getCategories();
  const brands = await getBrands();
  return (
    <div className="bg-[#edf0f3]">
      <Shop categories={categories} brands={brands} />
    </div>
  );
};

export default ShopPage;
