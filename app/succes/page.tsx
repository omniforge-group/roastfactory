import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bestelling bevestigd | RoastFactory",
};

export default function SuccesPage() {
  const BG = "#0A0A0A";
  const RED = "#FF2D2D";
  const ORANGE = "#FF6B00";
  const WHITE = "#FFFFFF";
  const GRAY = "#1A1A1A";
  const GRAY2 = "#2A2A2A";
  const GRAY_TEXT = "#888888";

  return (
    <main style={{ minHeight: "100vh", background: BG, color: WHITE, fontFamily: "system-ui, -apple-system, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>

        {/* Vuur icoon */}
        <div style={{
          width: 96, height: 96, borderRadius: "50%", margin: "0 auto 32px",
          background: `linear-gradient(135deg, ${RED}, ${ORANGE})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 44,
        }}>
          🔥
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 16px", letterSpacing: -1, lineHeight: 1.1 }}>
          Je roast is besteld! 🔥
        </h1>

        <p style={{ fontSize: 16, color: GRAY_TEXT, lineHeight: 1.75, margin: "0 0 32px" }}>
          We gaan aan de slag. Je ontvangt je roast <strong style={{ color: WHITE }}>binnen 24 uur</strong> in je inbox.
        </p>

        {/* Spam tip */}
        <div style={{
          background: GRAY, border: `1px solid ${GRAY2}`, borderRadius: 14,
          padding: "16px 20px", marginBottom: 32, textAlign: "left",
        }}>
          <p style={{ margin: 0, fontSize: 14, color: GRAY_TEXT, lineHeight: 1.6 }}>
            💡 <strong style={{ color: WHITE }}>Spam tip:</strong> Controleer ook je spamfolder of ongewenste mail als je geen bevestiging ziet.
          </p>
        </div>

        {/* Stappen */}
        <div style={{ background: GRAY, border: `1px solid ${GRAY2}`, borderRadius: 16, padding: 24, marginBottom: 32, textAlign: "left" }}>
          <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: GRAY_TEXT }}>
            Wat nu?
          </p>
          {[
            "Je ontvangt een bevestiging per e-mail",
            "Wij maken je persoonlijke roast — handgemaakt",
            "Binnen 24 uur staat de MP3 in je inbox",
          ].map((stap, i) => (
            <div key={stap} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: i < 2 ? 12 : 0 }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                background: `linear-gradient(135deg, ${RED}, ${ORANGE})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: WHITE,
              }}>
                {i + 1}
              </div>
              <p style={{ margin: 0, fontSize: 14, color: GRAY_TEXT, lineHeight: 1.6 }}>{stap}</p>
            </div>
          ))}
        </div>

        {/* Terug naar home knop */}
        <a
          href="/"
          style={{
            display: "inline-block", padding: "16px 40px", borderRadius: 12,
            background: `linear-gradient(135deg, ${RED}, ${ORANGE})`,
            color: WHITE, fontWeight: 700, fontSize: 16, textDecoration: "none",
          }}
        >
          Terug naar home
        </a>

        <p style={{ marginTop: 24, fontSize: 12, color: "#333333" }}>
          © roastfactory.nl
        </p>

      </div>
    </main>
  );
}
