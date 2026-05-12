"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const body: Record<string, string> = { password };
    if (email.trim()) body.email = email.trim();

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/dashboard-sf-intern/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Ongeldige inloggegevens.");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            Song<span style={{ background: "linear-gradient(135deg,#f59e0b,#ec4899,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Factory</span>
          </div>
          <div style={{ fontSize: 13, color: "#666", marginTop: 6 }}>Intern dashboard</div>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "#1a1a1a", borderRadius: 20, padding: 32, border: "1px solid #2a2a2a" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#999", marginBottom: 8 }}>
              E-mailadres <span style={{ color: "#444" }}>(leeglaten voor master login)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="gebruiker@songfactory.eu"
              autoFocus
              style={{ width: "100%", background: "#0f0f0f", border: "1px solid #333", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, color: "#999", marginBottom: 8 }}>Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: "100%", background: "#0f0f0f", border: "1px solid #333", borderRadius: 12, padding: "12px 14px", color: "#fff", fontSize: 15, outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {error && (
            <div style={{ background: "#3f1212", border: "1px solid #7f1d1d", borderRadius: 10, padding: "10px 14px", color: "#fca5a5", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", background: "linear-gradient(135deg,#f59e0b,#ec4899,#a855f7)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Bezig..." : "Inloggen →"}
          </button>
        </form>
      </div>
    </div>
  );
}
