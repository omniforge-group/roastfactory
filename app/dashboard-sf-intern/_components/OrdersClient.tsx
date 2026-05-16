"use client";
import { useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";

type Order = {
  id: string;
  created_at: string;
  status: string;
  package: string;
  price: number | null;
  amount_paid: number | null;
  discount_amount: number | null;
  discount_code: string | null;
  customer_name: string | null;
  customer_email: string;
  roast_target: string | null;
  occasion: string | null;
  roast_level: string | null;
  urgent: boolean | null;
  archived: boolean | null;
  archived_at: string | null;
  deleted_at: string | null;
};

type Tab = "actief" | "archived" | "trash";

const STATUS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:     { label: "Wacht op betaling", color: "#999999", bg: "#1a1a1a",  border: "#333333" },
  paid:        { label: "Betaald",           color: "#60A5FA", bg: "#0d1a2e",  border: "#1a3a6b" },
  in_progress: { label: "In behandeling",   color: "#FF6B00", bg: "#1e0e00",  border: "#4a2000" },
  delivered:   { label: "Afgeleverd",        color: "#22C55E", bg: "#061a0e",  border: "#16a34a" },
};

const PKG: Record<string, string> = {
  quick_roast: "Quick Roast",
  savage_pack: "Savage Pack",
  nuclear_pack: "Nuclear Pack",
  battle_mode: "Battle Mode",
};

const LEVEL: Record<string, string> = {
  mild: "Mild 😅", medium: "Medium 😬", savage: "Savage 🔥", nuclear: "Nuclear ☢️",
};

const COLS = "36px 120px 1fr 120px 100px 36px 185px 120px 80px";

function fmtEur(n: number | null | undefined) {
  if (n == null) return "—";
  return "€" + Number(n).toFixed(2).replace(".", ",");
}

