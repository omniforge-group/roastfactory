import { randomBytes } from "crypto";

// Unambiguous characters: no 0/O, no 1/I/L
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateGiftCardCode(): string {
  const bytes = randomBytes(8);
  const seg = (offset: number) =>
    Array.from({ length: 4 }, (_, i) => CHARS[bytes[offset + i] % CHARS.length]).join("");
  return `SONG-${seg(0)}-${seg(4)}`;
}

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}
