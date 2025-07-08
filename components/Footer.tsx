import React from "react";
import Container from "./Container";
import FooterTop from "./FooterTop";
import Logo from "./Logo";
import SocialMedia from "./SocialMedia";
import { SubText, SubTitle } from "./ui/text";
import { categoriesData, quickLinksData } from "@/constants/data";
import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <Container>
        <FooterTop />
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Logo />
            <SubText>
            Giải pháp nhà thuốc online tiện lợi cho cả gia đình. Cung cấp sản phẩm chính hãng, giao hàng nhanh chóng và tư vấn sức khỏe chuyên nghiệp ngay tại nhà.
            </SubText>
            <SocialMedia
              className="text-darkColor/60"
              iconClassName="border-darkColor/60 hover:border-shop_light_green hover:text-shop_light_green"
              tooltipClassName="bg-darkColor text-white"
            />
          </div>
          <div>
            <SubTitle>Liên kết nhanh</SubTitle>
            <ul className="space-y-3 mt-4">
              {quickLinksData?.map((item) => (
                <li key={item?.title}>
                  <Link
                    href={item?.href}
                    className="hover:text-shop_light_green hoverEffect font-medium"
                  >
                    {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SubTitle>Danh mục</SubTitle>
            <ul className="space-y-3 mt-4">
              {categoriesData?.map((item) => (
                <li key={item?.title}>
                  <Link
                    href={`/category/${item?.href}`}
                    className="hover:text-shop_light_green hoverEffect font-medium"
                  >
                    {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <SubTitle>Bản tin</SubTitle>
            <SubText>
              Đăng ký nhận bản tin để cập nhật thông tin và nhận
              ưu đãi độc quyền
            </SubText>
            <form className="space-y-3">
              <Input placeholder="Nhập email của bạn" type="email" required />
              <Button className="w-full bg-shop_light_green text-white hover:bg-shop_light_green/80">Đăng ký</Button>
            </form>
          </div>
        </div>
        <div className="py-6 border-t text-center text-sm text-gray-600">
          <div>
            © {new Date().getFullYear()} <Logo className="text-sm" />. <span>Tất cả
            quyền được bảo lưu bởi <span className="font-bold"><a href="https://thilq0939.github.io/PortfolioGroup/" className="hover:text-shop_light_green hoverEffect font-bold">Nhóm 17</a></span>.</span>

          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
