import { cookies } from "next/headers";
import AdminNav from "./_components/AdminNav";

function isAuthed(): boolean {
  const token = cookies().get("admin-token")?.value;
  const secret = process.env.ADMIN_SECRET_TOKEN;
  return !!token && !!secret && token === secret;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = isAuthed();

  // Login page: render without nav shell
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "system-ui, sans-serif" }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", fontFamily: "system-ui, sans-serif", color: "#fff" }}>
      <header style={{ background: "#111111", borderBottom: "2px solid #FF2D2D", padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 54 }}>
          <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: -0.5, whiteSpace: "nowrap" }}>
            🔥 ROASTFACTORY ADMIN
          </span>
          <AdminNav />
        </div>
      </header>
      {children}
    </div>
  );
}
