import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";

export const maxDuration = 60;

function buildEmailHtml(name: string, orderId: string) {
  return `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">

  <div style="background:linear-gradient(135deg,#f59e0b 0%,#ec4899 50%,#3b82f6 100%);padding:40px 32px 36px;text-align:center;">
    <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.75);">SongFactory</p>
    <h1 style="margin:0;font-size:26px;font-weight:900;color:#ffffff;line-height:1.2;">Wat vond je ervan? 🎶</h1>
  </div>

  <div style="max-width:600px;margin:0 auto;padding:0 16px 48px;">

    <div style="background:#ffffff;border-radius:20px;padding:32px;margin-top:24px;box-shadow:0 2px 12px rgba(15,23,42,0.06);">
      <p style="margin:0 0 16px 0;font-size:16px;color:#0f172a;">Hi <strong>${name}</strong>,</p>
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#475569;">
        Een paar dagen geleden heb je een persoonlijk liedje besteld via SongFactory.
        We zijn benieuwd wat je ervan vond — en jouw mening helpt ons om het nóg beter te maken.
      </p>
      <p style="margin:0 0 24px 0;font-size:15px;line-height:1.7;color:#475569;">
        Het duurt maar <strong>2 minuten</strong> en je hoeft nergens op in te loggen.
      </p>

      <div style="text-align:center;">
        <a href="https://songfactory.eu/survey?order_id=${orderId}" style="
          display:inline-block;
          background:linear-gradient(135deg,#f59e0b 0%,#ec4899 50%,#3b82f6 100%);
          color:#ffffff;
          font-family:Arial,sans-serif;
          font-size:16px;
          font-weight:700;
          text-decoration:none;
          padding:16px 36px;
          border-radius:100px;
        ">Geef jouw mening →</a>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;padding:0 16px;">
      <p style="font-size:13px;color:#94a3b8;margin:0 0 6px 0;">Vragen? Stuur een mail naar <a href="mailto:info@songfactory.eu" style="color:#ec4899;">info@songfactory.eu</a></p>
      <p style="font-size:12px;color:#cbd5e1;margin:0;">© SongFactory.eu</p>
    </div>

  </div>
</body>
</html>`;
}

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const isTest = searchParams.get("test") === "true";

  // =========================================
  // 🧪 TEST-MODUS
  // =========================================
  if (isTest) {
    const testEmail = "info@songfactory.eu";
    const testName = "Test Klant";

    try {
      await resend.emails.send({
        from: "SongFactory <hello@songfactory.eu>",
        to: testEmail,
        subject: "[TEST] Wat vond je van je persoonlijke song? 🎵",
        html: buildEmailHtml(testName, "test"),
      });

      console.log("✅ Test survey reminder verstuurd naar", testEmail);

      return new Response(
        JSON.stringify({ test: true, to: testEmail, success: true }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ Test reminder fout:", message);

      return new Response(
        JSON.stringify({ test: true, to: testEmail, success: false, error: message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // =========================================
  // 🚀 PRODUCTIE-FLOW
  // =========================================
  const from = new Date();
  from.setDate(from.getDate() - 6);
  from.setHours(0, 0, 0, 0);

  const to = new Date();
  to.setDate(to.getDate() - 5);
  to.setHours(23, 59, 59, 999);

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name, customer_email")
    .eq("payment_status", "paid")
    .gte("paid_at", from.toISOString())
    .lte("paid_at", to.toISOString());

  if (error) {
    console.error("❌ Survey reminder query error:", error);
    return new Response("Database error", { status: 500 });
  }

  if (!orders || orders.length === 0) {
    console.log("📭 Geen klanten om reminder naar te sturen");
    return new Response(
      JSON.stringify({ test: false, sent: 0, total: 0 }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  let sent = 0;
  const errors: string[] = [];

  for (const order of orders) {
    if (!order.customer_email) continue;

    try {
      await resend.emails.send({
        from: "SongFactory <hello@songfactory.eu>",
        to: order.customer_email,
        subject: "Wat vond je van je persoonlijke song? 🎵",
        html: buildEmailHtml(order.customer_name || "daar", order.id),
      });

      sent++;
      console.log(`✅ Survey reminder verstuurd naar ${order.customer_email}`);
    } catch (err) {
      const msg = `Fout bij ${order.customer_email}: ${err instanceof Error ? err.message : String(err)}`;
      console.error("❌", msg);
      errors.push(msg);
    }
  }

  console.log(`📬 Survey reminders klaar: ${sent}/${orders.length} verstuurd`);

  return new Response(
    JSON.stringify({ test: false, sent, total: orders.length, errors }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
