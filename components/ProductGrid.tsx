"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "motion/react";
import { client } from "@/sanity/lib/client";
import NoProductAvailable from "./NoProductAvailable";
import { Loader2 } from "lucide-react";
import Container from "./Container";
import HomeTabbar from "./HomeTabbar";
import { productType } from "@/constants/data";
import { Product } from "@/sanity.types";
import { useRouter } from "next/navigation";

const ProductGrid = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(productType[0]?.title || "");
  const query = `*[_type == "product" && variant == $variant] | order(name asc){
  ...,"categories": categories[]->title
}`;
const queryAll = `*[_type == "product"] | order(name asc){
  ...,"categories": categories[]->title
}`;

  let variant = selectedTab.toLowerCase();
  if (variant === "thuốc") {
    variant = "thuoc";
  }
  if (variant === "thực phẩm chức năng") {
    variant = "thuc-pham-chuc-nang";
  }
  if (variant === "sinh lý") {
    variant = "sinh-ly";
  }
  if (variant === "trang thiết bị y tế") {
    variant = "trang-thiet-bi-y-te";
  }
  if (variant === "dinh dưỡng") {
    variant = "dinh-duong";
  }
  if (variant === "dược mỹ phẩm") {
    variant = "duoc-my-pham";
  }
  if (variant === "chăm sóc cá nhân") {
    variant = "cham-soc-ca-nhan";
  }
  
  if(selectedTab === "Tất cả"){
    router.push("/shop")
  }
  const params = { variant };
  console.log(params);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // if (selectedTab === "Tất cả") {
        //   const response = await client.fetch(queryAll);
        //   setProducts(await response);
        // } else {
          const response = await client.fetch(query, params);
          setProducts(await response);
        // }
      } catch (error) {
        console.log("Product fetching Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedTab]);

  return (
    <>
    <Container className="lg:px-0 my-10">
      <HomeTabbar selectedTab={selectedTab} onTabSelect={setSelectedTab} />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 min-h-80 space-y-4 text-center bg-gray-100 rounded-lg w-full mt-10">
          <motion.div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Product is loading...</span>
          </motion.div>
        </div>
      ) : products?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-10">
          <>
            {products?.map((product) => (
              <AnimatePresence key={product?._id}>
                <motion.div
                  layout
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ProductCard key={product?._id} product={product} />
                </motion.div>
              </AnimatePresence>
            ))}
          </>
        </div>
      ) : (
        <NoProductAvailable selectedTab={selectedTab} />
      )}
    </Container>
    </>
  );
};

export default ProductGrid;
