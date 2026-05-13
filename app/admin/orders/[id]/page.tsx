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
  delivered_at: string | null;
  stripe_session_id: string | null;
};

const PACKAGE_LABELS: Record<string, string> = {
  quick_roast: "Quick Roast",
  savage_pack: "Savage Pack",
  nuclear_pack: "Nuclear Pack",
  battle_mode: "Battle Mode",
};

const ROAST_LEVEL_LABELS: Record<string, string> = {
  mild: "Mild 😅",
  medium: "Medium 😬",
  savage: "Savage 🔥",
  nuclear: "Nuclear ☢️",
};

const BG = "#0A0A0A";
const GRAY = "#1A1A1A";
const GRAY2 = "#2A2A2A";
const WHITE = "#FFFFFF";
const RED = "#FF2D2D";
const ORANGE = "#FF6B00";
const GRAY_TEXT = "#888888";

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

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(r => { if (r.status === 401) { router.push("/admin/login"); return null; } return r.json(); })
      .then(data => { if (data) { setOrder(data); setStatus(data.status); setLyrics(data.lyrics || ""); } setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, router]);

  async function saveChanges() {
    setSaving(true); setSaveMsg("");
    const res = await fetch("/api/admin/orders", {
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
    const res = await fetch(`/api/admin/orders/${id}`, { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) {
      setUploadMsg("✅ Audio geüpload");
      setOrder(prev => prev ? { ...prev, audio_url: data.audio_url } : prev);
      if (fileRef.current) fileRef.current.value = "";
    } else {
      setUploadMsg(`❌ ${data.error}`);
    }
  }

  async function deliverRoast() {
    if (!order?.lyrics && !order?.audio_url) {
      setDeliverMsg("⚠️ Voeg eerst lyrics of audio toe.");
      return;
    }
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

  const inputStyle: React.CSSProperties = {
    width: "100%", background: BG, border: `1px solid ${GRAY2}`,
    borderRadius: 10, padding: "12px 14px", color: WHITE,
    fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", color: GRAY_TEXT, fontFamily: "system-ui" }}>
      Laden...
    </div>
  );

  if (!order) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", color: RED, fontFamily: "system-ui" }}>
      Order niet gevonden.
    </div>
  );

  const statusColors: Record<string, string> = { pending: "#888888", paid: "#60A5FA", in_progress: ORANGE, delivered: "#22C55E" };
  const priceFormatted = `€${Number(order.price).toFixed(2).replace(".", ",")}`;

  return (
    <main style={{ minHeight: "100vh", background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${GRAY2}`, background: "#0D0D0D", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Link href="/admin" style={{ color: GRAY_TEXT, fontSize: 13, textDecoration: "none" }}>← Terug</Link>
        <span style={{ color: GRAY2 }}>|</span>
        <span style={{ fontWeight: 800, fontSize: 15, color: WHITE }}>🔥 {PACKAGE_LABELS[order.package]} — {order.roast_target}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20, color: statusColors[order.status], background: `${statusColors[order.status]}22`, border: `1px solid ${statusColors[order.status]}44` }}>
          {order.status}
        </span>
      </header>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

        {/* Links: klantgegevens + roast info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Klantgegevens */}
          <div style={{ background: GRAY, borderRadius: 16, border: `1px solid ${GRAY2}`, padding: 24 }}>
            <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: GRAY_TEXT }}>Klantgegevens</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Naam", order.customer_name],
                ["E-mail", order.customer_email],
                ["Pakket", PACKAGE_LABELS[order.package] ?? order.package],
                ["Prijs", priceFormatted],
                ["Besteldatum", new Date(order.created_at).toLocaleString("nl-NL")],
                ["Geleverd op", order.delivered_at ? new Date(order.delivered_at).toLocaleString("nl-NL") : "Nog niet"],
              ].map(([label, value]) => (
                <div key={label} style={{ background: BG, borderRadius: 10, padding: "12px 14px", border: `1px solid ${GRAY2}` }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: GRAY_TEXT, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 14, color: WHITE, fontWeight: 600 }}>{value || "—"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Roast details */}
          <div style={{ background: GRAY, borderRadius: 16, border: `1px solid ${GRAY2}`, padding: 24 }}>
            <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: GRAY_TEXT }}>Roast details</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                ["Roast target", order.roast_target],
                ["Gelegenheid", order.occasion],
                ["Roast level", ROAST_LEVEL_LABELS[order.roast_level] ?? order.roast_level],
              ].map(([label, value]) => (
                <div key={label} style={{ background: BG, borderRadius: 10, padding: "12px 14px", border: `1px solid ${GRAY2}` }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: GRAY_TEXT, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 14, color: ORANGE, fontWeight: 700 }}>{value || "—"}</p>
                </div>
              ))}
            </div>
            <div style={{ background: BG, borderRadius: 10, padding: "14px 16px", border: `1px solid ${GRAY2}`, marginBottom: 12 }}>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: GRAY_TEXT, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Inside jokes & bijnamen</p>
              <p style={{ margin: 0, fontSize: 14, color: WHITE, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{order.inside_jokes || "—"}</p>
            </div>
            {order.extra_info && (
              <div style={{ background: BG, borderRadius: 10, padding: "14px 16px", border: `1px solid ${GRAY2}` }}>
                <p style={{ margin: "0 0 8px", fontSize: 11, color: GRAY_TEXT, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Extra info</p>
                <p style={{ margin: 0, fontSize: 14, color: WHITE, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{order.extra_info}</p>
              </div>
            )}
          </div>

          {/* Audio preview */}
          {order.audio_url && (
            <div style={{ background: GRAY, borderRadius: 16, border: `1px solid ${GRAY2}`, padding: 24 }}>
              <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: GRAY_TEXT }}>Audio</p>
              <audio controls src={order.audio_url} style={{ width: "100%", borderRadius: 8 }} />
              <a href={order.audio_url} target="_blank" style={{ display: "inline-block", marginTop: 10, fontSize: 13, color: ORANGE }}>
                Download link ↗
              </a>
            </div>
          )}
        </div>

        {/* Rechts: acties */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 24 }}>

          {/* Status + lyrics opslaan */}
          <div style={{ background: GRAY, borderRadius: 16, border: `1px solid ${GRAY2}`, padding: 24 }}>
            <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: GRAY_TEXT }}>Beheer</p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: WHITE, marginBottom: 8 }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputStyle, appearance: "none" } as React.CSSProperties}>
                <option value="pending">pending</option>
                <option value="paid">paid</option>
                <option value="in_progress">in_progress</option>
                <option value="delivered">delivered</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: WHITE, marginBottom: 8 }}>Lyrics</label>
              <textarea
                value={lyrics}
                onChange={e => setLyrics(e.target.value)}
                placeholder="Voer hier de lyrics in..."
                style={{ ...inputStyle, minHeight: 180, resize: "vertical" }}
              />
            </div>

            <button onClick={saveChanges} disabled={saving} style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: saving ? GRAY2 : `linear-gradient(135deg, ${RED}, ${ORANGE})`, color: WHITE, fontWeight: 700, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", marginBottom: 8 }}>
              {saving ? "Opslaan..." : "Opslaan"}
            </button>
            {saveMsg && <p style={{ margin: 0, fontSize: 13, color: saveMsg.startsWith("✅") ? "#22C55E" : RED }}>{saveMsg}</p>}
          </div>

          {/* Audio upload */}
          <div style={{ background: GRAY, borderRadius: 16, border: `1px solid ${GRAY2}`, padding: 24 }}>
            <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: GRAY_TEXT }}>Audio uploaden</p>
            <input ref={fileRef} type="file" accept="audio/mpeg,audio/mp3,.mp3" style={{ width: "100%", color: GRAY_TEXT, fontSize: 13, marginBottom: 12 }} />
            <button onClick={uploadAudio} disabled={uploading} style={{ width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${GRAY2}`, background: BG, color: WHITE, fontWeight: 700, fontSize: 14, cursor: uploading ? "not-allowed" : "pointer", marginBottom: 8 }}>
              {uploading ? "Uploaden..." : "Upload MP3"}
            </button>
            {uploadMsg && <p style={{ margin: 0, fontSize: 13, color: uploadMsg.startsWith("✅") ? "#22C55E" : RED }}>{uploadMsg}</p>}
          </div>

          {/* Verstuur roast */}
          <div style={{ background: `${RED}11`, borderRadius: 16, border: `1px solid ${RED}44`, padding: 24 }}>
            <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: RED }}>Bezorging</p>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: GRAY_TEXT, lineHeight: 1.6 }}>
              Stuurt de roast (lyrics + audio link) naar <strong style={{ color: WHITE }}>{order.customer_email}</strong> en zet status op <em>delivered</em>.
            </p>
            <button onClick={deliverRoast} disabled={delivering} style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: delivering ? GRAY2 : `linear-gradient(135deg, ${RED}, ${ORANGE})`, color: WHITE, fontWeight: 800, fontSize: 15, cursor: delivering ? "not-allowed" : "pointer", marginBottom: 8 }}>
              {delivering ? "Versturen..." : "🔥 Verstuur roast naar klant"}
            </button>
            {deliverMsg && <p style={{ margin: 0, fontSize: 13, color: deliverMsg.startsWith("✅") ? "#22C55E" : deliverMsg.startsWith("⚠️") ? ORANGE : RED }}>{deliverMsg}</p>}
          </div>

        </div>
      </div>
    </main>
  );
}
