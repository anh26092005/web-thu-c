import Container from "@/components/Container";
import NoProductAvailable from "@/components/NoProductAvailable";
import ProductCardWrapper from "@/components/ProductCardWrapper";
import Title from "@/components/Title";
import { getDealProducts } from "@/sanity/queries";
import { Flame, ShoppingBag } from "lucide-react";
import React from "react";

// Component trang Deal - hiển thị sản phẩm khuyến mãi
const DealPage = async () => {
  const products = await getDealProducts();

  return (
    <div className="bg-[#f1f3f8] min-h-screen">
      <Container className="py-10">
        {/* Header section */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-shop_orange/20">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-shop_orange/10 rounded-full">
                <Flame className="h-8 w-8 text-shop_orange" />
              </div>
              <Title className="text-3xl font-bold text-gray-900">
                Sản phẩm khuyến mãi
              </Title>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Khám phá những sản phẩm hot nhất với giá ưu đãi đặc biệt. 
              Nhanh tay sở hữu trước khi hết hàng!
            </p>
            <div className="flex items-center justify-center gap-2 text-shop_orange">
              <ShoppingBag className="h-5 w-5" />
              <span className="font-semibold">
                {products.length} sản phẩm đang khuyến mãi
              </span>
            </div>
          </div>
        </div>

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="group">
                <ProductCardWrapper product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20">
            <NoProductAvailable 
              selectedTab="khuyến mãi"
              className="bg-white border border-gray-200"
            />
          </div>
        )}

        {/* Call to action */}
        {products.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-shop_orange/10 to-shop_light_green/10 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Còn chờ gì nữa?
            </h3>
            <p className="text-gray-600 mb-6">
              Những ưu đãi này có thể kết thúc bất kỳ lúc nào. Hãy nhanh tay đặt hàng ngay!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Miễn phí vận chuyển</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Đảm bảo chính hãng</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default DealPage; 