import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  planId: z.enum(["beginner", "pro", "ultimate", "enterprise"]),
  yearly: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { planId } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const plan = PLANS[planId];
    if (!plan?.stripePriceId) {
      return NextResponse.json({ error: "Cena Stripe nie jest skonfigurowana" }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/ustawienia/platnosci?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/ustawienia/platnosci?canceled=true`,
      metadata: { userId: user.id, planId },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
    }
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Błąd płatności" }, { status: 500 });
  }
}
