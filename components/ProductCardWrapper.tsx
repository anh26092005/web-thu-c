"use client";

import { Product } from "@/sanity.types";
import { useState, useEffect } from "react";
import { getProductReviewSummaryClient } from "@/sanity/queries/client";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { Flame } from "lucide-react";
import PriceView from "./PriceView";
import Title from "./Title";
import ProductSideMenu from "./ProductSideMenu";
import AddToCartButton from "./AddToCartButton";
import ReviewStars from "./reviews/ReviewStars";

interface ReviewSummary {
  total: number;
  average: number;
}

const ProductCardWrapper = ({ product }: { product: Product }) => {
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
    total: 0,
    average: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewSummary = async () => {
      try {
        const summary = await getProductReviewSummaryClient(product._id);
        setReviewSummary(summary);
      } catch (error) {
        console.error("Error fetching review summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewSummary();
  }, [product._id]);

  return (
    <div className="text-sm border-[1px] rounded-2xl border-white group bg-white hover:border-shop_light_green/80 transition-all duration-300">
      <div className="relative group overflow-hidden bg-shop_light_bg rounded-2xl">
        {product?.images && (
          <Link href={`/product/${product?.slug?.current}`}>
            <Image
              src={urlFor(product.images[0]).url()}
              alt="productImage"
              width={1000}
              height={1000}
              quality={100}
              priority
              className={`w-full h-57 object-contain overflow-hidden transition-transform bg-white duration-500 
              ${product?.stock !== 0 ? "group-hover:scale-105" : "opacity-50"}`}
            />
          </Link>
        )}
        <ProductSideMenu product={product} />
        {product?.status === "sale" ? (
          <p className="absolute top-2 left-2 z-10 text-xs border border-darkColor/50 px-2 rounded-full group-hover:border-lightGreen hover:text-shop_dark_green hoverEffect">
            Giảm giá!
          </p>
        ) : (
          <Link
            href={"/deal"}
            className="absolute top-2 left-2 z-10 border border-shop_orange/50 p-1 rounded-full group-hover:border-shop_orange hover:text-shop_dark_green hoverEffect"
          >
            <Flame
              size={18}
              fill="#fb6c08"
              className="text-shop_orange/50 group-hover:text-shop_orange hoverEffect"
            />
          </Link>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2">
        {product?.categories && (
          <p className="uppercase line-clamp-1 text-xs font-medium text-lightText">
            {product.categories.map((cat) => cat).join(", ")}
          </p>
        )}
        <Title className="text-sm line-clamp-1">{product?.name}</Title>
        
        {/* Phần đánh giá sản phẩm */}
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
              <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center gap-2 max-md:flex-col max-md:items-start">
              <ReviewStars rating={reviewSummary.average} size="sm" className="" />
              <p className="text-lightText text-xs tracking-wide">
                {reviewSummary.total > 0 
                  ? `${reviewSummary.average}/5 (${reviewSummary.total} đánh giá)`
                  : "Chưa có đánh giá"
                }
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <p className="font-medium">Còn hàng</p>
          <p
            className={`${product?.stock === 0 ? "text-red-600" : "text-shop_dark_green/80 font-semibold mt-[1.5px]"}`}
          >
            {(product?.stock as number) > 0 ? product?.stock : "Hết hàng"}
          </p>
        </div>

        <PriceView
          price={product?.price}
          discount={product?.discount}
          className="text-sm"
        />
        <div className="flex justify-center mt-2 p-0">
          <AddToCartButton product={product} className="w-full rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardWrapper; 