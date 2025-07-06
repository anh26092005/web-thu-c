import ProductCardWrapper from "@/components/ProductCardWrapper";
import Container from "@/components/Container";
import { getDealProducts } from "@/sanity/queries";
import { Product } from "@/sanity.types";

const DealPage = async () => {
  const products = await getDealProducts();
  return (
    <Container className="mb-10 mt-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 ">
        {products?.map((product: Product) => (
          <ProductCardWrapper key={product?._id} product={product} />
        ))}
      </div>
    </Container>
  );
};

export default DealPage;
