import React from "react";
import Container from "./Container";
import Logo from "./Logo";
import HeaderMenu from "./HeaderMenu";
import SearchBar from "./SearchBar";
import CartIcon from "./CartIcon";
import FavoriteButton from "./FavoriteButton";
import SignIn from "./SignIn";
import MobileMenu from "./MobileMenu";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ClerkLoaded, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Logs } from "lucide-react";
import { getMyOrders } from "@/sanity/queries";

const Header = async () => {
  const user = await currentUser();
  const { userId } = await auth();
  let orders = null;
  if (userId) {
    orders = await getMyOrders(userId);
  }

  return (
    <>
    
    <div className="absolute top-2 left-0 w-full z-100 items-center bg-[#f6f6f6] justify-between px-5">
    <p className="text-shop_light_green text-sm text-center font-bold">Tra cứu nguồn gốc xuất xứ hàng hóa <a href="https://dichvucong.dav.gov.vn/congbothuoc/index" className=" ml-1 text-shop_light_green underline">Kiểm tra ngay</a></p>
      </div> 
    <header className=" top-0 z-50 pt-5 backdrop-blur-md bg-[#f6f6f6] max-lg:pb-5 max-lg:px-5">
      
      <div className="md:hidden flex items-center justify-between px-5 mt-5" >
           <MobileMenu/>
           <Logo className="sm:mr-15 mr-5 text-xl"/> 
           <CartIcon/>
      </div>
      <Container className="flex items-center justify-between text-lightColor mt-5">
        <div className="w-auto flex items-center gap-2.5 justify-between flex-1 md:gap-4">
          
         
         <div className="max-md:hidden">
           <Logo className="max-xl:text-xl"/> 
           </div>
        {/* </div> */}
        {/* <div className="w-auto md:w-2/3 flex items-center justify-end gap-5"> */}
          <SearchBar />
          
          <div className="max-md:hidden">
            <CartIcon />
          </div>
          <div className="max-lg:hidden">
            <FavoriteButton />
          </div>

          {user && (
            <Link
            href={"/orders"}
            className="group relative hover:text-shop_light_green hoverEffect"
            >
              <Logs />
              <span className="absolute -top-1 -right-1 bg-shop_btn_dark_green text-white h-3.5 w-3.5 rounded-full text-xs font-semibold flex items-center justify-center">
                {orders?.length ? orders?.length : 0}
              </span>
            </Link>
          )}

          <ClerkLoaded>
            <SignedIn>
              <UserButton />
            </SignedIn>
            {!user && <SignIn />}
          </ClerkLoaded>
        </div>
      </Container>
      <div className="flex items-center justify-center mt-7 p-6 bg-[#5998f0] h-10 max-lg:hidden">
       <HeaderMenu />
       </div>
    </header>
    </>
  );
};

export default Header;
