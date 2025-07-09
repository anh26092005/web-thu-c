import Container from "@/components/Container";
import HomeBanner from "@/components/HomeBanner";

import HomeCategories from "@/components/HomeCategories";
import LatestBlog from "@/components/LatestBlog";
import ProductGrid from "@/components/ProductGrid";
import ShopByBrands from "@/components/ShopByBrands";
import { getCategories } from "@/sanity/queries";
import BackToTopButton from "@/components/BackToTopButton";
import React from "react";
import CustomChat from "@/components/CustomChat";
const Home = async () => {
  const categories = await getCategories();

  return (
    <Container className="bg-shop_light_pink">
      <div className="absolute top-7.5 inset-0 bg-gradient-to-b md:h-full h-2/3 from-shop_orange to-[#e8eefa] opacity-20"></div>
      
      <HomeBanner />
      <ProductGrid />
      <HomeCategories categories={categories} />
      <ShopByBrands />
      <LatestBlog />
      <BackToTopButton />
      <CustomChat/>
    </Container>
  );
};

export default Home;
