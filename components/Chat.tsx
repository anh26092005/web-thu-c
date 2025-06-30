"use client";

import { useEffect } from "react";

const Chat = () => {
  useEffect(() => {
    // Tạo script element cho Tawk.to
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = "https://embed.tawk.to/684bc98eb25605190dae122a/default";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    // Gắn script vào đầu trang
    const s0 = document.getElementsByTagName("script")[0];
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.body.appendChild(s1);
    }

    // Cleanup: Xóa script khi component unmount
    return () => {
      s1.remove();
    };
  }, []);

  return null; // Không render gì ra giao diện
};


export default Chat;