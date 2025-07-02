"use client";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { emptyCart } from "@/images";
import Image from "next/image";

export default function EmptyCart() {
  return (
    <div className="py-10 md:py-20 bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 pt-0 max-w-md w-full space-y-8"
      >
       
          <Image
            src={emptyCart}
            alt="Giỏ hàng trống"
            width={500}
            height={500}
            className="mx-auto md:w-2/3 md:h-full w-50"
          />

        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Giỏ hàng đang trống
          </h2>
          <p className="text-gray-600">
          Cùng khám phá hàng ngàn sản phẩm
          tại Nhà thuốc Khủng Long Châu nhé!
          </p>
        </div>

        <div>
          <Link
            href="/"
            className="block bg-shop_dark_green text-center py-2.5 rounded-full text-sm font-semibold tracking-wide hover:bg-shop_light_green text-white hoverEffect"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
