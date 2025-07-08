import { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminCheck from "@/components/AdminCheck";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Admin Dashboard - Quản lý Website",
  description: "Trang quản trị website thuốc",
};

// Layout cho admin dashboard với bảo mật
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <AdminCheck>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <AdminHeader />
          
          <div className="flex flex-1">
            {/* Sidebar */}
            <AdminSidebar />
            
            {/* Main content */}
            <main className="flex-1 p-6 overflow-auto">
              <div className="w-full mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AdminCheck>
    </ClerkProvider>
  );
} 