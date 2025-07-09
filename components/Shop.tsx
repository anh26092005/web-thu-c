"use client";
import { BRANDS_QUERYResult, Category, Product } from "@/sanity.types";
import React, { useEffect, useState } from "react";
import Container from "./Container";
import Title from "./Title";
import CategoryList from "./shop/CategoryList";
import { useSearchParams } from "next/navigation";
import BrandList from "./shop/BrandList";
import PriceList from "./shop/PriceList";
import { client } from "@/sanity/lib/client";
import { Loader2, Filter, X } from "lucide-react";
import NoProductAvailable from "./NoProductAvailable";
import ProductCardWrapper from "./ProductCardWrapper";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  categories: Category[];
  brands: BRANDS_QUERYResult;
}

const Shop = ({ categories, brands }: Props) => {
  const searchParams = useSearchParams();
  const brandParams = searchParams?.get("brand");
  const categoryParams = searchParams?.get("category");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  // State cho mobile filter toggle
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // Applied filters (dùng để fetch data)
  const [appliedCategory, setAppliedCategory] = useState<string | null>(
    categoryParams || null
  );
  const [appliedBrand, setAppliedBrand] = useState<string | null>(
    brandParams || null
  );
  const [appliedPrice, setAppliedPrice] = useState<string | null>(null);
  
  // Temporary filters (dùng trong mobile filter, chưa apply)
  const [tempCategory, setTempCategory] = useState<string | null>(
    categoryParams || null
  );
  const [tempBrand, setTempBrand] = useState<string | null>(
    brandParams || null
  );
  const [tempPrice, setTempPrice] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let minPrice = 0;
      let maxPrice = 99999999999999999999999999999999;
      if (appliedPrice) {
        const [min, max] = appliedPrice.split("-").map(Number);
        minPrice = min;
        maxPrice = max;
      }
      const query = `
      *[_type == 'product' 
        && (!defined($selectedCategory) || references(*[_type == "category" && slug.current == $selectedCategory]._id))
        && (!defined($selectedBrand) || references(*[_type == "brand" && slug.current == $selectedBrand]._id))
        && price >= $minPrice && price <= $maxPrice
      ] 
      | order(name asc) {
        ...,"categories": categories[]->title
      }
    `;
      const data = await client.fetch(
        query,
        { selectedCategory: appliedCategory, selectedBrand: appliedBrand, minPrice, maxPrice },
        { next: { revalidate: 0 } }
      );
      setProducts(data);
    } catch (error) {
      console.log("Shop product fetching Error", error);
    } finally {
      setLoading(false);
    }
  };

  // Function để đóng mobile filter mà không apply
  const closeMobileFilter = () => {
    // Reset temp state về applied state
    setTempCategory(appliedCategory);
    setTempBrand(appliedBrand);
    setTempPrice(appliedPrice);
    setShowMobileFilter(false);
  };

  // Function để apply filters và đóng mobile filter
  const applyFilters = () => {
    setAppliedCategory(tempCategory);
    setAppliedBrand(tempBrand);
    setAppliedPrice(tempPrice);
    setShowMobileFilter(false);
  };

  // Function để reset tất cả filters
  const resetFilters = () => {
    // Reset cả applied và temp states
    setAppliedCategory(null);
    setAppliedBrand(null);
    setAppliedPrice(null);
    setTempCategory(null);
    setTempBrand(null);
    setTempPrice(null);
    setShowMobileFilter(false);
  };

  // Chỉ fetch khi applied filters thay đổi
  useEffect(() => {
    fetchProducts();
  }, [appliedCategory, appliedBrand, appliedPrice]);

  return (
    <div className="border-t">
      <Container className="mt-5">
        <div className="top-0 z-10 mb-5">
          <div className="flex items-start md:items-center flex-col md:flex-row md:justify-between justify-center">
            <Title className="text-l mx-1 py-0">
              Danh sách sản phẩm
            </Title>
            <div className="flex items-center gap-3">
              {/* Nút toggle bộ lọc cho mobile */}
              <button
                onClick={() => setShowMobileFilter(true)}
                className="md:hidden mt-2 flex items-center gap-2 px-4 py-1 bg-shop_light_green text-white rounded-md hover:bg-shop_dark_green transition-colors"
              >
                <Filter size={16} />
                <span className="text-sm">Bộ lọc</span>
              </button>
              
              {(appliedCategory !== null ||
                appliedBrand !== null ||
                appliedPrice !== null) && (
                <button
                  onClick={resetFilters}
                  className="text-shop_dark_green/80 text-sm mt-2 font-medium hover:text-darkRed hoverEffect"
                >
                  Đặt lại bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-5 border-t border-t-shop_dark_green/50 mb-5">
          {/* Desktop Filter Sidebar - Direct apply */}
          <div className="hidden md:block md:sticky md:top-20 md:mt-5 md:self-start md:h-[calc(100vh-150px)] md:overflow-y-auto md:min-w-60 lg:min-w-64 pb-5 shadow-sm scrollbar-hide rounded-lg overflow-hidden md:max-w-[240px] bg-white">
            <CategoryList
              categories={categories}
              selectedCategory={appliedCategory}
              setSelectedCategory={setAppliedCategory}
            />
            <BrandList
              brands={brands}
              setSelectedBrand={setAppliedBrand}
              selectedBrand={appliedBrand}
            />
            <PriceList
              setSelectedPrice={setAppliedPrice}
              selectedPrice={appliedPrice}
            />
          </div>

          {/* Mobile Filter Overlay với Animation - Temporary state */}
          <AnimatePresence>
            {showMobileFilter && (
              <motion.div 
                className="md:hidden fixed inset-0 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={closeMobileFilter}
              >
                {/* Background overlay với fade animation */}
                <motion.div 
                  className="absolute inset-0 bg-black/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
                
                {/* Sidebar với slide animation */}
                <motion.div 
                  className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl overflow-hidden flex flex-col"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ 
                    type: "spring",
                    damping: 30,
                    stiffness: 300,
                    duration: 0.4
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header của mobile filter */}
                  <motion.div 
                    className="bg-white border-b px-4 py-4 flex items-center justify-between shadow-sm"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <h3 className="text-lg font-semibold text-shop_dark_green">
                      Bộ lọc sản phẩm
                    </h3>
                    <motion.button
                      onClick={closeMobileFilter}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={20} />
                    </motion.button>
                  </motion.div>
                  
                  {/* Nội dung bộ lọc với stagger animation - Sử dụng temp state */}
                  <motion.div 
                    className="flex-1 overflow-y-auto scrollbar-hide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        visible: {
                          transition: {
                            staggerChildren: 0.1
                          }
                        }
                      }}
                    >
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, x: 20 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <CategoryList
                          categories={categories}
                          selectedCategory={tempCategory}
                          setSelectedCategory={setTempCategory}
                        />
                      </motion.div>
                      
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, x: 20 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <BrandList
                          brands={brands}
                          setSelectedBrand={setTempBrand}
                          selectedBrand={tempBrand}
                        />
                      </motion.div>
                      
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, x: 20 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <PriceList
                          setSelectedPrice={setTempPrice}
                          selectedPrice={tempPrice}
                        />
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  {/* Footer với nút áp dụng */}
                  <motion.div 
                    className="bg-white border-t px-4 py-4 shadow-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                  >
                    <motion.button
                      onClick={applyFilters}
                      className="w-full bg-shop_light_green text-white py-3 rounded-lg font-medium hover:bg-shop_dark_green transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      Áp dụng bộ lọc
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1 pt-5 mb-5">
            <div className="h-full overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="p-20 flex flex-col gap-2 items-center justify-center bg-white">
                  <Loader2 className="w-10 h-10 text-shop_dark_green animate-spin" />
                  <p className="font-semibold tracking-wide text-base">
                    Đang tải sản phẩm . . .
                  </p>
                </div>
              ) : products?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products?.map((product) => (
                    <ProductCardWrapper key={product?._id} product={product} />
                  ))}
                </div>
              ) : (
                <NoProductAvailable className="bg-white mt-0" />
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Shop;
