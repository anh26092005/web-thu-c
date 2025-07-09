"use client";
import { Category, Product } from "@/sanity.types";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { client } from "@/sanity/lib/client";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, Filter, X } from "lucide-react";
import NoProductAvailable from "./NoProductAvailable";
import ProductCardWrapper from "./ProductCardWrapper";

interface Props {
  categories: Category[];
  slug: string;
}

const CategoryProducts = ({ categories, slug }: Props) => {
  // Applied state (dùng để fetch data và update URL)
  const [currentSlug, setCurrentSlug] = useState(slug);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Mobile filter state
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  // Temporary state cho mobile filter
  const [tempSlug, setTempSlug] = useState(slug);
  
  const router = useRouter();

  const handleCategoryChange = (newSlug: string) => {
    if (newSlug === currentSlug) return; // Prevent unnecessary updates
    setCurrentSlug(newSlug);
    setTempSlug(newSlug); // Sync temp state
    router.push(`/category/${newSlug}`, { scroll: false }); // Update URL without
  };

  // Mobile category change (chỉ update temp state)
  const handleMobileCategoryChange = (newSlug: string) => {
    setTempSlug(newSlug);
  };

  // Function để đóng mobile filter mà không apply
  const closeMobileFilter = () => {
    // Reset temp state về applied state
    setTempSlug(currentSlug);
    setShowMobileFilter(false);
  };

  // Function để apply category selection và đóng mobile filter
  const applyFilter = () => {
    if (tempSlug !== currentSlug) {
      setCurrentSlug(tempSlug);
      router.push(`/category/${tempSlug}`, { scroll: false });
    }
    setShowMobileFilter(false);
  };

  const fetchProducts = async (categorySlug: string) => {
    setLoading(true);
    try {
      const query = `
        *[_type == 'product' && references(*[_type == "category" && slug.current == $categorySlug]._id)] | order(name asc){
        ...,"categories": categories[]->title}
      `;
      const data = await client.fetch(query, { categorySlug });
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentSlug);
  }, [currentSlug]);

  // Tìm category title hiện tại
  const currentCategory = categories?.find(cat => cat?.slug?.current === currentSlug);

  return (
    <div className="py-5">
      {/* Header với nút mobile filter */}
      <div className="flex items-center justify-between mb-5 md:hidden">
        <h2 className="text-xl font-semibold text-green-600 ">
          {currentCategory?.title || "Danh mục sản phẩm"}
        </h2>
        <button
          onClick={() => setShowMobileFilter(true)}
          className="flex items-center gap-2 px-4 py-2 bg-shop_light_green text-white rounded-lg hover:bg-shop_dark_green transition-colors"
        >
          <Filter size={16} />
          <span className="text-sm">Danh mục</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-5">
        {/* Desktop Category Sidebar */}
        <div className="hidden md:flex flex-col md:min-w-40 rounded-2xl overflow-hidden">
          {categories?.map((item) => (
            <Button
              onClick={() => handleCategoryChange(item?.slug?.current as string)}
              key={item?._id}
              className={`bg-white border-0 p-4 rounded-none text-darkColor shadow-none hover:bg-shop_light_green hover:text-white font-semibold hoverEffect border-b last:border-b-0 transition-colors capitalize ${item?.slug?.current === currentSlug && "bg-shop_light_green text-white border-shop_light_green"}`}
            >
              <p className="w-full text-left px-2">{item?.title}</p>
            </Button>
          ))}
        </div>

        {/* Mobile Filter Overlay với Animation */}
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
                    Chọn danh mục
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
                
                {/* Nội dung danh mục với animation */}
                <motion.div 
                  className="flex-1 overflow-y-auto scrollbar-hide"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <motion.div
                    className="p-4 space-y-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: {
                          staggerChildren: 0.05
                        }
                      }
                    }}
                  >
                    {categories?.map((item) => (
                      <motion.div
                        key={item?._id}
                        variants={{
                          hidden: { opacity: 0, x: 20 },
                          visible: { opacity: 1, x: 0 }
                        }}
                      >
                        <Button
                          onClick={() => handleMobileCategoryChange(item?.slug?.current as string)}
                          className={`w-full justify-start bg-white border border-gray-200 p-4 text-darkColor shadow-none hover:bg-shop_light_green hover:text-white hover:border-shop_light_green font-medium hoverEffect transition-all capitalize ${item?.slug?.current === tempSlug && "bg-shop_light_green text-white border-shop_light_green"}`}
                        >
                          {item?.title}
                        </Button>
                      </motion.div>
                    ))}
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
                    onClick={applyFilter}
                    className="w-full bg-shop_light_green text-white py-3 rounded-lg font-medium hover:bg-shop_dark_green transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    Áp dụng danh mục
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 min-h-80 space-y-4 text-center bg-gray-100 rounded-lg w-full">
              <div className="flex items-center space-x-2 text-blue-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang tải sản phẩm...</span>
              </div>
            </div>
          ) : products?.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {products?.map((product: Product) => (
                <AnimatePresence key={product._id}>
                  <motion.div>
                    <ProductCardWrapper product={product} />
                  </motion.div>
                </AnimatePresence>
              ))}
            </div>
          ) : (
            <NoProductAvailable
              selectedTab={currentCategory?.title || currentSlug}
              className="mt-0 w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryProducts;
