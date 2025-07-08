"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { Bell, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Component header cho admin dashboard
export default function AdminHeader() {
  const { user } = useUser();
  const adminEmail = "anhdlcwk@gmail.com";
  
  const isAuthorizedAdmin = user?.primaryEmailAddress?.emailAddress === adminEmail ||
                           user?.emailAddresses?.[0]?.emailAddress === adminEmail;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Admin info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-gray-900">Admin Panel</span>
            {isAuthorizedAdmin && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                Truy cập được ủy quyền
              </Badge>
            )}
          </div>
          
          {user && (
            <div className="text-sm text-gray-600">
              Chào mừng, <span className="font-medium">{user.firstName || "Admin"}</span>
            </div>
          )}
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center gap-4">
          {/* Notification button */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              2
            </span>
          </Button>

          {/* Settings button */}
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>

          {/* User profile */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </p>
                <p className="text-xs text-gray-500">
                  {user.emailAddresses?.[0]?.emailAddress}
                </p>
              </div>
            )}
            
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
} 