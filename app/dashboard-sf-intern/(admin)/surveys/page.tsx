"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Survey = {
  id: string;
  created_at: string;
  order_id: string | null;
  order_data: { customer_name: string | null; customer_email: string | null } | null;
  lang: string | null;
  q1_voor_wie: string | null;
  q2_ontdekt: string | null;
  q3_taal: string | null;
  q4_gemak: number | null;
  q5_snelheid: string | null;
  q6_aansluiting: number | null;
  q7_stem: number | null;
  q7_uitspraak: number | null;
  q7_lyrics: number | null;
  q7_muziek: number | null;
  q8_cijfer: number | null;
  q9_nps: number | null;
  q10a_best: string | null;
  q10b_improve: string | null;
  q10b_missing: string | null;
  q11_cadeau: string | null;
  q12_prijs_bereid: string | null;
  q13_gedeeld: string | null;
  q13_who: string | null;
  q14_prijs_mening: string | null;
  q15_tips: string | null;
  q16_contact: string | null;
  contact_email: string | null;
};

export default function SurveysPage() {
  const router = useRouter();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard-sf-intern/surveys")
      .then(r => { if (r.status === 401) router.push("/dashboard-sf-intern"); return r.json(); })
      .then(data => { setSurveys(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [router]);

  const avgNps = surveys.length
    ? (surveys.reduce((s, r) => s + (r.q9_nps ?? 0), 0) / surveys.length).toFixed(1)
    : "—";

  return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Survey antwoorden</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{surveys.length} inzendingen</p>
          </div>
          <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 12, padding: "12px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#a855f7" }}>{avgNps}</div>
            <div style={{ fontSize: 11, color: "#555" }}>Gemiddelde NPS</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64 }}>Laden...</div>
        ) : surveys.length === 0 ? (
          <div style={{ textAlign: "center", color: "#444", padding: 64, fontSize: 14 }}>Nog geen survey inzendingen.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {surveys.map(s => {
              const nps = s.q9_nps ?? 0;
              const npsColor = nps >= 9 ? "#22c55e" : nps >= 7 ? "#f59e0b" : "#ef4444";
              const isOpen = expanded === s.id;
              return (
                <div key={s.id} style={{ background: "#111", borderRadius: 14, border: "1px solid #1f1f1f", overflow: "hidden" }}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                    style={{ width: "100%", background: "none", border: "none", cursor: "pointer", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#fff" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: npsColor, minWidth: 36 }}>{nps}/10</div>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>
                          {s.order_data?.customer_name || s.q1_voor_wie || "—"}
                          {s.order_data?.customer_email && <span style={{ fontWeight: 400, color: "#666", marginLeft: 8 }}>{s.order_data.customer_email}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{new Date(s.created_at).toLocaleString("nl-NL")} · {s.lang?.toUpperCase()}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {s.order_id && (
                        <Link href={`/dashboard-sf-intern/orders/${s.order_id}`} onClick={e => e.stopPropagation()} style={{ fontSize: 12, color: "#a855f7", textDecoration: "none", fontWeight: 600 }}>
                          Order →
                        </Link>
                      )}
                      <span style={{ fontSize: 12, color: "#444" }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: "0 20px 20px", borderTop: "1px solid #1a1a1a" }}>
                      {(s.order_data?.customer_name || s.order_data?.customer_email || s.order_id) && (
                        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                          {s.order_data?.customer_name && <SurveyField label="Klant" value={s.order_data.customer_name} />}
                          {s.order_data?.customer_email && <SurveyField label="E-mail klant" value={s.order_data.customer_email} />}
                          {s.order_id && (
                            <div style={{ background: "#161616", borderRadius: 10, padding: "10px 14px" }}>
                              <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>Order</div>
                              <Link href={`/dashboard-sf-intern/orders/${s.order_id}`} style={{ fontSize: 13, fontWeight: 600, color: "#a855f7", textDecoration: "none" }}>
                                Bekijken →
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginTop: 16 }}>
                        <SurveyField label="Voor wie" value={s.q1_voor_wie} />
                        <SurveyField label="Ontdekt via" value={s.q2_ontdekt} />
                        <SurveyField label="Taal liedje" value={s.q3_taal} />
                        <SurveyField label="Gemak bestellen" value={s.q4_gemak ? `${s.q4_gemak}/5` : null} />
                        <SurveyField label="Snelheid" value={s.q5_snelheid} />
                        <SurveyField label="Aansluiting" value={s.q6_aansluiting ? `${s.q6_aansluiting}/5` : null} />
                        <SurveyField label="Stem" value={s.q7_stem ? `${s.q7_stem}/5` : null} />
                        <SurveyField label="Uitspraak" value={s.q7_uitspraak ? `${s.q7_uitspraak}/5` : null} />
                        <SurveyField label="Lyrics" value={s.q7_lyrics ? `${s.q7_lyrics}/5` : null} />
                        <SurveyField label="Muziek" value={s.q7_muziek ? `${s.q7_muziek}/5` : null} />
                        <SurveyField label="Cijfer" value={s.q8_cijfer ? `${s.q8_cijfer}/10` : null} highlight />
                        <SurveyField label="NPS" value={s.q9_nps !== null ? `${s.q9_nps}/10` : null} highlight />
                        <SurveyField label="Gedeeld" value={s.q13_gedeeld} />
                        <SurveyField label="Met wie" value={s.q13_who} />
                        <SurveyField label="Prijs mening" value={s.q14_prijs_mening} />
                        <SurveyField label="Cadeau kopen" value={s.q11_cadeau} />
                        <SurveyField label="Bereid te betalen" value={s.q12_prijs_bereid} />
                        <SurveyField label="Contact" value={s.q16_contact} />
                      </div>
                      {s.q10a_best && <LongField label="Beste aan het liedje" value={s.q10a_best} />}
                      {s.q10b_improve && <LongField label="Verbetering" value={s.q10b_improve} />}
                      {s.q10b_missing && <LongField label="Wat miste er" value={s.q10b_missing} />}
                      {s.q15_tips && <LongField label="Tips" value={s.q15_tips} />}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
  );
}

function SurveyField({ label, value, highlight = false }: { label: string; value: string | null | undefined; highlight?: boolean }) {
  return (
    <div style={{ background: "#161616", borderRadius: 10, padding: "10px 14px" }}>
      <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: highlight ? "#a855f7" : "#ccc" }}>{value || "—"}</div>
    </div>
  );
}

function LongField({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginTop: 12, background: "#161616", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}
