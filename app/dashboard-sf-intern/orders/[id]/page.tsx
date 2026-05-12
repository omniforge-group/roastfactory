"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AdminShell from "../../_components/AdminShell";

type Order = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  recipient_name: string | null;
  occasion: string | null;
  style: string | null;
  mood: string | null;
  voice_preference: string | null;
  tempo: string | null;
  language: string | null;
  story: string | null;
  extra_notes: string | null;
  generated_lyrics: string | null;
  song_url_1: string | null;
  song_url_2: string | null;
  payment_status: string | null;
  generation_status: string | null;
  delivered_at: string | null;
  amount_total: number | null;
  revision_count: number;
  expires_at: string | null;
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [revMsg, setRevMsg] = useState("");
  const [filename1, setFilename1] = useState("");
  const [filename2, setFilename2] = useState("");
  const file1Ref = useRef<HTMLInputElement>(null);
  const file2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`)
      .then(r => { if (r.status === 401) router.push("/dashboard-sf-intern"); return r.json(); })
      .then(data => { setOrder(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, router]);

  async function sendRevision(e: React.FormEvent) {
    e.preventDefault();
    const f1 = file1Ref.current?.files?.[0];
    const f2 = file2Ref.current?.files?.[0];
    if (!f1 && !f2) { setRevMsg("Selecteer minimaal één audiobestand."); return; }

    setSending(true);
    setRevMsg("");
    const fd = new FormData();
    if (f1) fd.append("audio_1", f1);
    if (f2) fd.append("audio_2", f2);
    if (filename1.trim()) fd.append("filename_1", filename1.trim());
    if (filename2.trim()) fd.append("filename_2", filename2.trim());

    const res = await fetch(`/api/admin/orders/${id}`, { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) {
      setRevMsg(`✅ Revisie ${data.revisionNum} verstuurd naar ${order?.customer_email}`);
      setOrder(prev => prev ? { ...prev, revision_count: data.revisionNum, song_url_1: data.song_url_1, song_url_2: data.song_url_2 } : prev);
      if (file1Ref.current) file1Ref.current.value = "";
      if (file2Ref.current) file2Ref.current.value = "";
    } else {
      setRevMsg(`❌ ${data.error}`);
    }
    setSending(false);
  }

  return (
    <AdminShell>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/dashboard-sf-intern/orders" style={{ fontSize: 13, color: "#666", textDecoration: "none" }}>← Terug naar orders</Link>

        {loading && <div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>}

        {order && (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Header card */}
            <div style={{ background: "#111", borderRadius: 16, border: "1px solid #1f1f1f", padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Order van {order.customer_name || "—"}</h1>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#555", fontFamily: "monospace" }}>{order.id}</p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Badge label="Betaling" value={order.payment_status} />
                  <Badge label="Generatie" value={order.generation_status} />
                  <Badge label="Revisies" value={String(order.revision_count)} highlight={order.revision_count > 0} />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Klantgegevens */}
              <div style={{ background: "#111", borderRadius: 16, border: "1px solid #1f1f1f", padding: 24 }}>
                <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Klantgegevens</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Field label="Klant" value={order.customer_name} />
                  <Field label="E-mail" value={order.customer_email} />
                  <Field label="Ontvanger" value={order.recipient_name} />
                  <Field label="Gelegenheid" value={order.occasion} />
                  <Field label="Stijl" value={order.style} />
                  <Field label="Sfeer" value={order.mood} />
                  <Field label="Stem" value={order.voice_preference} />
                  <Field label="Tempo" value={order.tempo} />
                  <Field label="Taal" value={order.language} />
                  <Field label="Besteld op" value={new Date(order.created_at).toLocaleString("nl-NL")} />
                  {order.delivered_at && <Field label="Geleverd op" value={new Date(order.delivered_at).toLocaleString("nl-NL")} />}
                  {order.expires_at && <Field label="Verloopt op" value={new Date(order.expires_at).toLocaleDateString("nl-NL")} />}
                </div>
              </div>

              {/* Verhaal */}
              <div style={{ background: "#111", borderRadius: 16, border: "1px solid #1f1f1f", padding: 24 }}>
                <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Verhaal</h2>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#ccc", whiteSpace: "pre-wrap" }}>{order.story || "—"}</p>
                {order.extra_notes && (
                  <>
                    <h3 style={{ margin: "16px 0 8px", fontSize: 12, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Extra opmerkingen</h3>
                    <p style={{ margin: 0, fontSize: 14, color: "#aaa", whiteSpace: "pre-wrap" }}>{order.extra_notes}</p>
                  </>
                )}
              </div>
            </div>

            {/* Audio */}
            <div style={{ background: "#111", borderRadius: 16, border: "1px solid #1f1f1f", padding: 24 }}>
              <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Audio</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {order.song_url_1 ? (
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: "#666" }}>Versie 1</p>
                    <audio controls src={order.song_url_1} style={{ width: "100%", borderRadius: 8 }} />
                  </div>
                ) : <p style={{ color: "#444", fontSize: 14 }}>Versie 1 niet beschikbaar</p>}
                {order.song_url_2 ? (
                  <div>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: "#666" }}>Versie 2</p>
                    <audio controls src={order.song_url_2} style={{ width: "100%", borderRadius: 8 }} />
                  </div>
                ) : <p style={{ color: "#444", fontSize: 14 }}>Versie 2 niet beschikbaar</p>}
              </div>
            </div>

            {/* Lyrics */}
            {order.generated_lyrics && (
              <div style={{ background: "#111", borderRadius: 16, border: "1px solid #1f1f1f", padding: 24 }}>
                <h2 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Liedtekst</h2>
                <pre style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: "#ddd", whiteSpace: "pre-wrap", fontFamily: "system-ui, sans-serif" }}>{order.generated_lyrics}</pre>
              </div>
            )}

            {/* Revisie sturen */}
            <div style={{ background: "#111", borderRadius: 16, border: "1px solid #1f1f1f", padding: 24 }}>
              <h2 style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Revisie sturen</h2>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
                Upload nieuwe audiobestanden → worden opgeslagen in Vercel Blob → klant ontvangt een e-mail.
                {order.revision_count > 0 && ` (${order.revision_count} revisie${order.revision_count > 1 ? "s" : ""} al verstuurd)`}
              </p>
              <form onSubmit={sendRevision} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <FileInput label="Versie 1 (MP3)" inputRef={file1Ref} />
                <FilenameInput label="Bestandsnaam versie 1" value={filename1} onChange={setFilename1} placeholder={`SongFactory-${order.customer_name || "klant"}-v1`} />
                <FileInput label="Versie 2 (MP3)" inputRef={file2Ref} />
                <FilenameInput label="Bestandsnaam versie 2" value={filename2} onChange={setFilename2} placeholder={`SongFactory-${order.customer_name || "klant"}-v2`} />
                <button
                  type="submit"
                  disabled={sending}
                  style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899,#a855f7)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 24px", fontSize: 15, fontWeight: 700, cursor: sending ? "wait" : "pointer", opacity: sending ? 0.7 : 1, marginTop: 4 }}
                >
                  {sending ? "Bezig..." : `Revisie ${order.revision_count + 1} versturen →`}
                </button>
                {revMsg && (
                  <div style={{ padding: "10px 14px", borderRadius: 10, background: revMsg.startsWith("✅") ? "#0f2a1a" : "#2a0f0f", border: `1px solid ${revMsg.startsWith("✅") ? "#166534" : "#7f1d1d"}`, color: revMsg.startsWith("✅") ? "#86efac" : "#fca5a5", fontSize: 13 }}>
                    {revMsg}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

function Badge({ label, value, highlight = false }: { label: string; value: string | null; highlight?: boolean }) {
  return (
    <div style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "#555" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: highlight ? "#f59e0b" : "#ccc", marginTop: 2 }}>{value || "—"}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid #1a1a1a", paddingBottom: 8 }}>
      <span style={{ fontSize: 12, color: "#555", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#ccc", textAlign: "right" }}>{value || "—"}</span>
    </div>
  );
}

function FileInput({ label, inputRef }: { label: string; inputRef: React.RefObject<HTMLInputElement> }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, color: "#888", marginBottom: 6 }}>{label}</label>
      <input
        type="file"
        accept="audio/mpeg,audio/mp3,.mp3"
        ref={inputRef}
        style={{ width: "100%", background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 10, padding: "10px 14px", color: "#ccc", fontSize: 13, boxSizing: "border-box" }}
      />
    </div>
  );
}

function FilenameInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, color: "#888", marginBottom: 6 }}>{label} <span style={{ fontSize: 11, color: "#444" }}>(wordt ook MP3-metadata titel)</span></label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", background: "#0f0f0f", border: "1px solid #2a2a2a", borderRadius: 10, padding: "10px 14px", color: "#ccc", fontSize: 13, boxSizing: "border-box", outline: "none" }}
        onFocus={e => (e.target.style.borderColor = "#a855f7")}
        onBlur={e => (e.target.style.borderColor = "#2a2a2a")}
      />
    </div>
  );
}
