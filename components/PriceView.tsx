import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";
import PriceFormatter from "./PriceFormatter";

interface Props {
  price: number | undefined;
  discount: number | undefined;
  className?: string;
}
const PriceView = ({ price, discount, className }: Props) => {
  // Tính giá sau khi giảm
  const discountedPrice = price && discount && discount > 0 
    ? price - (discount * price) / 100 
    : price;
  
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="flex items-center gap-2">
        {/* Hiển thị giá khuyến mãi làm giá chính */}
        <PriceFormatter
          amount={discountedPrice}
          className={cn("text-shop_light_green", className)}
        />
        {/* Hiển thị giá gốc bị gạch ngang khi có khuyến mãi */}
        {price && discount && discount > 0 && (
          <PriceFormatter
            amount={price}
            className={twMerge(
              "line-through text-xs font-normal text-zinc-500",
              className
            )}
          />
        )}
      </div>
    </div>
  );
};

export default PriceView;
