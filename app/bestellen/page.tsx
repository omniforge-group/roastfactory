"use client";

import { useState } from "react";

const PACKAGES = [
  {
    id: "quick_roast",
    name: "Quick Roast",
    price: "€4,99",
    duration: "45-60 sec",
    features: ["MP3 download", "Simpele cover"],
    bestseller: false,
  },
  {
    id: "savage_pack",
    name: "Savage Pack",
    price: "€9,99",
    duration: "60-90 sec",
    features: ["Meer details", "Custom cover"],
    bestseller: true,
  },
  {
    id: "nuclear_pack",
    name: "Nuclear Pack",
    price: "€19,99",
    duration: "90 sec+",
    features: ["Extra persoonlijk", "Intro op naam"],
    bestseller: false,
  },
  {
    id: "battle_mode",
    name: "Battle Mode",
    price: "€14,99",
    duration: "2 rondes diss",
    features: ["2 personen", "MP3 per persoon"],
    bestseller: false,
  },
];

const OCCASIONS = [
  "Verjaardag",
  "Bachelor/bachelorette party",
  "Pensioen",
  "Afstuderen",
  "Zomaar/voor de lol",
  "Werkafscheid",
  "Anders",
];

const ROAST_LEVELS = [
  { value: "mild", label: "Mild", emoji: "😅" },
  { value: "medium", label: "Medium", emoji: "😬" },
  { value: "savage", label: "Savage", emoji: "🔥" },
  { value: "nuclear", label: "Nuclear", emoji: "☢️" },
];

const ENDINGS = [
  { value: "positive", label: "Positief afsluiten", emoji: "😂", description: "Eindig met een vriendelijke noot, zoals bij een echte roast" },
  { value: "oneliner", label: "One-liner", emoji: "💥", description: "Eindig hard met één vernietigende zin" },
];

const STEP_LABELS = ["Pakket", "Roast info", "Gegevens", "Overzicht"];

const BG = "#0A0A0A";
const RED = "#FF2D2D";
const ORANGE = "#FF6B00";
const WHITE = "#FFFFFF";
const GRAY = "#1A1A1A";
const GRAY2 = "#2A2A2A";
const GRAY_TEXT = "#888888";

