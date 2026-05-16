import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { resend } from "@/lib/resend";


const PACKAGE_LABELS: Record<string, string> = {
  quick_roast:  "Quick Roast",
  savage_pack:  "Savage Pack",
  nuclear_pack: "Nuclear Pack",
  battle_mode:  "Battle Mode",
};

const ROAST_LEVEL_LABELS: Record<string, string> = {
  mild:    "Mild 😅",
  medium:  "Medium 😬",
  savage:  "Savage 🔥",
  nuclear: "Nuclear ☢️",
};

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return new Response("Missing stripe-signature", { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature error:", err);
      return new Response("Webhook Error", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (!orderId) {
        console.error("Missing order_id in metadata");
        return new Response("No order_id", { status: 400 });
      }

      // Betaald bedrag en kortingsbedrag uit Stripe sessie
      const amountPaid = session.amount_total != null ? session.amount_total / 100 : null;
      const discountAmount = session.total_details?.amount_discount
        ? session.total_details.amount_discount / 100
        : 0;

      // Kortingscode ophalen via Stripe API
      let discountCode: string | null = null;
      if (session.discounts && session.discounts.length > 0) {
        const promoRef = session.discounts[0].promotion_code;
        const promoId = typeof promoRef === "string" ? promoRef : (promoRef as { id: string } | null)?.id;
        if (promoId) {
          try {
            const promo = await stripe.promotionCodes.retrieve(promoId);
            discountCode = promo.code;
          } catch {}
        }
      }

      const { data: order, error } = await supabaseAdmin
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          amount_paid: amountPaid,
          discount_amount: discountAmount,
          discount_code: discountCode,
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error || !order) {
        console.error("Supabase update failed:", error);
        return new Response("Database error", { status: 500 });
      }

      const packageLabel = PACKAGE_LABELS[order.package] ?? order.package;
      const roastLevelLabel = ROAST_LEVEL_LABELS[order.roast_level] ?? order.roast_level;
      const endingLabel = order.ending === "positive" ? "😂 Positief afsluiten" : order.ending === "oneliner" ? "💥 One-liner" : null;
      const priceFormatted = `€${Number(order.price).toFixed(2).replace(".", ",")}`;

      // ── Bevestigingsmail naar klant ──────────────────────────────────────
      try {
        await resend.emails.send({
          from: "RoastFactory <roasts@songfactory.eu>",
          to: order.customer_email,
          subject: `Je roast is besteld! 🔥`,
          html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,Helvetica,sans-serif;">

  <div style="background:linear-gradient(135deg,#FF2D2D 0%,#FF6B00 100%);padding:40px 32px;text-align:center;">
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.75);">ROASTFACTORY</p>
    <h1 style="margin:0;font-size:30px;font-weight:900;color:#ffffff;line-height:1.2;">Je roast is besteld! 🔥</h1>
  </div>

  <div style="max-width:600px;margin:0 auto;padding:0 16px 48px;">

    <div style="background:#1A1A1A;border-radius:20px;padding:32px;margin-top:24px;border:1px solid #2A2A2A;">
      <p style="margin:0 0 16px;font-size:16px;color:#ffffff;">Hi <strong>${order.customer_name}</strong>,</p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#AAAAAA;">
        We gaan aan de slag voor <strong style="color:#FF6B00;">${order.roast_target}</strong>. Je ontvangt je roast <strong style="color:#ffffff;">binnen 24 uur</strong> op dit e-mailadres.
      </p>

      <div style="background:#0A0A0A;border:1px solid #FF2D2D44;border-radius:14px;padding:20px;margin:24px 0;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #2A2A2A;font-size:13px;color:#888888;width:140px;">Pakket</td>
            <td style="padding:8px 0;border-bottom:1px solid #2A2A2A;font-size:14px;font-weight:700;color:#FF6B00;">${packageLabel} — ${priceFormatted}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #2A2A2A;font-size:13px;color:#888888;">Roast target</td>
            <td style="padding:8px 0;border-bottom:1px solid #2A2A2A;font-size:14px;font-weight:600;color:#ffffff;">${order.roast_target}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #2A2A2A;font-size:13px;color:#888888;">Gelegenheid</td>
            <td style="padding:8px 0;border-bottom:1px solid #2A2A2A;font-size:14px;color:#ffffff;">${order.occasion}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;${endingLabel ? "border-bottom:1px solid #2A2A2A;" : ""}font-size:13px;color:#888888;">Roast level</td>
            <td style="padding:8px 0;${endingLabel ? "border-bottom:1px solid #2A2A2A;" : ""}font-size:14px;color:#ffffff;">${roastLevelLabel}</td>
          </tr>
          ${endingLabel ? `<tr>
            <td style="padding:8px 0;font-size:13px;color:#888888;">Afsluiting</td>
            <td style="padding:8px 0;font-size:14px;color:#ffffff;">${endingLabel}</td>
          </tr>` : ""}
        </table>
      </div>

      <p style="margin:0;font-size:13px;color:#666666;background:#111111;border-radius:10px;padding:12px 16px;">
        💡 <strong style="color:#888888;">Spam tip:</strong> Ontvang je geen mail? Check dan ook je spamfolder of ongewenste mail.
      </p>
    </div>

    <div style="text-align:center;margin-top:28px;">
      <p style="font-size:13px;color:#555555;margin:0;">Vragen? Mail naar <a href="mailto:info@songfactory.eu" style="color:#FF6B00;">info@songfactory.eu</a></p>
      <p style="font-size:12px;color:#333333;margin:8px 0 0;">© RoastFactory.eu</p>
    </div>

  </div>
</body>
</html>`,
        });
      } catch (err) {
        console.error("Confirmation email error:", err);
      }

      // ── Adminmail ────────────────────────────────────────────────────────
      try {
        await resend.emails.send({
          from: "RoastFactory <roasts@songfactory.eu>",
          to: process.env.ADMIN_EMAIL || 'info@songfactory.eu',
          subject: `✅ Betaling ontvangen — ${packageLabel} voor ${order.roast_target}`,
          html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">

  <div style="background:linear-gradient(135deg,#FF2D2D 0%,#FF6B00 100%);padding:28px 32px;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.75);">RoastFactory Admin</p>
    <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;">Nieuwe roast bestelling 🔥</h1>
  </div>

  <div style="max-width:600px;margin:0 auto;padding:24px 16px 48px;">

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 20px;margin-bottom:20px;">
      <p style="margin:0;font-size:15px;font-weight:700;color:#15803d;">✅ Betaald: ${priceFormatted} — ${packageLabel}</p>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:0 2px 8px rgba(15,23,42,0.06);">
      <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Klantgegevens</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:140px;">Naam</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:#0f172a;">${order.customer_name}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;">E-mail</td>
          <td style="padding:8px 0;font-size:14px;color:#0f172a;"><a href="mailto:${order.customer_email}" style="color:#FF2D2D;">${order.customer_email}</a></td>
        </tr>
      </table>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:0 2px 8px rgba(15,23,42,0.06);">
      <p style="margin:0 0 16px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Roast details</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:140px;">Roast target</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:#0f172a;">${order.roast_target}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Gelegenheid</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">${order.occasion}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Roast level</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">${roastLevelLabel}</td>
        </tr>
        ${endingLabel ? `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Afsluiting</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">${endingLabel}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;">Pakket</td>
          <td style="padding:8px 0;font-size:14px;font-weight:700;color:#FF2D2D;">${packageLabel}</td>
        </tr>
      </table>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:0 2px 8px rgba(15,23,42,0.06);">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Inside jokes & bijnamen</p>
      <p style="margin:0;font-size:14px;line-height:1.8;color:#334155;white-space:pre-wrap;">${order.inside_jokes}</p>
    </div>

    ${order.extra_info ? `
    <div style="background:#ffffff;border-radius:16px;padding:24px;margin-bottom:16px;box-shadow:0 2px 8px rgba(15,23,42,0.06);">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;">Extra info</p>
      <p style="margin:0;font-size:14px;line-height:1.8;color:#334155;white-space:pre-wrap;">${order.extra_info}</p>
    </div>
    ` : ""}

    <div style="background:#f8fafc;border-radius:12px;padding:14px 20px;border:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">Order ID: <span style="font-family:monospace;color:#64748b;">${order.id}</span></p>
    </div>

  </div>
</body>
</html>`,
        });
      } catch (err) {
        console.error("Admin email error:", err);
      }

      // Push notificaties
      console.log("✅ Order betaald en mails verstuurd:", orderId);
    }

    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      let packageLabel = "—";
      let roastTarget = "onbekend";
      let customerEmail = session.customer_email ?? "—";
      let customerName = "—";

      if (orderId) {
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("package, roast_target, customer_email, customer_name")
          .eq("id", orderId)
          .single();

        if (order) {
          packageLabel = PACKAGE_LABELS[order.package] ?? order.package;
          roastTarget = order.roast_target;
          customerEmail = order.customer_email;
          customerName = order.customer_name;
        }
      }

      try {
        await resend.emails.send({
          from: "RoastFactory <roasts@songfactory.eu>",
          to: process.env.ADMIN_EMAIL || 'info@songfactory.eu',
          subject: `❌ Checkout verlopen — ${packageLabel} voor ${roastTarget}`,
          html: `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">

  <div style="background:#7f1d1d;padding:28px 32px;text-align:center;">
    <p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#fca5a5;">RoastFactory Admin</p>
    <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;">❌ Checkout verlopen</h1>
  </div>

  <div style="max-width:600px;margin:0 auto;padding:24px 16px 48px;">

    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 20px;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#991b1b;">Klant heeft betaling niet afgerond</p>
    </div>

    <div style="background:#ffffff;border-radius:16px;padding:24px;box-shadow:0 2px 8px rgba(15,23,42,0.06);">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:140px;">Naam</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">${customerName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">E-mail</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">${customerEmail}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Pakket</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:700;color:#FF2D2D;">${packageLabel}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;">Roast target</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0f172a;">${roastTarget}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#64748b;">Session ID</td>
          <td style="padding:8px 0;font-size:13px;font-family:monospace;color:#64748b;">${session.id}</td>
        </tr>
      </table>
    </div>

  </div>
</body>
</html>`,
        });
      } catch (err) {
        console.error("Expired checkout admin email error:", err);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook crash:", error);
    return new Response("Webhook failed", { status: 500 });
  }
}
