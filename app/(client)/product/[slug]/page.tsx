import AddToCartButton from "@/components/AddToCartButton";
import Container from "@/components/Container";
import FavoriteButton from "@/components/FavoriteButton";
import ImageView from "@/components/ImageView";
import PriceView from "@/components/PriceView";
import ProductCharacteristics from "@/components/ProductCharacteristics";
import ProductInfo from "@/components/ProductInfo";
import ProductReviews from "@/components/reviews/ProductReviews";
import { getProductBySlug } from "@/sanity/queries";
import { CornerDownLeft, StarIcon, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import React from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { RxBorderSplit } from "react-icons/rx";
import { TbTruckDelivery } from "react-icons/tb";

const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  const product  = await getProductBySlug(slug);
  console.log("params", params);
  if (!product) {
    return notFound();
  }
  
  return (
    <>
    <div className="flex flex-col justify-between bg-white rounded-xl max-w-screen-xl mx-auto p-5">
    <Container className="flex flex-col md:flex-row gap-10 py-5 bg-white rounded-xl mt-10">
      {product?.images && (
        <ImageView images={product?.images} isStock={product?.stock} />
        
      )}
      
      <div className="w-full md:w-1/2 flex flex-col gap-5">
        <div className="space-y-1">
          <h2 className="text-3xl font-medium mb-4">{product?.name}</h2>
          <p className="text-sm text-gray-600 tracking-wide">
            {product?.description}
          </p>
          <div className="flex items-center gap-0.5 text-xs">
            {[...Array(5)].map((_, index) => (
              <StarIcon
                key={index}
                size={12}
                className="text-shop_light_green"
                fill={"#3b9c3c"}
              />
            ))}
            <p className="font-semibold">{`(120)`}</p>
          </div>
        </div>
        <div className="space-y-2 py-5 mt-2">
          <PriceView
            price={product?.price}
            discount={product?.discount}
            className="text-4xl font-bold"
          />
          <p
            className={`px-4 py-1.5 mt-2 text-sm text-center inline-block font-semibold rounded-lg ${product?.stock === 0 ? "bg-red-100 text-red-600" : "text-green-600 bg-green-100"}`}
          >
            {(product?.stock as number) > 0 ? "Còn hàng" : "Hết hàng"}
          </p>
        </div>
        <div className="flex items-center gap-2.5 lg:gap-3">
          <AddToCartButton product={product} className="h-11 rounded-xl" />
          <FavoriteButton showProduct={true} product={product} />
        </div>
        <ProductCharacteristics product={product} />
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-b-gray-200">
          {/* <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
            <RxBorderSplit className="text-lg" />
            <p>Compare color</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
            <FaRegQuestionCircle className="text-lg" />
            <p>Ask a question</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
            <TbTruckDelivery className="text-lg" />
            <p>Delivery & Return</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-black hover:text-red-600 hoverEffect">
            <FiShare2 className="text-lg" />
            <p>Share</p>
          </div> */}
        </div>
        <div className="flex flex-row justify-between md:hidden lg:flex">
          <div className="p-3 flex flex items-center gap-2.5">
            <Truck size={30} className="text-shop_light_green" />
            <div>
              <p className="text-base font-semibold text-black">
                Giao hàng miễn phí
              </p>
              <p className="text-sm text-gray-500">
                theo chính sách giao hàng
              </p>
            </div>
          </div>
          <div className=" p-3 flex items-center gap-2.5">
            <CornerDownLeft size={30} className="text-shop_light_green" />
            <div>
              <p className="text-base font-semibold text-black">
                Trả hàng miễn phí
              </p>
              <p className="text-sm text-gray-500 ">
                Trả hàng miễn phí trong 30 ngày
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </Container>
    <div className="flex flex-row justify-center max-md:hidden lg:hidden">
          <div className="p-4 m-0 flex flex items-center gap-2.5">
            <Truck size={30} className="text-shop_light_green" />
            <div>
              <p className="text-base font-semibold text-black">
                Giao hàng miễn phí
              </p>
              <p className="text-sm text-gray-500 ">
                theo chính sách giao hàng
              </p>
            </div>
          </div>
          <div className=" p-3 flex items-center gap-2.5">
            <CornerDownLeft size={30} className="text-shop_light_green" />
            <div>
              <p className="text-base font-semibold text-black">
                Trả hàng miễn phí
              </p>
              <p className="text-sm text-gray-500 ">
                Trả hàng miễn phí trong 30 ngày
              </p>
            </div>
          </div>
        </div>
    </div>
      
      {/* Thông tin chi tiết sản phẩm */}
      <div className="flex flex-col md:flex-row gap-10 py-10 max-w-screen-xl mx-auto">
        <ProductInfo info={product?.drugInfo}/>
      </div>

      {/* Hệ thống đánh giá sản phẩm */}
      <div className="max-w-screen-xl mx-auto py-10 px-5">
        <ProductReviews 
          productId={product._id} 
          productName={product.name} 
        />
      </div>
    </>
  );
};

export default SingleProductPage;
