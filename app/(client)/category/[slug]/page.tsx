import CategoryProducts from "@/components/CategoryProducts";
import Container from "@/components/Container";
import Title from "@/components/Title";
import { getCategories } from "@/sanity/queries";
import React from "react";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const categories = await getCategories();
  const { slug } = await params;
  return (
    <div className="py-10">
      <Container>
        <Title>
          Sản phẩm theo danh mục:{" "}
          <span className="font-bold text-green-600 capitalize tracking-wide">
            {slug === "cham-soc-ca-nhan" ? "Chăm sóc cá nhân" : slug === "thuc-pham-chuc-nang" ? "Thực phẩm chức năng" : slug === "thuoc" ? "Thuốc" : slug === "dinh-duong" ? "Dinh dưỡng" : slug === "sinh-li" ? "Sinh Lí" : slug === "trang-thiet-bi-y-te" ? "Trang thiết bị y tế" : slug === "duoc-mi-pham" ? "Dược mỹ phẩm" : slug}
          </span>
        </Title>
        <CategoryProducts categories={categories} slug={slug} />
      </Container>
    </div>
  );
};

export default CategoryPage;
