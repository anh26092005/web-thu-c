"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Star,
  FileText,
  BarChart,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

// Sidebar component cho admin
export default function AdminSidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["dashboard"]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      items: [],
    },
    {
      id: "products",
      title: "Sản phẩm",
      icon: Package,
      href: "/admin/products",
      items: [
        { title: "Danh sách", href: "/admin/products" },
        { title: "Thêm mới", href: "/studio/structure/product" },
        { title: "Danh mục", href: "/studio/structure/category" },
        { title: "Thương hiệu", href: "/studio/structure/brand" },
      ],
    },
    {
      id: "orders",
      title: "Đơn hàng",
      icon: ShoppingCart,
      href: "/admin/orders",
      items: [
        { title: "Tất cả đơn hàng", href: "/studio/structure/order"},
        { title: "Chờ xử lý", href: "/studio/structure/order?status=pending" },
        { title: "Đang giao", href: "/studio/structure/order?status=shipped" },
        { title: "Đã hoàn thành", href: "/studio/structure/order?status=delivered" },
      ],
    },
    {
      id: "reviews",
      title: "Đánh giá",
      icon: Star,
      href: "/admin/reviews",
      items: [
        { title: "Tất cả đánh giá", href: "/admin/reviews" },
        { title: "Chờ duyệt", href: "/admin/reviews?status=pending" },
        { title: "Đã duyệt", href: "/admin/reviews?status=approved" },
      ],
    },
    {
      id: "blog",
      title: "Blog",
      icon: FileText,
      href: "/admin/blog",
      items: [
        { title: "Danh mục", href: "/admin/blog/categories" },
      ],
    },
    {
      id: "analytics",
      title: "Thống kê",
      icon: BarChart,
      href: "/admin/analytics",
      items: [],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const isExpanded = expandedMenus.includes(item.id);
            const hasItems = item.items.length > 0;

            return (
              <div key={item.id}>
                {hasItems ? (
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between h-auto p-3",
                      isActive && "bg-blue-50 text-blue-700"
                    )}
                    onClick={() => toggleMenu(item.id)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                ) : (
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-auto p-3",
                        isActive && "bg-blue-50 text-blue-700"
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{item.title}</span>
                    </Button>
                  </Link>
                )}

                {hasItems && isExpanded && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.items.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link key={subItem.href} href={subItem.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-sm font-normal",
                              isSubActive && "bg-blue-50 text-blue-700"
                            )}
                          >
                            {subItem.title}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
} 