export default function BestellenFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    package: "",
    roastTarget: "",
    occasion: "",
    roastLevel: "",
    ending: "",
    insideJokes: "",
    extraInfo: "",
    customerName: "",
    email: "",
    agreeTerms: false,
  });

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const selectedPackage = PACKAGES.find((p) => p.id === form.package);
  const selectedLevel = ROAST_LEVELS.find((r) => r.value === form.roastLevel);
  const selectedEnding = ENDINGS.find((e) => e.value === form.ending);

  const step1Valid = !!form.package;
  const step2Valid =
    !!form.roastTarget &&
    !!form.occasion &&
    !!form.roastLevel &&
    !!form.ending &&
    form.insideJokes.length >= 20;
  const step3Valid = !!form.customerName && !!form.email && form.agreeTerms;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Er ging iets mis met betalen. Probeer het opnieuw.");
        setLoading(false);
      }
    } catch {
      alert("Verbindingsfout. Controleer je internet en probeer het opnieuw.");
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: `1px solid ${GRAY2}`,
    background: GRAY,
    color: WHITE,
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const btnPrimary = (enabled: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "16px 24px",
    borderRadius: 12,
    border: "none",
    background: enabled ? `linear-gradient(135deg, ${RED}, ${ORANGE})` : GRAY2,
    color: WHITE,
    fontWeight: 700,
    fontSize: 16,
    cursor: enabled ? "pointer" : "not-allowed",
    opacity: enabled ? 1 : 0.5,
  });

  const btnBack: React.CSSProperties = {
    padding: "16px 24px",
    borderRadius: 12,
    border: `1px solid ${GRAY2}`,
    background: "transparent",
    color: WHITE,
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
  };

  return (
    <main style={{ minHeight: "100vh", background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Header */}
      <header style={{ borderBottom: `1px solid ${GRAY2}`, background: "#0D0D0D", padding: "16px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ textDecoration: "none", color: WHITE, fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>
            🔥 RoastFactory
          </a>
          <span style={{ color: GRAY_TEXT, fontSize: 14 }}>Stap {step} van 4</span>
        </div>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>

        {/* Voortgangsbalk */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            {STEP_LABELS.map((label, i) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  background: i + 1 <= step ? `linear-gradient(135deg, ${RED}, ${ORANGE})` : GRAY2,
                  color: i + 1 <= step ? WHITE : GRAY_TEXT,
                }}>
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i + 1 <= step ? WHITE : GRAY_TEXT, fontWeight: 600 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div style={{ height: 4, background: GRAY2, borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              background: `linear-gradient(90deg, ${RED}, ${ORANGE})`,
              width: `${((step - 1) / 3) * 100}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>

        {/* ───── STAP 1: Kies je pakket ───── */}
        {step === 1 && (
          <div>
            <p style={{ color: RED, fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
              Stap 1
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 }}>
              Kies je pakket
            </h1>
            <p style={{ color: GRAY_TEXT, marginBottom: 32, fontSize: 15 }}>
              Hoe hard mag het gaan?
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {PACKAGES.map((pkg) => {
                const selected = form.package === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setForm({ ...form, package: pkg.id })}
                    style={{
                      position: "relative",
                      background: selected ? `linear-gradient(135deg, ${RED}22, ${ORANGE}22)` : GRAY,
                      border: `2px solid ${selected ? RED : GRAY2}`,
                      borderRadius: 16, padding: "20px 16px",
                      textAlign: "left", cursor: "pointer",
                      color: WHITE, transition: "all 0.2s",
                    }}
                  >
                    {pkg.bestseller && (
                      <div style={{
                        position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                        background: `linear-gradient(90deg, ${RED}, ${ORANGE})`,
                        color: WHITE, fontSize: 10, fontWeight: 700,
                        padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap",
                      }}>
                        ⭐ BESTSELLER
                      </div>
                    )}
                    <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{pkg.name}</p>
                    <p style={{ fontSize: 26, fontWeight: 900, color: selected ? ORANGE : WHITE, marginBottom: 4 }}>
                      {pkg.price}
                    </p>
                    <p style={{ fontSize: 12, color: GRAY_TEXT, marginBottom: 12 }}>{pkg.duration}</p>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                      {pkg.features.map((f) => (
                        <li key={f} style={{ fontSize: 12, color: selected ? WHITE : GRAY_TEXT }}>
                          ✓ {f}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <button
              onClick={next}
              disabled={!step1Valid}
              style={{ ...btnPrimary(step1Valid), marginTop: 32, width: "100%", flex: "unset" }}
            >
              Volgende →
            </button>
          </div>
        )}

        {/* ───── STAP 2: Over de roast ───── */}
        {step === 2 && (
          <div>
            <p style={{ color: RED, fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
              Stap 2
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 }}>
              Over de roast
            </h1>
            <p style={{ color: GRAY_TEXT, marginBottom: 32, fontSize: 15 }}>
              Wie gaat het voelen?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: WHITE, marginBottom: 8 }}>
                  Naam van wie geroast wordt <span style={{ color: RED }}>*</span>
                </label>
                <input
                  placeholder="Bijv. Kevin"
                  value={form.roastTarget}
                  onChange={(e) => setForm({ ...form, roastTarget: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: WHITE, marginBottom: 8 }}>
                  Gelegenheid <span style={{ color: RED }}>*</span>
                </label>
                <select
                  value={form.occasion}
                  onChange={(e) => setForm({ ...form, occasion: e.target.value })}
                  style={{ ...inputStyle, appearance: "none", color: form.occasion ? WHITE : GRAY_TEXT } as React.CSSProperties}
                >
                  <option value="" disabled>Kies een gelegenheid</option>
                  {OCCASIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: WHITE, marginBottom: 8 }}>
                  Roast level <span style={{ color: RED }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {ROAST_LEVELS.map((level) => {
                    const sel = form.roastLevel === level.value;
                    return (
                      <button
                        key={level.value}
                        onClick={() => setForm({ ...form, roastLevel: level.value })}
                        style={{
                          padding: "12px 8px", borderRadius: 10,
                          border: `2px solid ${sel ? RED : GRAY2}`,
                          background: sel ? `${RED}22` : GRAY,
                          color: WHITE, cursor: "pointer", textAlign: "center",
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{level.emoji}</div>
                        <div style={{ fontSize: 11, fontWeight: 700 }}>{level.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: WHITE, marginBottom: 8 }}>
                  Hoe moet de roast eindigen? <span style={{ color: RED }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {ENDINGS.map((ending) => {
                    const sel = form.ending === ending.value;
                    return (
                      <button
                        key={ending.value}
                        onClick={() => setForm({ ...form, ending: ending.value })}
                        style={{
                          padding: "14px 12px", borderRadius: 10, textAlign: "left",
                          border: `2px solid ${sel ? RED : GRAY2}`,
                          background: sel ? `${RED}22` : GRAY,
                          color: WHITE, cursor: "pointer", transition: "all 0.2s",
                        }}
                      >
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{ending.emoji}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{ending.label}</div>
                        <div style={{ fontSize: 11, color: sel ? "#ccc" : GRAY_TEXT, lineHeight: 1.5 }}>{ending.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: WHITE, marginBottom: 8 }}>
                  Inside jokes & bijnamen <span style={{ color: RED }}>*</span>
                </label>
                <textarea
                  placeholder="Vertel ons alles — bijnamen, grappige momenten, dingen waar ze niet omheen kunnen..."
                  value={form.insideJokes}
                  onChange={(e) => setForm({ ...form, insideJokes: e.target.value })}
                  style={{ ...inputStyle, minHeight: 140, resize: "vertical" }}
                />
                <p style={{ fontSize: 12, color: form.insideJokes.length >= 20 ? GRAY_TEXT : RED, marginTop: 4 }}>
                  {form.insideJokes.length < 20
                    ? `Nog ${20 - form.insideJokes.length} tekens nodig`
                    : `✓ ${form.insideJokes.length} tekens`}
                </p>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: WHITE, marginBottom: 8 }}>
                  Extra info{" "}
                  <span style={{ color: GRAY_TEXT, fontWeight: 400 }}>(optioneel)</span>
                </label>
                <textarea
                  placeholder="Iets wat we nog moeten weten? Specifieke dingen vermijden, stijl van de roast, etc."
                  value={form.extraInfo}
                  onChange={(e) => setForm({ ...form, extraInfo: e.target.value })}
                  style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button onClick={back} style={btnBack}>← Terug</button>
              <button onClick={next} disabled={!step2Valid} style={btnPrimary(step2Valid)}>
                Volgende →
              </button>
            </div>
          </div>
        )}

        {/* ───── STAP 3: Jouw gegevens ───── */}
        {step === 3 && (
          <div>
            <p style={{ color: RED, fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
              Stap 3
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 }}>
              Jouw gegevens
            </h1>
            <p style={{ color: GRAY_TEXT, marginBottom: 32, fontSize: 15 }}>
              Waar sturen we de roast naartoe?
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: WHITE, marginBottom: 8 }}>
                  Jouw naam <span style={{ color: RED }}>*</span>
                </label>
                <input
                  placeholder="Bijv. Thomas"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: WHITE, marginBottom: 8 }}>
                  Jouw e-mailadres <span style={{ color: RED }}>*</span>
                </label>
                <input
                  placeholder="jouw@email.nl"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={form.agreeTerms}
                  onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                  style={{ marginTop: 2, accentColor: RED, width: 18, height: 18, cursor: "pointer", flexShrink: 0 } as React.CSSProperties}
                />
                <label htmlFor="terms" style={{ fontSize: 14, color: GRAY_TEXT, cursor: "pointer", lineHeight: 1.6 }}>
                  Ik ga akkoord met de{" "}
                  <a href="/algemene-voorwaarden" target="_blank" style={{ color: ORANGE, textDecoration: "underline" }}>
                    algemene voorwaarden
                  </a>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button onClick={back} style={btnBack}>← Terug</button>
              <button onClick={next} disabled={!step3Valid} style={btnPrimary(step3Valid)}>
                Volgende →
              </button>
            </div>
          </div>
        )}

        {/* ───── STAP 4: Overzicht + betalen ───── */}
        {step === 4 && (
          <div>
            <p style={{ color: RED, fontSize: 12, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
              Stap 4
            </p>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1 }}>
              Overzicht
            </h1>
            <p style={{ color: GRAY_TEXT, marginBottom: 32, fontSize: 15 }}>
              Check alles nog even — dan gaan we betalen.
            </p>

            {/* Gekozen pakket */}
            <div style={{
              background: `linear-gradient(135deg, ${RED}22, ${ORANGE}22)`,
              border: `1px solid ${RED}55`,
              borderRadius: 16, padding: 24, marginBottom: 16,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{selectedPackage?.name}</p>
                  <p style={{ color: GRAY_TEXT, fontSize: 13 }}>{selectedPackage?.duration}</p>
                </div>
                <p style={{ fontSize: 32, fontWeight: 900, color: ORANGE }}>{selectedPackage?.price}</p>
              </div>
            </div>

            {/* Samenvatting */}
            <div style={{ background: GRAY, borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Roast target", value: form.roastTarget },
                  { label: "Gelegenheid", value: form.occasion },
                  { label: "Roast level", value: `${selectedLevel?.label} ${selectedLevel?.emoji}` },
                  { label: "Afsluiting", value: `${selectedEnding?.emoji} ${selectedEnding?.label}` },
                  { label: "Jouw naam", value: form.customerName },
                  { label: "E-mailadres", value: form.email },
                ].map((row) => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: GRAY_TEXT }}>{row.label}</span>
                    <span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{row.value}</span>
                  </div>
                ))}

                <div style={{ borderTop: `1px solid ${GRAY2}`, paddingTop: 14, marginTop: 2 }}>
                  <p style={{ color: GRAY_TEXT, fontSize: 12, marginBottom: 6 }}>Inside jokes & bijnamen</p>
                  <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{form.insideJokes}</p>
                </div>

                {form.extraInfo && (
                  <div style={{ borderTop: `1px solid ${GRAY2}`, paddingTop: 14 }}>
                    <p style={{ color: GRAY_TEXT, fontSize: 12, marginBottom: 6 }}>Extra info</p>
                    <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{form.extraInfo}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Betaalknop */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                width: "100%", padding: "18px 24px", borderRadius: 12, border: "none",
                background: loading ? GRAY2 : `linear-gradient(135deg, ${RED}, ${ORANGE})`,
                color: WHITE, fontWeight: 800, fontSize: 18,
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: 12,
              }}
            >
              {loading ? "Bezig met verbinden..." : `Ga naar betalen — ${selectedPackage?.price}`}
            </button>

            <p style={{ textAlign: "center", color: GRAY_TEXT, fontSize: 12, marginBottom: 20 }}>
              🔒 Veilig betalen via Stripe
            </p>

            <button
              onClick={back}
              style={{
                display: "block", width: "100%", padding: "12px",
                borderRadius: 12, border: `1px solid ${GRAY2}`,
                background: "transparent", color: GRAY_TEXT,
                fontSize: 14, cursor: "pointer",
              }}
            >
              ← Terug
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
