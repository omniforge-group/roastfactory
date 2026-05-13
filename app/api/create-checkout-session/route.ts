import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

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
      insideJokes,
      extraInfo,
      customerName,
      email,
    } = body;

    if (!pkg || !roastTarget || !occasion || !roastLevel || !insideJokes || !customerName || !email) {
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

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout failed:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
