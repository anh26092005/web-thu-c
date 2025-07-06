import React, { FC } from "react";
import Logo from "./Logo";
import { X } from "lucide-react";
import { headerData } from "@/constants/data";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SocialMedia from "./SocialMedia";
import { useOutsideClick } from "@/hooks";
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SideMenu: FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const sidebarRef = useOutsideClick<HTMLDivElement>(onClose);
  return (
    <div
      className={`fixed inset-y-0 h-screen left-0 z-500 w-full text-black/70 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } hoverEffect`}
    >
      <div
        ref={sidebarRef}
        className="min-w-72 max-w-96 bg-white shadow-xl h-screen p-10 border-r border-r-shop_light_green flex flex-col gap-6"
      >
        <div className="flex items-center justify-between gap-5">
          <Logo className="text-black" spanDesign="group-hover:text-black" />
          <button
            onClick={onClose}
            className="hover:text-shop_light_green hoverEffect"
          >
            <X />
          </button>
        </div>

        <div className="flex flex-col space-y-3.5 font-semibold tracking-wide">
          {headerData?.map((item) => (
            <Link
              href={item?.href}
              key={item?.title}
              className={`hover:text-shop_light_green hoverEffect ${
                pathname === item?.href && "text-black"
              }`}
            >
              {item?.title}
            </Link>
          ))}
        </div>
        <SocialMedia />
      </div>
    </div>
  );
};

export default SideMenu;
