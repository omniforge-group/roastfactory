import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";

const PACKAGE_PRICES: Record<string, { amount: number; label: string }> = {
  quick_roast:  { amount: 499,  label: "Quick Roast"  },
  savage_pack:  { amount: 999,  label: "Savage Pack"  },
  nuclear_pack: { amount: 1999, label: "Nuclear Pack" },
  battle_mode:  { amount: 1499, label: "Battle Mode"  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      package: pkg,
      roastTarget,
      occasion,
      roastLevel,
      ending,
      insideJokes,
      extraInfo,
      customerName,
      email,
    } = body;

    if (!pkg || !roastTarget || !occasion || !roastLevel || !ending || !insideJokes || !customerName || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const packageInfo = PACKAGE_PRICES[pkg];
    if (!packageInfo) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const { data: order, error: insertError } = await supabaseAdmin
      .from("orders")
      .insert({
        status: "pending",
        package: pkg,
        price: packageInfo.amount / 100,
        customer_name: customerName,
        customer_email: email,
        roast_target: roastTarget,
        occasion,
        roast_level: roastLevel,
        ending: ending,
        inside_jokes: insideJokes,
        extra_info: extraInfo || null,
      })
      .select()
      .single();

    if (insertError || !order) {
      console.error("Supabase insert failed:", insertError);
      return NextResponse.json({ error: "Order create failed" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `RoastFactory — ${packageInfo.label}`,
              description: `Gepersonaliseerde roast voor ${roastTarget}`,
            },
            unit_amount: packageInfo.amount,
          },
          quantity: 1,
        },
      ],
      metadata: { order_id: order.id },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3004"}/succes?order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3004"}/bestellen`,
    });

    await supabaseAdmin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    // Adminmail bij checkout start (vóór betaling)
    try {
      await resend.emails.send({
        from: "RoastFactory <roasts@songfactory.eu>",
        to: process.env.ADMIN_EMAIL!,
        subject: `🛒 Nieuwe checkout gestart — ${packageInfo.label} voor ${roastTarget}`,
        html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">

  <div style="background:#1e293b;padding:28px 32px;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#94a3b8;">RoastFactory Admin</p>
    <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;">🛒 Nieuwe checkout gestart</h1>
    <p style="margin:8px 0 0;font-size:13px;color:#64748b;">Status: nog niet betaald</p>
  </div>

  <div style="max-width:600px;margin:0 auto;padding:24px 16px 48px;">

    <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:12px;padding:14px 20px;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#92400e;">⚠️ Gestart — nog niet betaald</p>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:0 2px 8px rgba(15,23,42,0.06);">
      <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Klantgegevens</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:140px;">Naam</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:#0f172a;">${customerName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;">E-mail</td>
          <td style="padding:8px 0;font-size:14px;color:#0f172a;"><a href="mailto:${email}" style="color:#FF2D2D;">${email}</a></td>
        </tr>
      </table>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:0 2px 8px rgba(15,23,42,0.06);">
      <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Roast details</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:140px;">Pakket</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#FF2D2D;">${packageInfo.label}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Roast target</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:#0f172a;">${roastTarget}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Gelegenheid</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">${occasion}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Roast level</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">${roastLevel}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Afsluiting</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">${ending === "positive" ? "😂 Positief afsluiten" : "💥 One-liner"}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;">Inside jokes</td>
          <td style="padding:8px 0;font-size:14px;color:#334155;white-space:pre-wrap;">${insideJokes}</td>
        </tr>
      </table>
    </div>

    <div style="background:#f8fafc;border-radius:12px;padding:14px 20px;border:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">Order ID: <span style="font-family:monospace;color:#64748b;">${order.id}</span></p>
    </div>

  </div>
</body>
</html>`,
      });
    } catch (err) {
      console.error("Admin checkout-start email error:", err);
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout failed:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
