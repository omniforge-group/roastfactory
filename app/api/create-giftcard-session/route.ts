import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const { buyerEmail, locale = "nl" } = await req.json();

    if (!buyerEmail || !buyerEmail.includes("@")) {
      return NextResponse.json({ error: "Geldig e-mailadres vereist" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: buyerEmail,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "SongFactory Cadeaubon",
              description: "Persoonlijk lied op maat — te besteden op songfactory.eu/bestellen",
            },
            unit_amount: 1495,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "gift_card",
        buyer_email: buyerEmail,
        locale,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/giftcard/succes`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${locale}/giftcard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("❌ create-giftcard-session error:", err);
    return NextResponse.json({ error: "Betaalpagina kon niet worden aangemaakt" }, { status: 500 });
  }
}
