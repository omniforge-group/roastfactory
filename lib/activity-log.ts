import { supabaseAdmin } from "./supabase-admin";

export async function logActivity(
  userId: string,
  userName: string,
  action: string,
  details?: string
): Promise<void> {
  try {
    await supabaseAdmin.from("activity_log").insert({
      user_id: userId,
      user_name: userName,
      action,
      details: details ?? null,
    });
  } catch {
    // Logging mag de hoofdflow nooit breken
  }
}
