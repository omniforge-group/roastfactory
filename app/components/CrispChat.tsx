"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    $crisp: unknown[];
    CRISP_WEBSITE_ID: string;
  }
}

const ADMIN_PATTERNS = [/^\/dashboard-sf-intern/, /\/admin(\/|$)/];

export default function CrispChat() {
  const pathname = usePathname();

  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
    if (!id) return;
    if (ADMIN_PATTERNS.some((re) => re.test(pathname))) return;
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = id;
    const s = document.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    document.head.appendChild(s);
  }, [pathname]);

  return null;
}
