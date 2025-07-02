import NoAccess from "@/components/NoAccess";
import WishListProducts from "@/components/WishListProducts";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

const WishListPage = async () => {
  const user = await currentUser();
  return (
    <>
      {user ? (
        <WishListProducts />
      ) : (
        <NoAccess details=" Đăng nhập để xem các sản phẩm trong danh sách yêu thích của bạn. Đừng bỏ lỡ các sản phẩm trong giỏ hàng để tiến hành thanh toán!" />
      )}
    </>
  );
};

export default WishListPage;
