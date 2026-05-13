"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Order = {
  id: string;
  created_at: string;
  status: string;
  package: string;
  price: number;
  customer_name: string;
  customer_email: string;
  roast_target: string;
  occasion: string;
  roast_level: string;
  inside_jokes: string;
  extra_info: string | null;
  lyrics: string | null;
  audio_url: string | null;
  audio_expires_at: string | null;
  delivered_at: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
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

const STATUS_COLOR: Record<string, { color: string; bg: string; border: string }> = {
  pending:     { color: "#999", bg: "#1a1a1a", border: "#333" },
  paid:        { color: "#60A5FA", bg: "#0d1a2e", border: "#1a3a6b" },
  in_progress: { color: "#FF6B00", bg: "#1e0e00", border: "#4a2000" },
  delivered:   { color: "#22C55E", bg: "#061a0e", border: "#16a34a" },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [delivering, setDelivering] = useState(false);
  const [deliverMsg, setDeliverMsg] = useState("");

  const [activePromptTab, setActivePromptTab] = useState<"lyrics" | "suno">("lyrics");
  const [copiedTab, setCopiedTab] = useState<"lyrics" | "suno" | null>(null);

  useEffect(() => {
    fetch(`/api/dashboard-sf-intern/orders/${id}`)
      .then(r => {
        if (r.status === 401) { router.push("/dashboard-sf-intern/login"); return null; }
        return r.json();
      })
      .then(data => {
        if (data) { setOrder(data); setStatus(data.status); setLyrics(data.lyrics || ""); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, router]);

  async function saveChanges() {
    setSaving(true); setSaveMsg("");
    const res = await fetch("/api/dashboard-sf-intern/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, lyrics }),
    });
    setSaving(false);
    if (res.ok) {
      setSaveMsg("✅ Opgeslagen");
      setOrder(prev => prev ? { ...prev, status, lyrics } : prev);
    } else {
      setSaveMsg("❌ Opslaan mislukt");
    }
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function uploadAudio() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setUploadMsg("Selecteer een MP3 bestand."); return; }
    setUploading(true); setUploadMsg("");
    const fd = new FormData();
    fd.append("audio", file);
    const res = await fetch(`/api/dashboard-sf-intern/orders/${id}`, { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) {
      setUploadMsg("✅ Audio geüpload en opgeslagen");
      setOrder(prev => prev ? { ...prev, audio_url: data.audio_url } : prev);
      if (fileRef.current) fileRef.current.value = "";
    } else {
      setUploadMsg(`❌ ${data.error}`);
    }
  }

  async function deliverRoast() {
    if (!confirm(`Roast versturen naar ${order?.customer_email}?`)) return;
    setDelivering(true); setDeliverMsg("");
    const res = await fetch("/api/deliver-roast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id }),
    });
    const data = await res.json();
    setDelivering(false);
    if (res.ok) {
      setDeliverMsg("✅ Roast verstuurd naar klant!");
      setOrder(prev => prev ? { ...prev, status: "delivered", delivered_at: new Date().toISOString() } : prev);
      setStatus("delivered");
    } else {
      setDeliverMsg(`❌ ${data.error}`);
    }
  }

  function generateLyricsPrompt(o: Order): string {
    const lengthMap: Record<string, string> = {
      quick_roast: "1 couplet + refrein",
      savage_pack: "2 coupletten + refrein",
      nuclear_pack: "3 coupletten + refrein + bridge",
      battle_mode: "2 rondes van elk 1 couplet + refrein",
    };
    return `Schrijf een roast in het Nederlands voor ${o.roast_target} ter gelegenheid van ${o.occasion}.

Roast level: ${LEVEL[o.roast_level] ?? o.roast_level}
- Mild 😅: vriendelijk, licht plagend, geen echte beledigingen
- Medium 😬: grappig, wat scherper, licht gênant
- Savage 🔥: hard, direct, scherp maar nog steeds grappig
- Nuclear ☢️: geen genade, maximaal hard, alles mag

Inside jokes en bijnamen om te verwerken:
${o.inside_jokes || "—"}

Extra informatie:
${o.extra_info || "—"}

Eisen voor de lyrics:
- Schrijf in couplet/refrein structuur
- Gebruik rijm waar mogelijk
- Verwerk de inside jokes en bijnamen natuurlijk in de tekst
- Pas de toon aan op het gekozen roast level
- Maak het persoonlijk en herkenbaar voor de ontvanger
- Lengte: ${lengthMap[o.package] ?? "1 couplet + refrein"}`;
  }

  function generateSunoPrompt(o: Order): string {
    const genreMap: Record<string, string> = {
      mild: "upbeat pop, fun, playful",
      medium: "hip hop, comedic rap, bouncy beat",
      savage: "aggressive rap, diss track, hard hitting",
      nuclear: "battle rap, aggressive, dark beat, intense",
    };
    const bpmMap: Record<string, string> = {
      mild: "120bpm", medium: "130bpm", savage: "140bpm", nuclear: "150bpm",
    };
    const moodMap: Record<string, string> = {
      mild: "fun and playful",
      medium: "comedic and sharp",
      savage: "brutal and funny",
      nuclear: "no mercy",
    };
    const genre = genreMap[o.roast_level] ?? "upbeat pop, fun, playful";
    const bpm = bpmMap[o.roast_level] ?? "120bpm";
    const mood = moodMap[o.roast_level] ?? "fun and playful";
    const battleExtra = o.package === "battle_mode"
      ? ", battle rap format, two verses alternating, competitive energy"
      : "";
    return `Style: ${genre}, Dutch lyrics, roast song about ${o.roast_target}, ${o.occasion} theme, ${o.roast_level} intensity, catchy hook, ${bpm}${battleExtra}

Mood: ${mood}`;
  }

  async function copyPrompt(tab: "lyrics" | "suno") {
    const text = tab === "lyrics" ? generateLyricsPrompt(order!) : generateSunoPrompt(order!);
    await navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", color: "#555", fontFamily: "system-ui" }}>
      Laden...
    </div>
  );

  if (!order) return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", color: "#FF2D2D", fontFamily: "system-ui" }}>
      Order niet gevonden.
    </div>
  );

  const sc = STATUS_COLOR[order.status] ?? STATUS_COLOR.pending;
  const price = `€${Number(order.price).toFixed(2).replace(".", ",")}`;

  const sectionTitle = (txt: string) => (
    <p style={{ margin: "0 0 16px", fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "#FF2D2D", borderBottom: "1px solid #222", paddingBottom: 8 }}>
      {txt}
    </p>
  );

  const infoCard = (label: string, value: string | null, accent = false) => (
    <div key={label} style={{ background: "#0A0A0A", borderRadius: 10, padding: "12px 14px", border: "1px solid #222" }}>
      <p style={{ margin: "0 0 4px", fontSize: 10, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: accent ? "#FF6B00" : "#fff" }}>{value || "—"}</p>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#0A0A0A", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <style>{`
        textarea:focus { border-color: #FF2D2D !important; outline: none !important; }
        select:focus { border-color: #FF2D2D !important; outline: none !important; }
        @media (max-width: 768px) {
          .rf-detail-grid { grid-template-columns: 1fr !important; padding: 14px !important; }
          .rf-detail-sidebar { position: static !important; }
          .rf-info-2col { grid-template-columns: 1fr 1fr !important; }
          .rf-info-3col { grid-template-columns: 1fr !important; }
          .rf-detail-header { padding: 0 16px !important; }
          .rf-detail-header-inner { height: auto !important; padding: 10px 0 !important; flex-wrap: wrap !important; gap: 8px !important; }
        }
      `}</style>

      {/* Header */}
      <header className="rf-detail-header" style={{ background: "#111", borderBottom: "2px solid #FF2D2D", padding: "0 32px" }}>
        <div className="rf-detail-header-inner" style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, height: 56 }}>
          <Link href="/dashboard-sf-intern" style={{ color: "#555", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>← Terug</Link>
          <span style={{ color: "#222", fontSize: 18 }}>|</span>
          <span style={{ fontSize: 16, fontWeight: 900 }}>🔥 Roast Details</span>
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
            {order.status}
          </span>
        </div>
      </header>

      <div className="rf-detail-grid" style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

        {/* ── Links: info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Klantgegevens */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 14, padding: 24 }}>
            {sectionTitle("Klantgegevens")}
            <div className="rf-info-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {infoCard("Naam", order.customer_name)}
              {infoCard("E-mailadres", order.customer_email)}
              {infoCard("Pakket", PKG[order.package] ?? order.package, true)}
              {infoCard("Prijs", price, true)}
              {infoCard("Besteldatum", new Date(order.created_at).toLocaleString("nl-NL"))}
              {infoCard("Geleverd op", order.delivered_at ? new Date(order.delivered_at).toLocaleString("nl-NL") : "Nog niet")}
            </div>
            <div style={{ marginTop: 12, background: "#0A0A0A", borderRadius: 10, padding: "10px 14px", border: "1px solid #222" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Stripe session ID</p>
              <p style={{ margin: 0, fontSize: 12, color: "#444", fontFamily: "monospace" }}>{order.stripe_session_id || "—"}</p>
            </div>
          </div>

          {/* Roast informatie */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 14, padding: 24 }}>
            {sectionTitle("Roast informatie")}
            <div className="rf-info-3col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {infoCard("Voor wie", order.roast_target, true)}
              {infoCard("Gelegenheid", order.occasion)}
              {infoCard("Roast level", LEVEL[order.roast_level] ?? order.roast_level, true)}
            </div>
          </div>

          {/* Inside jokes */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 14, padding: 24 }}>
            {sectionTitle("Inside jokes & bijnamen")}
            <div style={{ background: "#0A0A0A", border: "1px solid #FF2D2D22", borderRadius: 10, padding: "16px" }}>
              <p style={{ margin: 0, fontSize: 14, color: "#ddd", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{order.inside_jokes || "—"}</p>
            </div>
            {order.extra_info && (
              <>
                <p style={{ margin: "16px 0 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555" }}>Extra info</p>
                <div style={{ background: "#0A0A0A", border: "1px solid #222", borderRadius: 10, padding: "16px" }}>
                  <p style={{ margin: 0, fontSize: 14, color: "#ddd", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{order.extra_info}</p>
                </div>
              </>
            )}
          </div>

          {/* Audio (als beschikbaar) */}
          {order.audio_url && (
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: 14, padding: 24 }}>
              {sectionTitle("Audio preview")}
              <audio controls src={order.audio_url} style={{ width: "100%", borderRadius: 8, marginBottom: 10 }} />
              <a href={order.audio_url} target="_blank" style={{ fontSize: 13, color: "#FF6B00", textDecoration: "none" }}>
                ↗ Publieke download link
              </a>
              {(() => {
                if (!order.audio_expires_at) return null;
                const expiresAt = new Date(order.audio_expires_at);
                const now = new Date();
                const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (daysLeft <= 0) {
                  return (
                    <div style={{ marginTop: 12, background: "#1a0505", border: "1px solid #FF2D2D", borderRadius: 10, padding: "10px 14px" }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#FF2D2D", fontWeight: 700 }}>
                        ❌ Audio verlopen — bestand is verwijderd van de server
                      </p>
                    </div>
                  );
                }
                if (daysLeft <= 3) {
                  return (
                    <div style={{ marginTop: 12, background: "#1a0e00", border: "1px solid #FF6B00", borderRadius: 10, padding: "10px 14px" }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#FF6B00", fontWeight: 700 }}>
                        ⚠️ Audio verloopt over {daysLeft} dag{daysLeft !== 1 ? "en" : ""} — automatisch verwijderd op {expiresAt.toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                  );
                }
                return (
                  <p style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
                    Beschikbaar tot {expiresAt.toLocaleDateString("nl-NL")} ({daysLeft} dagen)
                  </p>
                );
              })()}
            </div>
          )}

          {/* Audio verlopen maar URL al null */}
          {!order.audio_url && order.delivered_at && (
            <div style={{ background: "#111", border: "1px solid #222", borderRadius: 14, padding: 24 }}>
              {sectionTitle("Audio preview")}
              <div style={{ background: "#1a0505", border: "1px solid #FF2D2D44", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#ff8888" }}>
                  Audio is verwijderd (14 dagen na levering automatisch opgeschoond).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Rechts: acties ── */}
        <div className="rf-detail-sidebar" style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 24 }}>

          {/* AI Prompt Generator */}
          <div style={{ background: "#1a1a1a", border: "1px solid #FF2D2D55", borderRadius: 14, padding: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 900, color: "#fff", letterSpacing: -0.3 }}>🤖 AI Prompt Generator</p>
              <p style={{ margin: 0, fontSize: 12, color: "#555" }}>Gebruik deze prompts om de roast te maken</p>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
              {(["lyrics", "suno"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActivePromptTab(tab)}
                  style={{
                    flex: 1, padding: "8px 4px", borderRadius: 7, border: "none",
                    background: activePromptTab === tab ? "#FF2D2D" : "#0A0A0A",
                    color: activePromptTab === tab ? "#fff" : "#555",
                    fontWeight: 700, fontSize: 11, cursor: "pointer",
                    letterSpacing: "0.04em", transition: "all 0.12s",
                  }}
                >
                  {tab === "lyrics" ? "Lyrics Prompt" : "Suno Stijl Prompt"}
                </button>
              ))}
            </div>

            {/* Prompt tekst */}
            <textarea
              readOnly
              value={activePromptTab === "lyrics" ? generateLyricsPrompt(order) : generateSunoPrompt(order)}
              style={{
                width: "100%", height: 220, background: "#0A0A0A",
                border: "1px solid #2a2a2a", borderRadius: 8,
                padding: "12px 14px", color: "#ccc", fontSize: 12,
                fontFamily: "monospace", lineHeight: 1.7, resize: "none",
                boxSizing: "border-box", marginBottom: 10, overflow: "auto",
              }}
            />

            {/* Kopieer knop */}
            <button
              onClick={() => copyPrompt(activePromptTab)}
              style={{
                width: "100%", padding: "11px", borderRadius: 8, border: "none",
                background: copiedTab === activePromptTab ? "#22C55E" : "#FF2D2D",
                color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              {copiedTab === activePromptTab ? "Gekopieerd! ✓" : "Kopieer prompt"}
            </button>
          </div>

          {/* Status + Roast tekst */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 14, padding: 24 }}>
            {sectionTitle("Beheer")}

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              style={{ width: "100%", background: "#0A0A0A", border: "1px solid #333", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 14, marginBottom: 16, fontFamily: "inherit", cursor: "pointer" }}
            >
              <option value="pending">pending — Wacht op betaling</option>
              <option value="paid">paid — Betaald</option>
              <option value="in_progress">in_progress — In behandeling</option>
              <option value="delivered">delivered — Afgeleverd</option>
            </select>

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" }}>Roast tekst / Lyrics</label>
            <textarea
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
              placeholder="Voer hier de roast tekst in die naar de klant gestuurd wordt..."
              style={{
                width: "100%", minHeight: 200, background: "#0A0A0A",
                border: "1px solid #333", borderRadius: 8, padding: "12px 14px",
                color: "#fff", fontSize: 13, resize: "vertical",
                fontFamily: "inherit", boxSizing: "border-box", marginBottom: 14,
                lineHeight: 1.7, transition: "border-color 0.15s",
              }}
            />

            <button
              onClick={saveChanges}
              disabled={saving}
              style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: saving ? "#1a1a1a" : "linear-gradient(135deg, #FF2D2D, #FF6B00)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", marginBottom: 8 }}
            >
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
            {saveMsg && <p style={{ margin: 0, fontSize: 12, color: saveMsg.startsWith("✅") ? "#22C55E" : "#FF2D2D" }}>{saveMsg}</p>}
          </div>

          {/* Audio upload */}
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 14, padding: 24 }}>
            {sectionTitle("Audio upload")}
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "#555", lineHeight: 1.6 }}>
              Upload de MP3 roast. Wordt opgeslagen in Supabase Storage en gekoppeld aan deze bestelling.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".mp3,audio/mpeg"
              style={{ width: "100%", color: "#888", fontSize: 13, marginBottom: 12 }}
            />
            <button
              onClick={uploadAudio}
              disabled={uploading}
              style={{ width: "100%", padding: "12px", borderRadius: 8, border: "1px solid #FF2D2D", background: uploading ? "#1a1a1a" : "#FF2D2D1a", color: uploading ? "#555" : "#FF2D2D", fontWeight: 700, fontSize: 14, cursor: uploading ? "not-allowed" : "pointer", marginBottom: 8 }}
            >
              {uploading ? "Uploaden..." : "⬆ Upload MP3"}
            </button>
            {uploadMsg && <p style={{ margin: 0, fontSize: 12, color: uploadMsg.startsWith("✅") ? "#22C55E" : "#FF2D2D" }}>{uploadMsg}</p>}
          </div>

          {/* Levering */}
          <div style={{ background: "#1a0505", border: "1px solid #FF2D2D55", borderRadius: 14, padding: 24 }}>
            {sectionTitle("Levering")}
            <p style={{ margin: "0 0 6px", fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>
              Stuur de roast (tekst + audio link) naar:
            </p>
            <p style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#FF6B00" }}>{order.customer_email}</p>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#666", lineHeight: 1.5 }}>
              Status wordt automatisch op <strong style={{ color: "#22C55E" }}>delivered</strong> gezet.
            </p>
            <button
              onClick={deliverRoast}
              disabled={delivering}
              style={{ width: "100%", padding: "15px", borderRadius: 10, border: "none", background: delivering ? "#1a1a1a" : "linear-gradient(135deg, #FF2D2D, #FF6B00)", color: "#fff", fontWeight: 900, fontSize: 15, cursor: delivering ? "not-allowed" : "pointer", marginBottom: 8, letterSpacing: -0.3 }}
            >
              {delivering ? "Versturen..." : "🔥 Verstuur roast naar klant"}
            </button>
            {order.delivered_at && (
              <p style={{ margin: 0, fontSize: 12, color: "#22C55E" }}>
                ✅ Verstuurd op {new Date(order.delivered_at).toLocaleString("nl-NL")}
              </p>
            )}
            {deliverMsg && <p style={{ margin: "6px 0 0", fontSize: 12, color: deliverMsg.startsWith("✅") ? "#22C55E" : "#FF2D2D" }}>{deliverMsg}</p>}
          </div>

        </div>
      </div>
    </main>
  );
}
