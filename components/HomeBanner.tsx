import React from "react";
import { getBanners } from "@/sanity/queries";
import { Banner } from "@/sanity.types";
import HomeBannerClient from "./HomeBannerClient";


// Server Component - fetch dữ liệu từ server
const HomeBanner = async () => {
  // Fetch dữ liệu banner từ server
  const bannerData: Banner[] = await getBanners();

  return <HomeBannerClient bannerData={bannerData} />;
};

export default HomeBanner;
