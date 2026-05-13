"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/dashboard-sf-intern/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Ongeldig wachtwoord.");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔥</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#FFFFFF", letterSpacing: -0.5 }}>RoastFactory Admin</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#666666" }}>Voer je wachtwoord in om door te gaan.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ background: "#1A1A1A", borderRadius: 20, padding: 32, border: "1px solid #2A2A2A" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#888888", marginBottom: 8 }}>Wachtwoord</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoFocus
              style={{
                width: "100%", background: "#0A0A0A", border: "1px solid #2A2A2A",
                borderRadius: 10, padding: "13px 16px", color: "#FFFFFF",
                fontSize: 15, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div style={{ background: "#2A0A0A", border: "1px solid #FF2D2D44", borderRadius: 10, padding: "10px 14px", color: "#FF8888", fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", background: loading ? "#2A2A2A" : "linear-gradient(135deg,#FF2D2D,#FF6B00)",
              color: "#FFFFFF", border: "none", borderRadius: 10,
              padding: "14px 20px", fontSize: 15, fontWeight: 700,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Bezig..." : "Inloggen →"}
          </button>
        </form>
      </div>
    </div>
  );
}
