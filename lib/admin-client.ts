export function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("admin_token") ?? "";
}

export function adminHeaders(): Record<string, string> {
  return { "x-admin-token": getAdminToken() };
}
