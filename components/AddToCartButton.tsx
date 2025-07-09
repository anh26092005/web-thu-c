"use client";
import { Product } from "@/sanity.types";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import useStore from "@/store";
import toast from "react-hot-toast";
import PriceFormatter from "./PriceFormatter";
import QuantityButtons from "./QuantityButtons";

interface Props {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className }: Props) => {
  const { addItem, getItemCount } = useStore();
  const itemCount = getItemCount(product?._id);
  const isOutOfStock = product?.stock === 0;

  // Tính giá sau khi giảm
  const getDiscountedPrice = (product: Product) => {
    const price = product?.price ?? 0;
    const discount = product?.discount ?? 0;
    if (discount > 0) {
      return price - (discount * price) / 100;
    }
    return price;
  };

  const handleAddToCart = () => {
    if ((product?.stock as number) > itemCount) {
      addItem(product);
      toast.success(
        `${product?.name?.substring(0, 12)}... đã được thêm thành công!`
      );
    } else {
      toast.error("Không thể thêm nhiều hơn số lượng có sẵn");
    }
  };
  return (
    <div className="w-full h-12 flex items-center">
      {itemCount ? (
        <div className="text-sm w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs text-darkColor/80">Số lượng</span>
            <QuantityButtons product={product} />
          </div>
          <div className="flex items-center justify-between border-t pt-1">
            <span className="text-xs font-semibold">Tổng</span>
            <PriceFormatter
              amount={getDiscountedPrice(product) * itemCount}
            />
          </div>
        </div>
      ) : (
        <Button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            "w-full bg-shop_light_green text-lightBg shadow-none border border-shop_light_green/80 font-medium tracking-wide text-white hover:bg-shop_light_green hover:border-shop_light_green hoverEffect",
            className
          )}
        >
          <ShoppingBag /> {isOutOfStock ? "Hết hàng" : "Chọn mua"}
        </Button>
      )}
    </div>
  );
};

export default AddToCartButton;
