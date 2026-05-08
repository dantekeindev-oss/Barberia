import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  // Acknowledge MercadoPago notification immediately.
  // Status polling via /api/mp/status/[id] handles the actual payment confirmation.
  return NextResponse.json({ received: true }, { status: 200 });
}
