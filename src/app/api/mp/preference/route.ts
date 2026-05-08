import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { amount, description, externalReference } = await req.json();

  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (accessToken) {
    // Real MercadoPago API
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ title: description, quantity: 1, unit_price: amount, currency_id: "ARS" }],
        external_reference: externalReference,
        auto_return: "all",
        ...(process.env.NEXT_PUBLIC_APP_URL && {
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mp/webhook`,
        }),
      }),
    });
    const data = await res.json();
    return NextResponse.json({
      id: data.id,
      qr_data: data.init_point,
      init_point: data.init_point,
      mock: false,
    });
  }

  // Mock mode — encode creation timestamp in the ID for stateless status polling
  const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const qrContent = `MERCADOPAGO|COBRO|ARS ${amount}|${description}|${id}`;

  return NextResponse.json({
    id,
    qr_data: qrContent,
    init_point: null,
    mock: true,
  });
}