function autoDeleteDate(deletedAt: string) {
  const d = new Date(deletedAt);
  d.setDate(d.getDate() + 7);
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function statusSelectStyle(status: string): React.CSSProperties {
  const s = STATUS[status] ?? STATUS.pending;
  return {
    color: s.color, background: s.bg, border: `1px solid ${s.border}`,
    borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 700,
    cursor: "pointer", fontFamily: "inherit", flex: 1, minWidth: 0,
  };
}

function PriceCell({ order }: { order: Order }) {
  const hasDiscount = (order.discount_amount ?? 0) > 0;
  const paid = order.amount_paid ?? order.price;
  if (!hasDiscount) {
    return <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00" }}>{fmtEur(order.price)}</span>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{ fontSize: 10, color: "#555", textDecoration: "line-through" }}>{fmtEur(order.price)}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#22C55E" }}>{fmtEur(paid)}</span>
      </div>
      {order.discount_code && (
        <span style={{ fontSize: 9, fontWeight: 700, color: "#FF6B00", background: "#FF6B0020", padding: "1px 5px", borderRadius: 4, letterSpacing: "0.08em", alignSelf: "flex-start" }}>
          {order.discount_code}
        </span>
      )}
    </div>
  );
}

export default function OrdersClient({
  initialOrders,
  fetchError,
}: {
  initialOrders: Order[];
  fetchError: boolean;
}) {
  const [activeTab, setActiveTab] = useState<Tab>("actief");
  const [tabCache, setTabCache] = useState<Record<Tab, Order[] | null>>({
    actief: initialOrders,
    archived: null,
    trash: null,
  });
  const [tabLoading, setTabLoading] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState<Record<string, "saving" | "saved" | null>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const touchStartX = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);

  const orders = tabCache[activeTab] ?? [];

  const filteredOrders = useMemo(() => {
    const q = query.toLowerCase().trim();
    return [...orders]
      .sort((a, b) => Number(b.urgent ?? false) - Number(a.urgent ?? false))
      .filter(o => {
        if (statusFilter !== "all" && o.status !== statusFilter) return false;
        if (!q) return true;
        return (
          (o.customer_name ?? "").toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          (o.roast_target ?? "").toLowerCase().includes(q) ||
          (PKG[o.package] ?? o.package).toLowerCase().includes(q) ||
          (o.discount_code ?? "").toLowerCase().includes(q)
        );
      });
  }, [orders, query, statusFilter]);

  const statNetto   = orders.filter(o => o.status !== "pending").reduce((s, o) => s + Number(o.amount_paid ?? o.price ?? 0), 0);
  const statBruto   = orders.filter(o => o.status !== "pending").reduce((s, o) => s + Number(o.price ?? 0), 0);
  const statKorting = orders.filter(o => o.status !== "pending").reduce((s, o) => s + Number(o.discount_amount ?? 0), 0);
  const statPaid    = orders.filter(o => o.status === "paid").length;
  const statProgress = orders.filter(o => o.status === "in_progress").length;
  const statDelivered = orders.filter(o => o.status === "delivered").length;

  const allSelected = filteredOrders.length > 0 && filteredOrders.every(o => selected.has(o.id));

  async function switchTab(tab: Tab) {
    setActiveTab(tab);
    setQuery("");
    setStatusFilter("all");
    setSelected(new Set());
    if (tabCache[tab] !== null) return;
    setTabLoading(true);
    const res = await fetch(`/api/dashboard-sf-intern/orders?tab=${tab === "actief" ? "active" : tab}`);
    if (res.ok) {
      const data: Order[] = await res.json();
      setTabCache(prev => ({ ...prev, [tab]: data }));
    }
    setTabLoading(false);
  }

  function refreshTab(tab: Tab) {
    setTabCache(prev => ({ ...prev, [tab]: null }));
    switchTab(tab);
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(filteredOrders.map(o => o.id)));
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setSaving(s => ({ ...s, [id]: "saving" }));
    await fetch(`/api/dashboard-sf-intern/orders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setTabCache(prev => ({ ...prev, [activeTab]: (prev[activeTab] ?? []).map(o => o.id === id ? { ...o, status: newStatus } : o) }));
    setSaving(s => ({ ...s, [id]: "saved" }));
    setTimeout(() => setSaving(s => ({ ...s, [id]: null })), 2000);
  }

  async function handleUrgent(id: string, current: boolean) {
    const newUrgent = !current;
    setTabCache(prev => ({ ...prev, [activeTab]: (prev[activeTab] ?? []).map(o => o.id === id ? { ...o, urgent: newUrgent } : o) }));
    await fetch(`/api/dashboard-sf-intern/orders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urgent: newUrgent }),
    });
  }

  const doAction = useCallback(async (id: string, updates: Record<string, unknown>, removeFromTab = true) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    await fetch(`/api/dashboard-sf-intern/orders/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (removeFromTab) {
      setTabCache(prev => ({ ...prev, [activeTab]: (prev[activeTab] ?? []).filter(o => o.id !== id) }));
      // Invalidate target tab so it re-fetches
      if (updates.archived !== undefined) setTabCache(prev => ({ ...prev, archived: null }));
      if (updates.deleted_at !== undefined && updates.deleted_at !== null) setTabCache(prev => ({ ...prev, trash: null }));
      if (updates.deleted_at === null) setTabCache(prev => ({ ...prev, actief: null }));
    }
    setActionLoading(prev => ({ ...prev, [id]: false }));
  }, [activeTab]);

  async function handleArchive(id: string) {
    await doAction(id, { archived: true, archived_at: new Date().toISOString() });
  }
  async function handleUnarchive(id: string) {
    await doAction(id, { archived: false, archived_at: null });
    setTabCache(prev => ({ ...prev, actief: null }));
  }
  async function handleMoveToTrash(id: string) {
    await doAction(id, { deleted_at: new Date().toISOString(), archived: false });
  }
  async function handleRestoreFromTrash(id: string) {
    await doAction(id, { deleted_at: null, archived: false });
    setTabCache(prev => ({ ...prev, actief: null }));
  }
  async function handlePermanentDelete(ids: string[]) {
    if (!confirm(`Weet je zeker dat je ${ids.length} bestelling${ids.length !== 1 ? "en" : ""} permanent wilt verwijderen? Dit kan niet ongedaan gemaakt worden.`)) return;
    await fetch("/api/dashboard-sf-intern/orders", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setTabCache(prev => ({ ...prev, trash: (prev.trash ?? []).filter(o => !ids.includes(o.id)) }));
    setSelected(new Set());
  }
  async function handleBulkTrash() {
    if (!confirm(`${selected.size} bestelling${selected.size !== 1 ? "en" : ""} naar de prullenbak verplaatsen?`)) return;
    const ids = Array.from(selected);
    await fetch("/api/dashboard-sf-intern/orders", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, // soft via PATCH batch not supported, do individual
      body: JSON.stringify({ ids }),
    });
    // Use individual PATCH for soft delete
    await Promise.all(ids.map(id =>
      fetch(`/api/dashboard-sf-intern/orders/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted_at: new Date().toISOString(), archived: false }),
      })
    ));
    setTabCache(prev => ({
      ...prev,
      [activeTab]: (prev[activeTab] ?? []).filter(o => !selected.has(o.id)),
      trash: null,
    }));
    setSelected(new Set());
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();
  }
  function onTouchEnd(e: React.TouchEvent, orderId: string, currentStatus: string) {
    if (touchStartX.current === null || touchStartTime.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaTime = Date.now() - touchStartTime.current;
    touchStartX.current = null; touchStartTime.current = null;
    if (deltaX > 100 && deltaTime < 500 && currentStatus === "paid") {
      handleStatusChange(orderId, "in_progress");
    }
  }

  const tabBtn = (tab: Tab, label: string) => (
    <button
      onClick={() => switchTab(tab)}
      style={{
        padding: "9px 20px", borderRadius: 8, border: "none", cursor: "pointer",
        fontWeight: 700, fontSize: 13, fontFamily: "inherit",
        background: activeTab === tab ? "#FF2D2D" : "#1a1a1a",
        color: activeTab === tab ? "#fff" : "#888",
        transition: "all 0.12s",
      }}
    >
      {label}
      {tab === "actief" && orders.length > 0 && (
        <span style={{ marginLeft: 6, background: "#FF2D2D33", color: "#FF6B00", borderRadius: 10, padding: "1px 6px", fontSize: 11 }}>
          {tabCache.actief?.length ?? 0}
        </span>
      )}
    </button>
  );

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 20px" }}>
      <style>{`
        .rf-row:hover { background: #1a0505 !important; }
        .rf-btn:hover { background: #cc0000 !important; }
        .rf-icon-btn:hover { opacity: 0.75 !important; }
        .rf-status-select { appearance: none; -webkit-appearance: none; }
        @media (max-width: 768px) {
          .rf-stats-grid { grid-template-columns: repeat(2,1fr) !important; }
          .rf-desktop { display: none !important; }
          .rf-mobile { display: flex !important; }
        }
        @media (min-width: 769px) { .rf-mobile { display: none !important; } }
      `}</style>

      {/* ── TABS ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabBtn("actief", "Actief")}
        {tabBtn("archived", "📦 Gearchiveerd")}
        {tabBtn("trash", "🗑️ Prullenbak")}
      </div>

      {/* ── STATS (alleen actief tab) ── */}
      {activeTab === "actief" && (
        <div className="rf-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { emoji: "💰", label: "Netto omzet",    value: fmtEur(statNetto),    color: "#22C55E" },
            { emoji: "📊", label: "Bruto omzet",    value: fmtEur(statBruto),    color: "#60A5FA" },
            { emoji: "🏷️", label: "Totaal kortingen", value: fmtEur(statKorting), color: "#FF6B00" },
            { emoji: "💳", label: "Nieuwe orders",  value: statPaid,             color: "#60A5FA" },
            { emoji: "⚙️", label: "In behandeling", value: statProgress,         color: "#FF6B00" },
            { emoji: "✅", label: "Afgeleverd",      value: statDelivered,        color: "#22C55E" },
          ].map(s => (
            <div key={s.label} style={{ background: "#111111", border: "1px solid #222222", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{s.emoji}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color, letterSpacing: -0.5, marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── ZOEKBALK + FILTER ── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Zoek op naam, email, roast target, pakket..."
          style={{
            flex: 1, minWidth: 200, padding: "10px 16px", borderRadius: 8,
            background: "#1a1a1a", color: "#fff", border: `1px solid ${query ? "#FF2D2D" : "#333"}`,
            fontSize: 14, fontFamily: "inherit", outline: "none",
            transition: "border-color 0.15s",
          }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 14px", borderRadius: 8, background: "#1a1a1a",
            color: "#fff", border: "1px solid #333", fontSize: 13,
            fontFamily: "inherit", cursor: "pointer",
          }}
        >
          <option value="all">Alle statussen</option>
          <option value="pending">Wacht op betaling</option>
          <option value="paid">Betaald</option>
          <option value="in_progress">In behandeling</option>
          <option value="delivered">Afgeleverd</option>
        </select>
      </div>

      {/* Resultaatteller + actieknoppen */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <div>
          <span style={{ fontSize: 13, color: "#555" }}>
            {filteredOrders.length} resultaten gevonden
            {tabLoading && <span style={{ marginLeft: 8, color: "#FF6B00" }}>Laden...</span>}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {selected.size > 0 && activeTab !== "trash" && (
            <button
              onClick={handleBulkTrash}
              style={{ background: "#8b0000", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              🗑 {selected.size} naar prullenbak
            </button>
          )}
          {selected.size > 0 && activeTab === "trash" && (
            <button
              onClick={() => handlePermanentDelete(Array.from(selected))}
              style={{ background: "#8b0000", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              ❌ {selected.size} definitief verwijderen
            </button>
          )}
        </div>
      </div>

      {fetchError && (
        <div style={{ background: "#1a0505", border: "1px solid #FF2D2D44", borderRadius: 10, padding: "12px 18px", marginBottom: 16, color: "#ff8888", fontSize: 14 }}>
          Fout bij ophalen van bestellingen.
        </div>
      )}

      {/* ── DESKTOP TABEL ── */}
      <div className="rf-desktop" style={{ background: "#111111", border: "1px solid #222222", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: COLS, padding: "10px 16px", borderBottom: "1px solid #222222", background: "#0d0d0d", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} style={{ cursor: "pointer", accentColor: "#FF2D2D", width: 15, height: 15 }} />
          {["Datum", "Klant", "Pakket / Prijs", "Voor wie", "🚩", "Status", "Acties", "Detail"].map(h => (
            <span key={h} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555" }}>{h}</span>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#555", fontSize: 14 }}>
            {tabLoading ? "Laden..." : "Geen bestellingen gevonden."}
          </div>
        )}

        {filteredOrders.map((order, i) => {
          const date = new Date(order.created_at).toLocaleString("nl-NL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
          const isSelected = selected.has(order.id);
          const isUrgent = !!order.urgent;
          const loading = actionLoading[order.id];
          return (
            <div
              key={order.id}
              className="rf-row"
              style={{
                display: "grid", gridTemplateColumns: COLS, gap: 8,
                padding: "11px 16px", borderBottom: i < filteredOrders.length - 1 ? "1px solid #1a1a1a" : "none",
                alignItems: "center", transition: "background 0.12s",
                background: isSelected ? "#1a0a0a" : isUrgent ? "#1a0800" : "transparent",
                borderLeft: isUrgent ? "3px solid #FF2D2D" : "3px solid transparent",
                opacity: loading ? 0.6 : 1,
              }}
            >
              <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(order.id)} style={{ cursor: "pointer", accentColor: "#FF2D2D", width: 15, height: 15 }} />
              <span style={{ fontSize: 11, color: "#555" }}>{date}</span>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>{order.customer_name || "—"}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{order.customer_email}</p>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00", marginBottom: 2 }}>{PKG[order.package] ?? order.package}</div>
                <PriceCell order={order} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{order.roast_target || "—"}</span>
              <button
                className="rf-icon-btn"
                onClick={() => handleUrgent(order.id, isUrgent)}
                title={isUrgent ? "Markering verwijderen" : "Markeer als urgent"}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1, opacity: isUrgent ? 1 : 0.2, filter: isUrgent ? "none" : "grayscale(1)", transition: "opacity 0.12s" }}
              >🚩</button>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <select className="rf-status-select" value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)} style={statusSelectStyle(order.status)}>
                  <option value="pending">Wacht op betaling</option>
                  <option value="paid">Betaald</option>
                  <option value="in_progress">In behandeling</option>
                  <option value="delivered">Afgeleverd</option>
                </select>
                {saving[order.id] === "saving" && <span style={{ fontSize: 11, color: "#555", flexShrink: 0 }}>…</span>}
                {saving[order.id] === "saved"  && <span style={{ fontSize: 14, color: "#22C55E", flexShrink: 0 }}>✓</span>}
              </div>

              {/* Actieknoppen per tab */}
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {activeTab === "actief" && (
                  <>
                    <button onClick={() => handleArchive(order.id)} title="Archiveer" disabled={loading}
                      style={{ background: "#1a1a1a", border: "1px solid #333", color: "#888", borderRadius: 6, padding: "5px 8px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                      📦 Archief
                    </button>
                    <button onClick={() => handleMoveToTrash(order.id)} title="Naar prullenbak" disabled={loading}
                      style={{ background: "#1a0505", border: "1px solid #8b000033", color: "#cc4444", borderRadius: 6, padding: "5px 8px", fontSize: 11, cursor: "pointer" }}>
                      🗑
                    </button>
                  </>
                )}
                {activeTab === "archived" && (
                  <>
                    <button onClick={() => handleUnarchive(order.id)} disabled={loading}
                      style={{ background: "#1a1a1a", border: "1px solid #333", color: "#60A5FA", borderRadius: 6, padding: "5px 8px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                      ↩ Herstel
                    </button>
                    <button onClick={() => handleMoveToTrash(order.id)} disabled={loading}
                      style={{ background: "#1a0505", border: "1px solid #8b000033", color: "#cc4444", borderRadius: 6, padding: "5px 8px", fontSize: 11, cursor: "pointer" }}>
                      🗑
                    </button>
                  </>
                )}
                {activeTab === "trash" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <button onClick={() => handleRestoreFromTrash(order.id)} disabled={loading}
                      style={{ background: "#0d1a2e", border: "1px solid #1a3a6b", color: "#60A5FA", borderRadius: 6, padding: "5px 8px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                      ↩ Herstellen
                    </button>
                    <button onClick={() => handlePermanentDelete([order.id])} disabled={loading}
                      style={{ background: "#1a0505", border: "1px solid #8b000055", color: "#cc4444", borderRadius: 6, padding: "5px 8px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
                      ❌ Verwijderen
                    </button>
                    {order.deleted_at && (
                      <span style={{ fontSize: 9, color: "#555", whiteSpace: "nowrap" }}>
                        Weg op {autoDeleteDate(order.deleted_at)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Link
                href={`/dashboard-sf-intern/orders/${order.id}`}
                className="rf-btn"
                style={{ display: "inline-block", padding: "7px 12px", borderRadius: 8, background: "#FF2D2D", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", transition: "background 0.12s", textAlign: "center" }}
              >
                Bekijk
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── MOBIELE KAARTEN ── */}
      <div className="rf-mobile" style={{ flexDirection: "column", gap: 12, display: "none" }}>
        {filteredOrders.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#555", fontSize: 14, background: "#111", borderRadius: 14 }}>
            {tabLoading ? "Laden..." : "Geen bestellingen gevonden."}
          </div>
        )}
        {filteredOrders.map(order => {
          const date = new Date(order.created_at).toLocaleString("nl-NL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
          const isUrgent = !!order.urgent;
          const loading = actionLoading[order.id];
          return (
            <div
              key={order.id}
              onTouchStart={onTouchStart}
              onTouchEnd={e => onTouchEnd(e, order.id, order.status)}
              style={{
                background: "#111", border: `1px solid ${isUrgent ? "#FF2D2D" : "#222"}`,
                borderRadius: 14, padding: "16px 16px",
                display: "flex", flexDirection: "column", gap: 10,
                borderLeft: isUrgent ? "4px solid #FF2D2D" : undefined,
                position: "relative", opacity: loading ? 0.6 : 1,
              }}
            >
              {/* Top */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#fff" }}>
                    {isUrgent && <span style={{ color: "#FF2D2D", marginRight: 6 }}>🚩</span>}
                    {order.customer_name || "—"}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{order.customer_email}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => handleUrgent(order.id, isUrgent)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1, opacity: isUrgent ? 1 : 0.2, filter: isUrgent ? "none" : "grayscale(1)" }}>🚩</button>
                  <span style={{ fontSize: 11, color: "#555" }}>{date}</span>
                </div>
              </div>

              {/* Package + target + prijs */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B00" }}>{PKG[order.package] ?? order.package}</span>
                <span style={{ fontSize: 11, color: "#666" }}>voor</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{order.roast_target || "—"}</span>
                <PriceCell order={order} />
              </div>

              {/* Status */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <select className="rf-status-select" value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                  style={{ ...statusSelectStyle(order.status), flex: 1, padding: "8px 10px", fontSize: 12 }}>
                  <option value="pending">Wacht op betaling</option>
                  <option value="paid">Betaald</option>
                  <option value="in_progress">In behandeling</option>
                  <option value="delivered">Afgeleverd</option>
                </select>
                {saving[order.id] === "saving" && <span style={{ fontSize: 12, color: "#555" }}>…</span>}
                {saving[order.id] === "saved"  && <span style={{ fontSize: 16, color: "#22C55E" }}>✓</span>}
              </div>

              {/* Acties */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link href={`/dashboard-sf-intern/orders/${order.id}`}
                  style={{ flex: 1, display: "block", textAlign: "center", padding: "11px", borderRadius: 8, minHeight: 44, background: "#FF2D2D", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none", lineHeight: "22px" }}>
                  🔥 Bekijk roast
                </Link>

                {activeTab === "actief" && (
                  <>
                    <button onClick={() => handleArchive(order.id)} disabled={loading}
                      style={{ padding: "11px 14px", borderRadius: 8, border: "1px solid #333", background: "#1a1a1a", color: "#888", fontSize: 13, cursor: "pointer", minHeight: 44 }}>
                      📦
                    </button>
                    <button onClick={() => handleMoveToTrash(order.id)} disabled={loading}
                      style={{ padding: "11px 14px", borderRadius: 8, border: "1px solid #8b000033", background: "#1a0505", color: "#cc4444", fontSize: 13, cursor: "pointer", minHeight: 44 }}>
                      🗑
                    </button>
                  </>
                )}
                {activeTab === "archived" && (
                  <>
                    <button onClick={() => handleUnarchive(order.id)} disabled={loading}
                      style={{ padding: "11px 14px", borderRadius: 8, border: "1px solid #1a3a6b", background: "#0d1a2e", color: "#60A5FA", fontSize: 13, cursor: "pointer", minHeight: 44, whiteSpace: "nowrap" }}>
                      ↩ Herstel
                    </button>
                    <button onClick={() => handleMoveToTrash(order.id)} disabled={loading}
                      style={{ padding: "11px 14px", borderRadius: 8, border: "1px solid #8b000033", background: "#1a0505", color: "#cc4444", fontSize: 13, cursor: "pointer", minHeight: 44 }}>
                      🗑
                    </button>
                  </>
                )}
                {activeTab === "trash" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                    <button onClick={() => handleRestoreFromTrash(order.id)} disabled={loading}
                      style={{ padding: "11px", borderRadius: 8, border: "1px solid #1a3a6b", background: "#0d1a2e", color: "#60A5FA", fontSize: 13, cursor: "pointer", minHeight: 44, fontWeight: 700 }}>
                      ↩ Herstellen
                    </button>
                    <button onClick={() => handlePermanentDelete([order.id])} disabled={loading}
                      style={{ padding: "11px", borderRadius: 8, border: "1px solid #8b000055", background: "#1a0505", color: "#cc4444", fontSize: 13, cursor: "pointer", minHeight: 44, fontWeight: 700 }}>
                      ❌ Definitief verwijderen
                    </button>
                    {order.deleted_at && (
                      <span style={{ fontSize: 11, color: "#555", textAlign: "center" }}>
                        Automatisch verwijderd op {autoDeleteDate(order.deleted_at)}
                      </span>
                    )}
                  </div>
                )}

                <button onClick={() => toggleSelect(order.id)}
                  style={{ padding: "11px 14px", borderRadius: 8, border: "none", minHeight: 44, background: selected.has(order.id) ? "#8b0000" : "#1a1a1a", color: selected.has(order.id) ? "#fff" : "#555", fontSize: 16, cursor: "pointer" }}>
                  {selected.has(order.id) ? "✓" : "☐"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
