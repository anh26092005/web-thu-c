import { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: "Admin Dashboard - Quản lý Website",
  description: "Trang quản trị website thuốc",
};

// Layout cho admin dashboard
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader />
      
      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main content */}
        <div className=" p-6 m-0">
          <div className="w-full mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 