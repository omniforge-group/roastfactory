"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../../_components/AdminShell";

type Category = { id: string; name: string; sort_order: number };
type Werkproces = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category_id: string | null;
  werkprocessen_categories: Category | null;
};

export default function WerkprocessenBeheerPage() {
  return (
    <Suspense fallback={<AdminShell><div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div></AdminShell>}>
      <BeheerContent />
    </Suspense>
  );
}

function BeheerContent() {
  const router = useRouter();
  const [items, setItems] = useState<Werkproces[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  // Nieuw werkproces form
  const [showForm, setShowForm] = useState(false);
  const [fTitle, setFTitle] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fUrl, setFUrl] = useState("");
  const [fCategory, setFCategory] = useState("");
  const [fError, setFError] = useState("");
  const [fSaving, setFSaving] = useState(false);

  // Edit werkproces
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Nieuwe categorie form
  const [showCatForm, setShowCatForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catOrder, setCatOrder] = useState("");
  const [catSaving, setCatSaving] = useState(false);

  async function load() {
    const [itemsRes, catRes] = await Promise.all([
      fetch("/api/dashboard-sf-intern/werkprocessen"),
      fetch("/api/dashboard-sf-intern/werkprocessen/categories"),
    ]);
    if (itemsRes.status === 401) { router.push("/dashboard-sf-intern"); return; }
    if (itemsRes.status === 403) { setForbidden(true); setLoading(false); return; }
    const [itemsData, catData] = await Promise.all([itemsRes.json(), catRes.json()]);
    setItems(Array.isArray(itemsData) ? itemsData : []);
    setCategories(Array.isArray(catData) ? catData : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setFSaving(true); setFError("");
    const res = await fetch("/api/dashboard-sf-intern/werkprocessen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: fTitle, description: fDesc || null, url: fUrl, category_id: fCategory || null }),
    });
    const data = await res.json();
    if (!res.ok) { setFError(data.error || "Fout."); setFSaving(false); return; }
    setShowForm(false); setFTitle(""); setFDesc(""); setFUrl(""); setFCategory("");
    setFSaving(false); load();
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editId) return;
    setEditSaving(true);
    await fetch(`/api/dashboard-sf-intern/werkprocessen/${editId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDesc || null, url: editUrl, category_id: editCategory || null }),
    });
    setEditId(null); setEditSaving(false); load();
  }

  async function deleteItem(id: string) {
    if (!confirm("Dit werkproces verwijderen?")) return;
    await fetch(`/api/dashboard-sf-intern/werkprocessen/${id}`, { method: "DELETE" });
    load();
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setCatSaving(true);
    await fetch("/api/dashboard-sf-intern/werkprocessen/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: catName, sort_order: catOrder ? parseInt(catOrder) : 0 }),
    });
    setCatName(""); setCatOrder(""); setShowCatForm(false); setCatSaving(false); load();
  }

  async function deleteCategory(id: string) {
    if (!confirm("Categorie verwijderen? Werkprocessen in deze categorie worden niet verwijderd.")) return;
    await fetch("/api/dashboard-sf-intern/werkprocessen/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  if (forbidden) {
    return (
      <AdminShell>
        <div style={{ textAlign: "center", padding: 80, color: "#666" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div>Alleen admins hebben toegang tot deze pagina.</div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 64px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Werkprocessen beheren</h1>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setShowCatForm(v => !v)} style={secondaryBtn}>+ Categorie</button>
            <button onClick={() => setShowForm(v => !v)} style={primaryBtn}>+ Werkproces</button>
          </div>
        </div>

        {/* Categorieën */}
        {categories.length > 0 && (
          <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 14, padding: 20, marginBottom: 20 }}>
            <h2 style={sectionLabel}>Categorieën</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {categories.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", borderRadius: 8, padding: "6px 12px" }}>
                  <span style={{ fontSize: 13, color: "#ccc" }}>{c.name}</span>
                  <button onClick={() => deleteCategory(c.id)} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nieuwe categorie form */}
        {showCatForm && (
          <form onSubmit={createCategory} style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 14, padding: 20, marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <Field label="Naam categorie">
              <input value={catName} onChange={e => setCatName(e.target.value)} required placeholder="Muziek productie" style={{ ...inputStyle, width: 200 }} />
            </Field>
            <Field label="Volgorde">
              <input type="number" value={catOrder} onChange={e => setCatOrder(e.target.value)} placeholder="0" style={{ ...inputStyle, width: 80 }} />
            </Field>
            <button type="submit" disabled={catSaving} style={{ ...primaryBtn, marginBottom: 0 }}>{catSaving ? "Opslaan..." : "Aanmaken"}</button>
            <button type="button" onClick={() => setShowCatForm(false)} style={{ ...secondaryBtn, marginBottom: 0 }}>Annuleren</button>
          </form>
        )}

        {/* Nieuw werkproces form */}
        {showForm && (
          <form onSubmit={createItem} style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 14, padding: 24, marginBottom: 20 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 600, color: "#ccc" }}>Nieuw werkproces</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <Field label="Titel">
                <input value={fTitle} onChange={e => setFTitle(e.target.value)} required placeholder="Revisie protocol" style={inputStyle} />
              </Field>
              <Field label="Categorie">
                <select value={fCategory} onChange={e => setFCategory(e.target.value)} style={inputStyle}>
                  <option value="">Geen categorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="OneDrive URL">
                <input type="url" value={fUrl} onChange={e => setFUrl(e.target.value)} required placeholder="https://onedrive.live.com/..." style={inputStyle} />
              </Field>
              <Field label="Beschrijving (optioneel)">
                <input value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Korte omschrijving" style={inputStyle} />
              </Field>
            </div>
            {fError && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{fError}</div>}
            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" disabled={fSaving} style={primaryBtn}>{fSaving ? "Opslaan..." : "Aanmaken"}</button>
              <button type="button" onClick={() => setShowForm(false)} style={secondaryBtn}>Annuleren</button>
            </div>
          </form>
        )}

        {/* Werkprocessen lijst */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>
        ) : (
          <div style={{ background: "#111", borderRadius: 16, border: "1px solid #1f1f1f", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                  {["Titel", "Categorie", "URL", "Acties"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  editId === item.id ? (
                    <tr key={item.id}>
                      <td colSpan={4} style={{ padding: 16 }}>
                        <form onSubmit={saveEdit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <input value={editTitle} onChange={e => setEditTitle(e.target.value)} required style={inputStyle} />
                          <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={inputStyle}>
                            <option value="">Geen categorie</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <input type="url" value={editUrl} onChange={e => setEditUrl(e.target.value)} required style={inputStyle} />
                          <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Beschrijving" style={inputStyle} />
                          <div style={{ display: "flex", gap: 8, gridColumn: "1/-1" }}>
                            <button type="submit" disabled={editSaving} style={primaryBtn}>{editSaving ? "Opslaan..." : "Opslaan"}</button>
                            <button type="button" onClick={() => setEditId(null)} style={secondaryBtn}>Annuleren</button>
                          </div>
                        </form>
                      </td>
                    </tr>
                  ) : (
                    <tr key={item.id} style={{ borderBottom: i < items.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.title}</div>
                        {item.description && <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{item.description}</div>}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "#666" }}>
                        {item.werkprocessen_categories?.name ?? "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#a855f7", textDecoration: "none" }}>
                          OneDrive ↗
                        </a>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => { setEditId(item.id); setEditTitle(item.title); setEditDesc(item.description ?? ""); setEditUrl(item.url); setEditCategory(item.category_id ?? ""); }}
                            style={{ background: "none", border: "1px solid #333", color: "#888", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}
                          >
                            Bewerk
                          </button>
                          <button onClick={() => deleteItem(item.id)} style={{ background: "none", border: "1px solid #333", color: "#ef4444", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                            Verwijder
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 48, textAlign: "center", color: "#444", fontSize: 14 }}>Nog geen werkprocessen aangemaakt.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 10,
  padding: "10px 12px", color: "#ccc", fontSize: 14, outline: "none", boxSizing: "border-box",
};
const primaryBtn: React.CSSProperties = {
  background: "#a855f7", color: "#fff", border: "none", borderRadius: 8,
  padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer",
};
const secondaryBtn: React.CSSProperties = {
  background: "none", border: "1px solid #333", color: "#666", borderRadius: 8,
  padding: "10px 16px", fontSize: 14, cursor: "pointer",
};
const sectionLabel: React.CSSProperties = {
  margin: 0, fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
