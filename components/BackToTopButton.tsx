"use client";
import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const BackToTopButton = () => {
  // State để kiểm soát việc hiển thị nút
  const [visible, setVisible] = useState(false);

  // Theo dõi sự kiện cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hàm cuộn về đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Nếu chưa cuộn đủ xa thì không hiển thị nút
  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white border border-blue-400 shadow-lg text-blue-600 hover:bg-blue-50 hover:scale-110 transition"
      aria-label="Quay lại đầu trang"
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default BackToTopButton; 