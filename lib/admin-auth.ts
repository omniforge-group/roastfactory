import crypto from "crypto";

const COOKIE_NAME = "sf_admin_session";
const SALT = "songfactory-admin-2026";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; lockedUntil: number }>();

// --- Helpers ---

function legacyToken(): string {
  return crypto
    .createHmac("sha256", SALT)
    .update(process.env.ADMIN_PASSWORD || "")
    .digest("hex");
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", SALT).update(payload).digest("hex");
}

// --- Public types ---

export type SessionUser = { userId: string; name: string; role: string };

// --- Session cookie ---

export function createSessionCookie(userId: string, name: string, role: string): string {
  const payload = Buffer.from(JSON.stringify({ u: userId, n: name, r: role })).toString("base64url");
  const sig = sign(payload);
  return `${COOKIE_NAME}=${payload}.${sig}; HttpOnly; Secure; SameSite=Strict; Max-Age=${60 * 60 * 24}; Path=/`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`;
}

// Returns user info from cookie, or null if invalid.
// Supports both new format (payload.sig) and legacy format (bare hmac).
export function verifySession(req: Request): SessionUser | null {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  const value = match[1];

  const dotIdx = value.lastIndexOf(".");
  if (dotIdx > 0) {
    const payload = value.slice(0, dotIdx);
    const sig = value.slice(dotIdx + 1);
    if (sig !== sign(payload)) return null;
    try {
      const { u, n, r } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
      if (!u || !n || !r) return null;
      return { userId: u, name: n, role: r };
    } catch {
      return null;
    }
  }

  // Legacy: bare hmac — grant admin rights (backward compat)
  if (value === legacyToken()) {
    return { userId: "system", name: "Admin", role: "admin" };
  }

  return null;
}

// --- Rate limiting ---

export function checkRateLimit(ip: string): { allowed: boolean; waitMinutes?: number } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry?.lockedUntil && entry.lockedUntil > now) {
    return { allowed: false, waitMinutes: Math.ceil((entry.lockedUntil - now) / 60000) };
  }
  if (entry?.lockedUntil && entry.lockedUntil <= now) attempts.delete(ip);
  return { allowed: true };
}

export function recordFailedAttempt(ip: string): void {
  const entry = attempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) entry.lockedUntil = Date.now() + LOCKOUT_MS;
  attempts.set(ip, entry);
}

export function clearAttempts(ip: string): void {
  attempts.delete(ip);
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
