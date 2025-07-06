import Container from "@/components/Container";
import HomeBanner from "@/components/HomeBanner";

import HomeCategories from "@/components/HomeCategories";
import LatestBlog from "@/components/LatestBlog";
import ProductGrid from "@/components/ProductGrid";
import ShopByBrands from "@/components/ShopByBrands";
import { getCategories } from "@/sanity/queries";
import BackToTopButton from "@/components/BackToTopButton";
import Chat from "@/components/Chat";
import React from "react";
import CustomChat from "@/components/CustomChat";

const Home = async () => {
  const categories = await getCategories();

  return (
    <Container className="bg-shop_light_pink">
      <HomeBanner />
      <ProductGrid />
      <HomeCategories categories={categories} />
      <ShopByBrands />
      <LatestBlog />
      <Chat />
      <BackToTopButton />
      <CustomChat />
    </Container>
  );
};

export default Home;
