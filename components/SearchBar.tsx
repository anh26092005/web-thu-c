"use client";

import { Search, Mic, Camera, Package, FileText, Loader2, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/sanity/lib/image";
import PriceFormatter from "./PriceFormatter";

// Interface cho kết quả tìm kiếm
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

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tìm kiếm với debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (query.trim().length > 0) {
        performSearch(query.trim());
      } else {
        setResults(null);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Xử lý phím bấm
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results || !isOpen) return;

    const totalItems = results.products.length + results.blogs.length;
    
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : -1
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > -1 ? prev - 1 : totalItems - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex === -1) {
          handleViewAll();
        } else {
          handleSelectItem(selectedIndex);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
        setIsOpen(true);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectItem = (index: number) => {
    if (!results) return;

    const productsCount = results.products.length;
    
    if (index < productsCount) {
      // Sản phẩm
      const product = results.products[index];
      router.push(`/product/${product.slug.current}`);
    } else {
      // Blog
      const blog = results.blogs[index - productsCount];
      router.push(`/blog/${blog.slug.current}`);
    }
    
    setIsOpen(false);
    setQuery("");
  };

  const handleViewAll = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className="relative mx-auto flex items-center w-full max-lg:w-1/2 max-md:w-full max-w-xl z-40">
      <div className="w-full bg-white border border-blue-300 rounded-full px-6 py-2 shadow-sm focus-within:border-blue-400 transition relative z-10">
        <div className="flex items-center">
          <Search className="text-gray-400 mr-3" size={20} />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results && results.total > 0) {
                setIsOpen(true);
              }
            }}
            placeholder="Tìm kiếm sản phẩm, bài viết..."
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-base"
          />

          {loading && (
            <Loader2 className="animate-spin text-blue-600 mr-2" size={18} />
          )}

          {query && !loading && (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 mr-2"
            >
              <X size={18} />
            </button>
          )}

          {/* <button type="button" className="ml-2 text-blue-600 hover:text-blue-800">
            <Mic size={20} />
          </button> */}
          {/* <button type="button" className="ml-2 text-blue-600 hover:text-blue-800">
            <Camera size={20} />
          </button> */}
        </div>
      

      {/* Dropdown kết quả tìm kiếm */}
      {isOpen && results && results.total > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-[9999] max-h-96 overflow-y-auto ring-1 ring-gray-100">
          {/* Sản phẩm */}
          {results.products.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-3">
                <Package size={16} />
                <span>Sản phẩm ({results.products.length})</span>
              </div>
              
              {results.products.map((product, index) => (
                <Link
                  key={product._id}
                  href={`/product/${product.slug.current}`}
                  onClick={() => setIsOpen(false)}
                  className={`block p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedIndex === index ? "bg-blue-50" : ""
                  } hover:opacity-80`}
                >
                  <div className="flex items-center gap-3">
                    {product.images?.[0] && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={urlFor(product.images[0]).url()}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <PriceFormatter 
                          amount={product.price} 
                          className="text-sm font-semibold text-shop_light_green"
                        />
                        {product.categories?.[0] && (
                          <span className="text-xs text-gray-500">
                            {product.categories[0].title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Đường phân cách */}
          {results.products.length > 0 && results.blogs.length > 0 && (
            <div className="border-t border-gray-100"></div>
          )}

          {/* Blog */}
          {results.blogs.length > 0 && (
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 mb-3">
                <FileText size={16} />
                <span>Bài viết ({results.blogs.length})</span>
              </div>
              
              {results.blogs.map((blog, index) => (
                <Link
                  key={blog._id}
                  href={`/blog/${blog.slug.current}`}
                  onClick={() => setIsOpen(false)}
                  className={`block p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    selectedIndex === results.products.length + index ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {blog.mainImage && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={urlFor(blog.mainImage).url()}
                          alt={blog.title}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {blog.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        {blog.author && <span>{blog.author.name}</span>}
                        {blog.readTime && (
                          <>
                            <span>•</span>
                            <span>{blog.readTime} phút đọc</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Xem tất cả */}
          <div className="border-t border-gray-100 p-4">
            <button
              onClick={handleViewAll}
              className={`w-full text-center py-2 px-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium ${
                selectedIndex === -1 ? "bg-blue-100" : ""
              }`}
            >
              Xem tất cả kết quả cho "{results.query}"
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SearchBar;
