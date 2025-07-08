"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Container from "@/components/Container";
import Title from "@/components/Title";
import ProductCardWrapper from "@/components/ProductCardWrapper";
import { Search, Package, FileText, Filter, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import PriceFormatter from "@/components/PriceFormatter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Interface như trong SearchBar
interface SearchProduct {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  discount?: number;
  images?: Array<{ asset: { url: string } }>;
  categories?: Array<{ title: string }>;
  brand?: { name: string };
  stock: number;
  status?: string;
}

interface SearchBlog {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt: string;
  mainImage?: { asset: { url: string } };
  author?: { name: string };
  blogcategories?: Array<{ title: string }>;
  readTime?: number;
}

interface SearchResults {
  products: SearchProduct[];
  blogs: SearchBlog[];
  total: number;
  query: string;
}

// Loading component
const SearchLoading = () => (
  <div className="bg-[#f1f3f8] min-h-screen">
    <Container className="py-10">
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải trang tìm kiếm...</p>
        </div>
      </div>
    </Container>
  </div>
);

// Component trang kết quả tìm kiếm
const SearchContent = () => {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";
  
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (query.trim()) {
      performSearch(query.trim());
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="bg-[#f1f3f8] min-h-screen">
        <Container className="py-10">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Đang tìm kiếm...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-[#f1f3f8] min-h-screen">
        <Container className="py-10">
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nhập từ khóa để tìm kiếm
            </h2>
            <p className="text-gray-600">
              Tìm kiếm sản phẩm, bài viết và nhiều thứ khác
            </p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f3f8] min-h-screen">
      <Container className="py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-6 w-6 text-blue-600" />
            <Title className="text-2xl font-bold text-gray-900">
              Kết quả tìm kiếm
            </Title>
          </div>
          
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              Tìm thấy <span className="font-semibold text-blue-600">{results.total}</span> kết quả cho:
            </p>
            <Badge variant="secondary" className="text-base px-3 py-1">
              "{results.query}"
            </Badge>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="w-full">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 max-w-md">
            <button
              onClick={() => setActiveTab("all")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "all" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Tất cả ({results.total})
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "products" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Package className="h-4 w-4 mr-2" />
              Sản phẩm ({results.products.length})
            </button>
            <button
              onClick={() => setActiveTab("blogs")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === "blogs" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Bài viết ({results.blogs.length})
            </button>
          </div>

          {/* Tab All */}
          {activeTab === "all" && (
            <div className="mt-6 space-y-8">
              {/* Sản phẩm */}
              {results.products.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sản phẩm ({results.products.length})
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {results.products.slice(0, 8).map((product) => (
                      <ProductCardWrapper key={product._id} product={product as any} />
                    ))}
                  </div>
                  
                  {results.products.length > 8 && (
                    <div className="text-center mt-6">
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab("products")}
                      >
                        Xem tất cả {results.products.length} sản phẩm
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Blog */}
              {results.blogs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Bài viết ({results.blogs.length})
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.blogs.slice(0, 6).map((blog) => (
                      <Card key={blog._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <Link href={`/blog/${blog.slug.current}`}>
                          {blog.mainImage && (
                            <div className="h-48 overflow-hidden">
                              <Image
                                src={urlFor(blog.mainImage).url()}
                                alt={blog.title}
                                width={400}
                                height={200}
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                              />
                            </div>
                          )}
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {blog.title}
                            </h4>
                            {blog.excerpt && (
                              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                                {blog.excerpt}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-2">
                                {blog.author && <span>{blog.author.name}</span>}
                                {blog.readTime && (
                                  <>
                                    <span>•</span>
                                    <span>{blog.readTime} phút đọc</span>
                                  </>
                                )}
                              </div>
                              <span>{formatDate(blog.publishedAt)}</span>
                            </div>
                          </CardContent>
                        </Link>
                      </Card>
                    ))}
                  </div>
                  
                  {results.blogs.length > 6 && (
                    <div className="text-center mt-6">
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab("blogs")}
                      >
                        Xem tất cả {results.blogs.length} bài viết
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab Sản phẩm */}
          {activeTab === "products" && (
            <div className="mt-6">
              {results.products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.products.map((product) => (
                    <ProductCardWrapper key={product._id} product={product as any} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy sản phẩm nào
                  </h3>
                  <p className="text-gray-600">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab Bài viết */}
          {activeTab === "blogs" && (
            <div className="mt-6">
              {results.blogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.blogs.map((blog) => (
                    <Card key={blog._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <Link href={`/blog/${blog.slug.current}`}>
                        {blog.mainImage && (
                          <div className="h-48 overflow-hidden">
                            <Image
                              src={urlFor(blog.mainImage).url()}
                              alt={blog.title}
                              width={400}
                              height={200}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {blog.title}
                          </h4>
                          {blog.excerpt && (
                            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                              {blog.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              {blog.author && <span>{blog.author.name}</span>}
                              {blog.readTime && (
                                <>
                                  <span>•</span>
                                  <span>{blog.readTime} phút đọc</span>
                                </>
                              )}
                            </div>
                            <span>{formatDate(blog.publishedAt)}</span>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Không tìm thấy bài viết nào
                  </h3>
                  <p className="text-gray-600">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

const SearchPage = () => {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
};

export default SearchPage; 