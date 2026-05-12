"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "../_components/AdminShell";

type Category = { id: string; name: string; sort_order: number };
type Werkproces = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category_id: string | null;
  werkprocessen_categories: Category | null;
};

export default function WerkprocessenPage() {
  return (
    <Suspense fallback={<AdminShell><div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div></AdminShell>}>
      <WerkprocessenContent />
    </Suspense>
  );
}

function WerkprocessenContent() {
  const router = useRouter();
  const [items, setItems] = useState<Werkproces[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/me").then(r => r.ok ? r.json() : null).then(d => { if (d?.role) setRole(d.role); });
  }, []);

  useEffect(() => {
    fetch("/api/admin/werkprocessen")
      .then(r => {
        if (r.status === 401) { router.push("/dashboard-sf-intern"); return null; }
        if (r.status === 403) { setForbidden(true); setLoading(false); return null; }
        return r.json();
      })
      .then(d => { if (d) { setItems(Array.isArray(d) ? d : []); setLoading(false); } });
  }, [router]);

  if (forbidden) {
    return (
      <AdminShell>
        <div style={{ textAlign: "center", padding: 80, color: "#666" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div>Alleen tier2 en admins hebben toegang tot deze pagina.</div>
        </div>
      </AdminShell>
    );
  }

  // Groepeer per categorie
  const grouped = new Map<string, { category: Category | null; items: Werkproces[] }>();
  const uncategorized: Werkproces[] = [];
  for (const item of items) {
    if (!item.category_id || !item.werkprocessen_categories) {
      uncategorized.push(item);
    } else {
      const key = item.category_id;
      if (!grouped.has(key)) grouped.set(key, { category: item.werkprocessen_categories, items: [] });
      grouped.get(key)!.items.push(item);
    }
  }
  const sortedGroups = Array.from(grouped.values()).sort(
    (a, b) => (a.category?.sort_order ?? 0) - (b.category?.sort_order ?? 0)
  );
  if (uncategorized.length > 0) sortedGroups.push({ category: null, items: uncategorized });

  return (
    <AdminShell>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Werkprocessen</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{items.length} documenten</p>
          </div>
          {role === "admin" && (
            <Link
              href="/dashboard-sf-intern/werkprocessen/beheer"
              style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899,#a855f7)", color: "#fff", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: 700, textDecoration: "none" }}
            >
              Beheer
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64, fontSize: 14 }}>Nog geen werkprocessen toegevoegd.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {sortedGroups.map(({ category, items: groupItems }) => (
              <div key={category?.id ?? "uncategorized"}>
                <h2 style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {category?.name ?? "Overig"}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {groupItems.map(item => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 14, padding: "20px 20px 16px", cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#a855f7"; (e.currentTarget as HTMLDivElement).style.background = "#161616"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1f1f1f"; (e.currentTarget as HTMLDivElement).style.background = "#111"; }}
                      >
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{item.title}</div>
                        {item.description && (
                          <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5, marginBottom: 10 }}>{item.description}</div>
                        )}
                        <div style={{ fontSize: 11, color: "#a855f7" }}>OneDrive openen →</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
