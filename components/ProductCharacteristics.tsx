import { Product } from "@/sanity.types";
import { getBrandBySlug } from "@/sanity/queries";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

const ProductCharacteristics = async ({
  product,
}: {
  product: Product | null | undefined;
}) => {
  const brand = await getBrandBySlug(product?.slug?.current as string);
  console.log("product", product);

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Thông tin sản phẩm: {product?.name}</AccordionTrigger>
        <AccordionContent>
          <p className="flex items-center justify-between">
            Nhà sản xuất:{" "}
            {brand && (
              <span className="font-semibold tracking-wide">
                {brand[0]?.brandName}
              </span>
            )}
          </p>
          <p className="flex items-center justify-between">
            Năm sản xuất:{" "}
            <span className="font-semibold tracking-wide">2025</span>
          </p>
          {/* <p className="flex items-center justify-between">
            Loại sản phẩm:{" "}
            <span className="font-semibold tracking-wide">
              {product?.variant}
            </span>
          </p> */}
          <p className="flex items-center justify-between">
            Tình trạng:{" "}
            <span className="font-semibold tracking-wide">
              {product?.stock ? "Còn hàng" : "Hết hàng"}
            </span>
          </p>
          <p className="flex items-center justify-between">
            Xuất xứ:{" "}
            <span className="font-semibold tracking-wide">
              {(product as any)?.origin || "Không rõ"}
            </span>
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ProductCharacteristics;
