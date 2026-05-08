import { NextRequest, NextResponse } from "next/server";

const MOCK_APPROVAL_DELAY_MS = 9000;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (id.startsWith("mock_")) {
    // Stateless mock: parse timestamp from id and auto-approve after delay
    const [, timestampStr] = id.split("_");
    const createdAt = parseInt(timestampStr, 10);
    const elapsed = Date.now() - createdAt;

    return NextResponse.json({
      status: elapsed >= MOCK_APPROVAL_DELAY_MS ? "approved" : "pending",
      payment_id: elapsed >= MOCK_APPROVAL_DELAY_MS ? `mp_pay_${id.slice(-8)}` : null,
      mock: true,
    });
  }

  // Real MercadoPago — search by external_reference (preference id is used as external ref)
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ status: "pending", mock: true });
  }

  const res = await fetch(
    `https://api.mercadopago.com/v1/payments/search?external_reference=${id}&sort=date_created&criteria=desc&range=date_created&begin_date=NOW-1DAYS&end_date=NOW`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  const payment = data.results?.[0];

  if (!payment) return NextResponse.json({ status: "pending" });

  return NextResponse.json({
    status: payment.status === "approved" ? "approved" : payment.status === "rejected" ? "rejected" : "pending",
    payment_id: payment.id ?? null,
    mock: false,
  });
}
