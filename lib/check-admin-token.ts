export type AdminUser = { userId: string; name: string; role: string };

function tokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const m = cookieHeader.match(/(?:^|;\s*)admin-token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function isAdminRequest(req: Request): AdminUser | null {
  const token = tokenFromCookie(req.headers.get('cookie'));
  const secret = process.env.ADMIN_SECRET_TOKEN;
  if (!token || !secret || token !== secret) return null;
  return { userId: "admin", name: "Admin", role: "admin" };
}
