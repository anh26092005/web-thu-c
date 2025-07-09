import { defineQuery } from "next-sanity";

const BRANDS_QUERY = defineQuery(`*[_type=='brand'] | order(name asc) `);

const LATEST_BLOG_QUERY = defineQuery(
  ` *[_type == 'blog' && isLatest == true]|order(name asc){
      ...,
      blogcategories[]->{
      title
    }
    }`
);

const DEAL_PRODUCTS = defineQuery(
  `*[_type == 'product' && status == 'hot'] | order(name asc){
    ...,"categories": categories[]->title
  }`
);

const PRODUCT_BY_SLUG_QUERY = defineQuery(
  `*[_type == "product" && slug.current == $slug][0]`
);

const BANNER_QUERY = defineQuery(`*[_type == "banner" && isActive == true && (!defined(isPopup) || isPopup == false)]{
  _id,
  title,
  image{
    asset,
    alt
  },
  description
}`);

const POPUP_BANNER_QUERY = defineQuery(`*[_type == "banner" && isActive == true && isPopup == true][0]{
  _id,
  title,
  image{
    asset,
    alt
  },
  description,
  popupFrequency
}`);

const BRAND_QUERY = defineQuery(`*[_type == "product" && slug.current == $slug]{
  "brandName": brand->title
  }`);

const MY_ORDERS_QUERY =
  defineQuery(`*[_type == 'order' && clerkUserId == $userId] | order(orderDate desc){
...,
products[]{
  ...,
  product->
},
shippingAddress{
  ...,
  province->,
  ward->
}
}`);
const GET_ALL_BLOG = defineQuery(
  `*[_type == 'blog'] | order(publishedAt desc)[0...$quantity]{
  ...,  
     blogcategories[]->{
    title
}
    }
  `
);

const SINGLE_BLOG_QUERY =
  defineQuery(`*[_type == "blog" && slug.current == $slug][0]{
  ..., 
    author->{
    name,
    image,
  },
  blogcategories[]->{
    title,
    "slug": slug.current,
  },
}`);

const BLOG_CATEGORIES = defineQuery(
  `*[_type == "blog"]{
     blogcategories[]->{
    ...
    }
  }`
);

// Categories query - Query lấy danh sách categories sản phẩm với số lượng sản phẩm
const CATEGORIES_QUERY = defineQuery(
  `*[_type == "category"] | order(title asc) {
    ...,
    "productCount": count(*[_type == "product" && references(^._id)])
  }`
);

const OTHERS_BLOG_QUERY = defineQuery(`*[
  _type == "blog"
  && defined(slug.current)
  && slug.current != $slug
]|order(publishedAt desc)[0...$quantity]{
...
  publishedAt,
  title,
  mainImage,
  slug,
  author->{
    name,
    image,
  },
  categories[]->{
    title,
    "slug": slug.current,
  }
}`);

const PROVINCES_QUERY = defineQuery(`*[_type == 'province'] | order(name asc)`);

const WARDS_BY_PROVINCE_QUERY = defineQuery(`*[_type == 'ward' && province->_id == $provinceId] | order(name asc)`);

// Reviews queries - Các query cho đánh giá sản phẩm
const REVIEWS_BY_PRODUCT_QUERY = defineQuery(
  `*[_type == "review" && product->_id == $productId && isApproved == true] | order(reviewDate desc){
    _id,
    customerName,
    rating,
    title,
    comment,
    verified,
    isRecommended,
    pros,
    cons,
    images,
    helpfulCount,
    reviewDate,
    adminResponse
  }`
);

const PRODUCT_REVIEW_STATS_QUERY = defineQuery(
  `*[_type == "review" && product->_id == $productId && isApproved == true]{
    rating
  }`
);

const CREATE_REVIEW_QUERY = defineQuery(
  `*[_type == "review" && product->_id == $productId && customerEmail == $email][0]`
);

const ALL_REVIEWS_QUERY = defineQuery(
  `*[_type == "review" && isApproved == true] | order(reviewDate desc)[0...$limit]{
    _id,
    customerName,
    rating,
    title,
    comment,
    verified,
    isRecommended,
    reviewDate,
    product->{
      _id,
      name,
      slug,
      images[0]
    }
  }`
);

// Query cho thống kê review nhanh trong ProductCard
const PRODUCT_REVIEW_SUMMARY_QUERY = defineQuery(
  `*[_type == "review" && product._ref == $productId && isApproved == true]{
    rating
  }`
);

export {
  BRANDS_QUERY,
  LATEST_BLOG_QUERY,
  DEAL_PRODUCTS,
  PRODUCT_BY_SLUG_QUERY,
  BANNER_QUERY,
  POPUP_BANNER_QUERY,
  BRAND_QUERY,
  MY_ORDERS_QUERY,
  GET_ALL_BLOG,
  SINGLE_BLOG_QUERY,
  BLOG_CATEGORIES,
  CATEGORIES_QUERY,
  OTHERS_BLOG_QUERY,
  PROVINCES_QUERY,
  WARDS_BY_PROVINCE_QUERY,
  REVIEWS_BY_PRODUCT_QUERY,
  PRODUCT_REVIEW_STATS_QUERY,
  CREATE_REVIEW_QUERY,
  ALL_REVIEWS_QUERY,
  PRODUCT_REVIEW_SUMMARY_QUERY,
};
