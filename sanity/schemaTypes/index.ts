import { type SchemaTypeDefinition } from "sanity";
import { categoryType } from "./categoryType";
import { blockContentType } from "./blockContentType";
import { productType } from "./productType";
import { orderType } from "./orderType";
import { brandType } from "./brandTypes";
import { blogType } from "./blogType";
import { blogCategoryType } from "./blogCategoryType";
import { authorType } from "./authorType";
import { addressType } from "./addressType";
import { bannerType } from "./bannerType";
import { provinceType } from "./provinceType";
import { wardType } from "./wardType";
import { vietnameseAddressType } from "./vietnameseAddressType";
import { couponType } from "./couponType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    categoryType,
    blockContentType,
    productType,
    orderType,
    brandType,
    blogType,
    blogCategoryType,
    authorType,
    addressType,
    bannerType,
    provinceType,
    wardType,
    vietnameseAddressType,
    couponType,
  ],
};
