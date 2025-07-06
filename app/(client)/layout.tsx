import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: {
    template: "%s - Nhà thuốc Khủng Long Châu",
    default: "Nhà thuốc Khủng Long Châu",
  },
  description: "Nhà thuốc Khủng Long Châu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 bg-shop_light_pink">{children}</main>
        <Footer />
        
      </div>
    </ClerkProvider>
  );
}
