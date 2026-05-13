"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/dashboard-sf-intern/auth/logout", { method: "POST" });
    router.push("/dashboard-sf-intern/login");
    router.refresh();
  }

  const active = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")
      ? { background: "#FF2D2D", color: "#fff", fontWeight: 700 }
      : { background: "transparent", color: "#555", fontWeight: 400 };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <nav style={{ display: "flex", gap: 2 }}>
        <Link href="/dashboard-sf-intern" style={{ padding: "5px 13px", borderRadius: 7, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap", ...active("/dashboard-sf-intern") }}>
          🔥 Bestellingen
        </Link>
      </nav>
      <button
        onClick={logout}
        style={{ background: "transparent", border: "1px solid #333", borderRadius: 7, padding: "5px 14px", color: "#555", fontSize: 13, cursor: "pointer" }}
      >
        Uitloggen
      </button>
    </div>
  );
}
