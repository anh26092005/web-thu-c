import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromotionPopup from "@/components/PromotionPopup";
import { ClerkProvider } from "@clerk/nextjs";
import { getPopupBanner } from "@/sanity/queries";

export const metadata: Metadata = {
  title: {
    template: "%s - Nhà thuốc Khủng Long Châu",
    default: "Nhà thuốc Khủng Long Châu",
  },
  description: "Nhà thuốc Khủng Long Châu",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch popup banner data từ server
  const popupBanner = await getPopupBanner();

  return (
    <ClerkProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-shop_light_pink">{children}</main>
        <Footer />
        {/* Popup khuyến mãi */}
        <PromotionPopup banner={popupBanner} />
      </div>
    </ClerkProvider>
  );
}
