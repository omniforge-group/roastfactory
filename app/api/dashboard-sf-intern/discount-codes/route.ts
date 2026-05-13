import Stripe from "stripe";
import { verifySession } from "@/lib/admin-auth";
import { logActivity } from "@/lib/activity-log";
import { stripe } from "@/lib/stripe";

export async function GET(req: Request) {
  const user = verifySession(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "tier2") return Response.json({ error: "Forbidden" }, { status: 403 });

  const promoCodes = await stripe.promotionCodes.list({
    limit: 100,
    expand: ["data.coupon"],
  });

  const codes = promoCodes.data.map(pc => {
    const coupon = pc.coupon as {
      percent_off: number | null;
      amount_off: number | null;
      currency: string | null;
      name: string | null;
    };
    return {
      id: pc.id,
      code: pc.code,
      active: pc.active,
      coupon_id: pc.coupon.id,
      coupon_name: coupon.name,
      percent_off: coupon.percent_off,
      amount_off: coupon.amount_off,
      currency: coupon.currency,
      times_redeemed: pc.times_redeemed,
      max_redemptions: pc.max_redemptions,
      expires_at: pc.expires_at,
      created: pc.created,
    };
  });

  return Response.json(codes);
}

export async function POST(req: Request) {
  const actor = verifySession(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "admin" && actor.role !== "tier2") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { code, type, amount, max_redemptions, expires_at } = await req.json();

  if (!code || !type || !amount) {
    return Response.json({ error: "code, type en amount zijn verplicht." }, { status: 400 });
  }

  const couponParams: Stripe.CouponCreateParams = {
    name: code,
    duration: "once",
  };

  if (type === "percent") {
    couponParams.percent_off = Number(amount);
  } else {
    couponParams.amount_off = Math.round(Number(amount) * 100); // euro → centen
    couponParams.currency = "eur";
  }

  const coupon = await stripe.coupons.create(couponParams);

  const promoParams: Stripe.PromotionCodeCreateParams = {
    coupon: coupon.id,
    code: code.toUpperCase(),
  };
  if (max_redemptions) promoParams.max_redemptions = Number(max_redemptions);
  if (expires_at) promoParams.expires_at = Math.floor(new Date(expires_at).getTime() / 1000);

  const promoCode = await stripe.promotionCodes.create(promoParams);

  const detail = type === "percent"
    ? `${amount}% korting`
    : `€${amount} korting`;
  await logActivity(actor.userId, actor.name, "kortingscode_aangemaakt", `${code} — ${detail}`);

  return Response.json({ ok: true, id: promoCode.id, code: promoCode.code }, { status: 201 });
}

export async function DELETE(req: Request) {
  const actor = verifySession(req);
  if (!actor) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (actor.role !== "admin" && actor.role !== "tier2") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id, coupon_id, code } = await req.json();
  if (!id || !coupon_id) return Response.json({ error: "Missing id or coupon_id" }, { status: 400 });

  await stripe.promotionCodes.update(id, { active: false });
  await stripe.coupons.del(coupon_id);

  await logActivity(actor.userId, actor.name, "kortingscode_verwijderd", `${code || id}`);
  return Response.json({ ok: true });
}
