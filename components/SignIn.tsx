"use client";
import { SignInButton } from "@clerk/nextjs";
import React from "react";

const SignIn = () => {
  return (
    <SignInButton mode="modal">
      <button className="text-m font-semibold hover:text-darkColor text-lightColor hover:cursor-pointer hoverEffect border border-shop_light_green/80 hover:border-shop_light_green p-1.5 rounded-full px-6 bg-shop_light_green/80 hover:bg-shop_light_green text-white max-lg:hidden">
        Đăng nhập
      </button>
    </SignInButton>
  );
};

export default SignIn;
