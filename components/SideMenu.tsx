"use client";

import React, { FC } from "react";
import Logo from "./Logo";
import { X, User, Heart, Logs } from "lucide-react";
import { headerData } from "@/constants/data";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SocialMedia from "./SocialMedia";
import { useOutsideClick } from "@/hooks";
import { useUser, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import useStore from "@/store";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClose);
  const { user } = useUser();
  const { favoriteProduct } = useStore();

  return (
    <div
      className={`fixed inset-y-0 h-screen left-0 z-500 w-full text-black/70 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } hoverEffect`}
    >
      <div
        ref={sidebarRef}
        className="min-w-72 max-w-96 bg-white shadow-xl h-screen p-10 border-r border-r-shop_light_green flex flex-col gap-6"
      >
        <div className="flex items-center justify-between gap-5">
          <Logo className="text-black" spanDesign="group-hover:text-black" />
          <button
            onClick={onClose}
            className="hover:text-shop_light_green hoverEffect"
          >
            <X />
          </button>
        </div>

        {/* User Authentication Section */}
        <div className="border-b border-gray-200 pb-4">
          <SignedIn>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10"
                  }
                }}
              />
              <div className="flex-1">
                <p className="font-medium text-black">
                  {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.emailAddresses?.[0]?.emailAddress}
                </p>
              </div>
            </div>
          </SignedIn>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="w-full flex items-center gap-3 p-3 bg-shop_light_green text-white rounded-lg hover:bg-shop_dark_green hoverEffect">
                <User className="h-5 w-5" />
                <span className="font-medium">Đăng nhập</span>
              </button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3 border-b border-gray-200 pb-4">
          <h3 className="font-semibold text-black text-sm uppercase tracking-wide">
            Tiện ích
          </h3>
          
          {/* Wishlist */}
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg hoverEffect"
          >
            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-shop_light_green" />
              <span className="font-medium">Danh sách yêu thích</span>
            </div>
            {favoriteProduct?.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {favoriteProduct.length}
              </span>
            )}
          </Link>

          {/* Orders - chỉ hiển thị khi đã đăng nhập */}
          <SignedIn>
            <Link
              href="/orders"
              onClick={onClose}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg hoverEffect"
            >
              <Logs className="h-5 w-5 text-shop_light_green" />
              <span className="font-medium">Đơn hàng của tôi</span>
            </Link>
          </SignedIn>
        </div>

        <div className="flex flex-col space-y-3.5 font-semibold tracking-wide">
          {headerData?.map((item) => (
            <Link
              href={item?.href}
              key={item?.title}
              onClick={onClose}
              className={`hover:text-shop_light_green hoverEffect ${
                pathname === item?.href && "text-black"
              }`}
            >
              {item?.title}
            </Link>
          ))}
        </div>
        <SocialMedia />
      </div>
    </div>
  );
};

export default SideMenu;
