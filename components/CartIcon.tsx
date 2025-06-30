"use client";
import useStore from "@/store";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import React from "react";

const CartIcon = () => {
  const { items } = useStore();
  return (
    <Link href={"/cart"} className="group relative flex gap-1 items-center">
      <ShoppingBag className="w-5 h-5 hover:text-shop_light_green hoverEffect" />
      <span className="absolute -top-1 right-17 bg-shop_dark_green text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
        {items?.length ? items?.length : 0}
      </span>
      <span className="text-m font-semibold hover:text-shop_light_green hoverEffect">Giỏ hàng</span>
    </Link>
  );
};

export default CartIcon;
