"use client";
import { useEffect, useState, useMemo, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AdminShell from "../_components/AdminShell";

type Order = {
  id: string;
  created_at: string;
  paid_at: string | null;
  customer_name: string | null;
  customer_email: string | null;
  recipient_name: string | null;
  occasion: string | null;
  style: string | null;
  payment_status: string | null;
  generation_status: string | null;
  delivered_at: string | null;
  amount_total: number | null;
  amount_subtotal: number | null;
  discount_code: string | null;
  revision_count: number;
  order_status: string | null;
  archived_at: string | null;
  archive_folder: string | null;
  internal_notes: string | null;
};

const ORDER_STATUSES = [
  "Nieuw", "In productie", "Gereed", "Verstuurd",
  "Revisie gevraagd", "Revisie verstuurd", "Afgerond", "Betaling niet afgerond",
];

function getPaymentBadge(order: Order): { label: string; color: string } {
  if (order.order_status === "Betaling niet afgerond") return { label: "Betaling niet afgerond", color: "#ef4444" };
  if (order.paid_at) {
    const done = order.order_status === "Afgerond" || order.order_status === "Verstuurd";
    return done ? { label: "Betaald", color: "#22c55e" } : { label: "In behandeling", color: "#f59e0b" };
  }
  return { label: "Niet betaald", color: "#ef4444" };
}

const ARCHIVE_FOLDERS = ["Afgerond", "Geannuleerd", "Niet betaald", "Revisie nodig"];
const FILTER_LABELS: Record<string, string> = {
  open: "Open (actief)",
  month: "Deze maand",
  revisies: "Met revisies",
};

export default function OrdersPage() {
  return (
    <Suspense fallback={<AdminShell><div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div></AdminShell>}>
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter") ?? "";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "archive">("active");
  const [archiveFolder, setArchiveFolder] = useState<string>("Alle");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Bulk
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkFolder, setBulkFolder] = useState<string>(ARCHIVE_FOLDERS[0]);
  const [bulkSuccess, setBulkSuccess] = useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Notes modal
  const [notesOrderId, setNotesOrderId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);

  const load = useCallback(() => {
    fetch("/api/admin/orders")
      .then(r => { if (r.status === 401) router.push("/dashboard-sf-intern"); return r.json(); })
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { fetch("/api/admin/me").then(r => r.ok ? r.json() : null).then(d => { if (d?.role) setRole(d.role); }); }, []);
  useEffect(() => { setSelected(new Set()); }, [tab]);

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = selected.size > 0 && selected.size < displayed.length;
  });

  async function updateStatus(id: string, order_status: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, order_status } : o));
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, order_status }) });
  }

  async function archiveOrder(id: string, folder: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, archived_at: new Date().toISOString(), archive_folder: folder } : o));
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, archive_folder: folder }) });
  }

  async function unarchiveOrder(id: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, archived_at: null, archive_folder: null } : o));
    await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, unarchive: true }) });
  }

  async function deleteOrder(id: string) {
    setOrders(prev => prev.filter(o => o.id !== id));
    setConfirmDelete(null);
    await fetch("/api/admin/orders", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  }

  async function bulkArchive() {
    const ids = [...selected];
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => ids.includes(o.id) ? { ...o, archived_at: now, archive_folder: bulkFolder } : o));
    setSelected(new Set());
    await Promise.all(ids.map(id => fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, archive_folder: bulkFolder }) })));
    setBulkSuccess(`${ids.length} order${ids.length !== 1 ? "s" : ""} gearchiveerd naar "${bulkFolder}"`);
    setTimeout(() => setBulkSuccess(null), 4000);
  }

  async function bulkDelete() {
    const ids = [...selected];
    setOrders(prev => prev.filter(o => !ids.includes(o.id)));
    setSelected(new Set());
    setConfirmBulkDelete(false);
    await fetch("/api/admin/orders", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
    setBulkSuccess(`${ids.length} order${ids.length !== 1 ? "s" : ""} permanent verwijderd`);
    setTimeout(() => setBulkSuccess(null), 4000);
  }

  async function saveNotes() {
    if (!notesOrderId) return;
    setNotesSaving(true);
    setOrders(prev => prev.map(o => o.id === notesOrderId ? { ...o, internal_notes: notesText } : o));
    await fetch("/api/admin/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: notesOrderId, internal_notes: notesText || null }) });
    setNotesOrderId(null);
    setNotesSaving(false);
  }

  function exportCSV() {
    const cols = ["ID", "Klant", "Email", "Datum", "Betaald op", "Bedrag", "Status", "Revisies", "Korting", "Archief"];
    const rows = displayed.map(o => [
      o.id,
      o.customer_name ?? "",
      o.customer_email ?? "",
      new Date(o.created_at).toLocaleDateString("nl-NL"),
      o.paid_at ? new Date(o.paid_at).toLocaleDateString("nl-NL") : "",
      o.amount_total != null ? (o.amount_total / 100).toFixed(2) : "0.00",
      o.order_status ?? "Nieuw",
      String(o.revision_count),
      o.discount_code ?? "",
      o.archive_folder ?? "",
    ].map(v => `"${v.replace(/"/g, '""')}"`).join(","));
    const csv = [cols.join(","), ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAll() {
    setSelected(prev => prev.size === displayed.length ? new Set() : new Set(displayed.map(o => o.id)));
  }

  const active = useMemo(() => {
    let list = orders.filter(o => !o.archived_at);
    if (filter === "open") list = list.filter(o => o.payment_status === "paid" && !["Afgerond", "Verstuurd", "Betaling niet afgerond"].includes(o.order_status ?? ""));
    if (filter === "month") { const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1); list = list.filter(o => o.payment_status === "paid" && new Date(o.created_at) >= start); }
    if (filter === "revisies") list = list.filter(o => o.revision_count > 0);
    if (statusFilter) list = list.filter(o => (o.order_status ?? "Nieuw") === statusFilter);
    if (search) { const q = search.toLowerCase(); list = list.filter(o => (o.customer_name ?? "").toLowerCase().includes(q) || (o.customer_email ?? "").toLowerCase().includes(q) || (o.recipient_name ?? "").toLowerCase().includes(q)); }
    return list;
  }, [orders, filter, statusFilter, search]);

  const archived = useMemo(() => {
    let list = orders.filter(o => !!o.archived_at);
    if (archiveFolder !== "Alle") list = list.filter(o => o.archive_folder === archiveFolder);
    if (search) { const q = search.toLowerCase(); list = list.filter(o => (o.customer_name ?? "").toLowerCase().includes(q) || (o.customer_email ?? "").toLowerCase().includes(q)); }
    return list;
  }, [orders, archiveFolder, search]);

  const displayed = tab === "active" ? active : archived;
  const allSelected = displayed.length > 0 && selected.size === displayed.length;

  return (
    <AdminShell>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px 48px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
              Orders
              {tab === "active" && filter && FILTER_LABELS[filter]
                ? <span style={{ fontSize: 14, fontWeight: 400, color: "#a855f7", marginLeft: 10 }}>{FILTER_LABELS[filter]}</span>
                : null}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{displayed.length} orders</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {tab === "active" && (
              <>
                <Stat label="Betaald" value={orders.filter(o => !o.archived_at && o.payment_status === "paid").length} color="#22c55e" />
                <Stat label="Geleverd" value={orders.filter(o => !o.archived_at && o.delivered_at).length} color="#a855f7" />
                <Stat label="Met korting" value={orders.filter(o => !o.archived_at && o.discount_code).length} color="#f59e0b" />
              </>
            )}
            <button onClick={exportCSV} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer" }}>
              ↓ CSV
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: "1px solid #1f1f1f" }}>
          {(["active", "archive"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 18px", fontSize: 14, fontWeight: 600, color: tab === t ? "#fff" : "#555", borderBottom: tab === t ? "2px solid #a855f7" : "2px solid transparent", marginBottom: -1 }}>
              {t === "active" ? `Actief (${orders.filter(o => !o.archived_at).length})` : `Archief (${orders.filter(o => !!o.archived_at).length})`}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek op naam of e-mail…"
            style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 10, padding: "8px 14px", color: "#ccc", fontSize: 13, outline: "none", flex: "1 1 200px", minWidth: 180 }}
          />
          {tab === "active" && (
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ background: "#111", border: "1px solid #2a2a2a", color: "#ccc", borderRadius: 10, padding: "8px 12px", fontSize: 13, cursor: "pointer" }}>
              <option value="">Alle statussen</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          {tab === "archive" && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Alle", ...ARCHIVE_FOLDERS].map(f => (
                <button key={f} onClick={() => setArchiveFolder(f)} style={{ background: archiveFolder === f ? "#a855f7" : "#1a1a1a", border: "1px solid #2a2a2a", color: archiveFolder === f ? "#fff" : "#888", borderRadius: 8, padding: "5px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{f}</button>
              ))}
            </div>
          )}
        </div>

        {/* Bulk actiebalk */}
        {selected.size > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: "#1a1a2e", border: "1px solid #a855f7", borderRadius: 12, padding: "12px 16px", marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#a855f7", flexShrink: 0 }}>
              {selected.size} order{selected.size !== 1 ? "s" : ""} geselecteerd
            </span>
            {tab === "active" && (
              <>
                <select value={bulkFolder} onChange={e => setBulkFolder(e.target.value)} style={{ background: "#0f0f1a", border: "1px solid #a855f7", color: "#ccc", borderRadius: 8, padding: "6px 10px", fontSize: 13, cursor: "pointer" }}>
                  {ARCHIVE_FOLDERS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <button onClick={bulkArchive} style={{ background: "linear-gradient(135deg,#a855f7,#ec4899)", border: "none", color: "#fff", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                  Archiveer selectie
                </button>
              </>
            )}
            {role === "admin" && (
              <button onClick={() => setConfirmBulkDelete(true)} style={{ background: "none", border: "1px solid #7f1d1d", color: "#ef4444", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", flexShrink: 0 }}>
                Verwijder selectie
              </button>
            )}
            <button onClick={() => setSelected(new Set())} style={{ background: "none", border: "1px solid #333", color: "#666", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", marginLeft: "auto", flexShrink: 0 }}>
              Deselecteer alles
            </button>
          </div>
        )}

        {bulkSuccess && (
          <div style={{ background: "#0f2a1a", border: "1px solid #166534", borderRadius: 10, padding: "10px 16px", marginBottom: 12, fontSize: 13, color: "#86efac", fontWeight: 600 }}>
            ✓ {bulkSuccess}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: "center", color: "#444", padding: 48, fontSize: 14 }}>Geen orders gevonden.</div>
        ) : (
          <>
            {/* Desktop tabel */}
            <div className="orders-desktop">
              <div style={{ background: "#111", borderRadius: 16, border: "1px solid #1f1f1f", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                      <th style={{ padding: "12px 8px 12px 16px", width: 36 }}>
                        <input ref={selectAllRef} type="checkbox" checked={allSelected} onChange={toggleSelectAll} style={{ width: 16, height: 16, accentColor: "#a855f7", cursor: "pointer" }} />
                      </th>
                      {["Klant", "Datum", "Betaald", "Order status", "Rev.", tab === "archive" ? "Map" : "Acties", ""].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map((order, i) => {
                      const isSelected = selected.has(order.id);
                      return (
                        <tr key={order.id} style={{ borderBottom: i < displayed.length - 1 ? "1px solid #1a1a1a" : "none", background: isSelected ? "rgba(168,85,247,0.07)" : "transparent" }}
                          onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#161616"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = isSelected ? "rgba(168,85,247,0.07)" : "transparent"; }}>
                          <td style={{ padding: "12px 8px 12px 16px" }}>
                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(order.id)} style={{ width: 16, height: 16, accentColor: "#a855f7", cursor: "pointer" }} />
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{order.customer_name || "—"}</div>
                            <div style={{ fontSize: 12, color: "#666" }}>{order.customer_email || "—"}</div>
                            {order.internal_notes && (
                              <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 2, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                📝 {order.internal_notes}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#666" }}>{new Date(order.created_at).toLocaleDateString("nl-NL")}</td>
                          <td style={{ padding: "12px 16px" }}><PaymentCell order={order} /></td>
                          <td style={{ padding: "12px 16px" }}>
                            {tab === "active" ? (
                              <select value={order.order_status || "Nieuw"} onChange={e => updateStatus(order.id, e.target.value)} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#ccc", borderRadius: 8, padding: "5px 10px", fontSize: 13, cursor: "pointer" }}>
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            ) : (
                              <span style={{ fontSize: 13, color: "#888" }}>{order.order_status || "Nieuw"}</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: order.revision_count > 0 ? "#f59e0b" : "#444" }}>{order.revision_count}</td>
                          <td style={{ padding: "12px 16px" }}>
                            {tab === "active" ? (
                              <div style={{ display: "flex", gap: 6 }}>
                                <ArchiveMenu order={order} onArchive={archiveOrder} />
                                <button onClick={() => { setNotesOrderId(order.id); setNotesText(order.internal_notes ?? ""); }} style={{ background: "none", border: "1px solid #333", color: "#f59e0b", borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer" }}>📝</button>
                                {role === "admin" && (
                                  <button onClick={() => setConfirmDelete(order.id)} style={{ background: "none", border: "1px solid #7f1d1d", color: "#ef4444", borderRadius: 6, padding: "4px 8px", fontSize: 12, cursor: "pointer" }}>✕</button>
                                )}
                              </div>
                            ) : (
                              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ fontSize: 12, color: "#a855f7", fontWeight: 600 }}>{order.archive_folder || "—"}</span>
                                <button onClick={() => unarchiveOrder(order.id)} style={{ background: "none", border: "1px solid #333", color: "#888", borderRadius: 6, padding: "3px 8px", fontSize: 12, cursor: "pointer" }}>Herstel</button>
                                {role === "admin" && (
                                  <button onClick={() => setConfirmDelete(order.id)} style={{ background: "none", border: "1px solid #7f1d1d", color: "#ef4444", borderRadius: 6, padding: "3px 8px", fontSize: 12, cursor: "pointer" }}>Verwijder</button>
                                )}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <Link href={`/dashboard-sf-intern/orders/${order.id}`} style={{ fontSize: 13, color: "#a855f7", textDecoration: "none", fontWeight: 600 }}>→</Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobiele kaarten */}
            <div className="orders-mobile">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {displayed.map(order => {
                  const isSelected = selected.has(order.id);
                  return (
                    <div key={order.id} style={{ background: isSelected ? "rgba(168,85,247,0.08)" : "#111", borderRadius: 16, border: isSelected ? "1px solid #a855f7" : "1px solid #1f1f1f", padding: 16 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, cursor: "pointer" }}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(order.id)} style={{ width: 18, height: 18, accentColor: "#a855f7", cursor: "pointer", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: isSelected ? "#a855f7" : "#555", fontWeight: 600 }}>{isSelected ? "Geselecteerd" : "Selecteer"}</span>
                      </label>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{order.customer_name || "—"}</div>
                          <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{order.customer_email || "—"}</div>
                          {order.internal_notes && <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4 }}>📝 {order.internal_notes}</div>}
                        </div>
                        <div style={{ flexShrink: 0, marginLeft: 12 }}><PaymentCell order={order} /></div>
                      </div>
                      {tab === "active" && (
                        <div style={{ marginBottom: 10 }}>
                          <label style={{ fontSize: 11, color: "#555", display: "block", marginBottom: 4 }}>STATUS</label>
                          <select value={order.order_status || "Nieuw"} onChange={e => updateStatus(order.id, e.target.value)} style={{ width: "100%", background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#ccc", borderRadius: 8, padding: "10px 12px", fontSize: 14, cursor: "pointer" }}>
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      )}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                        <Chip label={new Date(order.created_at).toLocaleDateString("nl-NL")} />
                        {order.discount_code && <Chip label={order.discount_code} color="#f59e0b" />}
                        {order.revision_count > 0 && <Chip label={`${order.revision_count} rev.`} color="#f59e0b" />}
                        {order.delivered_at && <Chip label="Geleverd" color="#22c55e" />}
                        {tab === "archive" && order.archive_folder && <Chip label={order.archive_folder} color="#a855f7" />}
                      </div>
                      {tab === "active" && (
                        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                          <div style={{ flex: 1 }}><ArchiveMenu order={order} onArchive={archiveOrder} mobile /></div>
                          <button onClick={() => { setNotesOrderId(order.id); setNotesText(order.internal_notes ?? ""); }} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#f59e0b", borderRadius: 10, padding: "10px 14px", fontSize: 14, cursor: "pointer" }}>📝</button>
                          {role === "admin" && (
                            <button onClick={() => setConfirmDelete(order.id)} style={{ background: "#2a0f0f", border: "1px solid #7f1d1d", color: "#ef4444", borderRadius: 10, padding: "10px 14px", fontSize: 14, cursor: "pointer" }}>✕</button>
                          )}
                        </div>
                      )}
                      {tab === "archive" && (
                        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                          <button onClick={() => unarchiveOrder(order.id)} style={{ flex: 1, background: "#1a1a1a", border: "1px solid #333", color: "#ccc", borderRadius: 10, padding: 10, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Herstel</button>
                          {role === "admin" && (
                            <button onClick={() => setConfirmDelete(order.id)} style={{ flex: 1, background: "#2a0f0f", border: "1px solid #7f1d1d", color: "#ef4444", borderRadius: 10, padding: 10, fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Verwijder</button>
                          )}
                        </div>
                      )}
                      <Link href={`/dashboard-sf-intern/orders/${order.id}`} style={{ display: "block", textAlign: "center", background: "linear-gradient(135deg,#f59e0b,#ec4899,#a855f7)", color: "#fff", fontWeight: 700, fontSize: 14, padding: "12px 16px", borderRadius: 12, textDecoration: "none" }}>
                        Bekijken →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Verwijder 1 order */}
      {confirmDelete && (
        <Modal onClose={() => setConfirmDelete(null)}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: "#ef4444" }}>Order verwijderen</h2>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "#888", lineHeight: 1.6 }}>
            Weet je zeker dat je deze order permanent wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirmDelete(null)} style={cancelBtn}>Annuleren</button>
            <button onClick={() => deleteOrder(confirmDelete)} style={dangerBtn}>Verwijderen</button>
          </div>
        </Modal>
      )}

      {/* Bulk verwijderen */}
      {confirmBulkDelete && (
        <Modal onClose={() => setConfirmBulkDelete(false)}>
          <h2 style={{ margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: "#ef4444" }}>
            {selected.size} orders verwijderen
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "#888", lineHeight: 1.6 }}>
            Weet je zeker dat je {selected.size} orders permanent wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setConfirmBulkDelete(false)} style={cancelBtn}>Annuleren</button>
            <button onClick={bulkDelete} style={dangerBtn}>Verwijder {selected.size} orders</button>
          </div>
        </Modal>
      )}

      {/* Notities modal */}
      {notesOrderId && (
        <Modal onClose={() => setNotesOrderId(null)}>
          <h2 style={{ margin: "0 0 12px", fontSize: 17, fontWeight: 700 }}>Interne notitie</h2>
          <p style={{ margin: "0 0 12px", fontSize: 13, color: "#666" }}>Alleen zichtbaar voor het team, niet voor de klant.</p>
          <textarea
            value={notesText}
            onChange={e => setNotesText(e.target.value)}
            rows={4}
            placeholder="Bijv.: klant wil Nederlandse tekst, stem aanpassen…"
            style={{ width: "100%", background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 10, padding: "10px 12px", color: "#ccc", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 16 }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setNotesOrderId(null)} style={cancelBtn}>Annuleren</button>
            <button onClick={saveNotes} disabled={notesSaving} style={{ ...cancelBtn, background: "#a855f7", borderColor: "#a855f7", color: "#fff", fontWeight: 700 }}>
              {notesSaving ? "Opslaan…" : "Opslaan"}
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        .orders-desktop { display: block; }
        .orders-mobile  { display: none;  }
        @media (max-width: 700px) {
          .orders-desktop { display: none;  }
          .orders-mobile  { display: block; }
        }
      `}</style>
    </AdminShell>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}>
      <div style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 20, padding: "28px 24px", maxWidth: 400, width: "100%" }}>
        {children}
        <button onClick={onClose} style={{ position: "absolute", top: 0, right: 0, opacity: 0, pointerEvents: "none" }} />
      </div>
    </div>
  );
}

function PaymentCell({ order }: { order: Order }) {
  const { label, color } = getPaymentBadge(order);
  const amount = order.amount_total != null ? `€${(order.amount_total / 100).toFixed(2)}` : "€0.00";
  return (
    <div>
      <span style={{ fontSize: 12, fontWeight: 600, color, background: "rgba(255,255,255,0.05)", padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ fontSize: 11, color: order.paid_at ? "#666" : "#ef4444", marginTop: 4 }}>
        {amount}
        {order.amount_total === 0 && order.discount_code && <span style={{ marginLeft: 5, color: "#f59e0b", fontFamily: "monospace", fontWeight: 600 }}>{order.discount_code}</span>}
      </div>
    </div>
  );
}

function ArchiveMenu({ order, onArchive, mobile = false }: { order: Order; onArchive: (id: string, folder: string) => void; mobile?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(v => !v)} style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#888", borderRadius: 8, padding: mobile ? "10px 14px" : "4px 10px", fontSize: mobile ? 14 : 12, cursor: "pointer", width: mobile ? "100%" : "auto" }}>
        Archiveer →
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, zIndex: 10, minWidth: 170, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          {ARCHIVE_FOLDERS.map(f => (
            <button key={f} onClick={() => { onArchive(order.id, f); setOpen(false); }} style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", color: "#ccc", padding: "10px 16px", fontSize: 13, cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#2a2a2a")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 12, padding: "10px 16px", textAlign: "center", minWidth: 72 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Chip({ label, color = "#555" }: { label: string; color?: string }) {
  return <span style={{ fontSize: 12, color, background: "rgba(255,255,255,0.04)", border: "1px solid #2a2a2a", borderRadius: 6, padding: "3px 8px" }}>{label}</span>;
}

const cancelBtn: React.CSSProperties = { flex: 1, background: "#1a1a1a", border: "1px solid #333", color: "#ccc", borderRadius: 10, padding: 12, fontSize: 14, cursor: "pointer", fontWeight: 600 };
const dangerBtn: React.CSSProperties = { flex: 1, background: "#7f1d1d", border: "none", color: "#fff", borderRadius: 10, padding: 12, fontSize: 14, cursor: "pointer", fontWeight: 700 };
