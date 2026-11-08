/**
 * Attar House Nepal — Shipping & Payments config (EDITABLE DRAFT)
 * =================================================================
 * Owner: edit fees and policies here. Per owner decision there is
 * currently NO free-delivery promise and NO complimentary vial offer.
 *
 * Checkout note: POST /api/orders totals cart items only. Delivery is
 * arranged separately via Pathao/Indrive and paid directly by the receiver
 * to the driver based on the actual fare. No schema change made.
 */

export interface ShippingZone {
  id: string;
  label: string;
  detail: string;
  fee: number;
  freeOver?: number;
}

export const ATTAR_SHIPPING_ZONES: ShippingZone[] = [
  {
    id: "valley",
    label: "Kathmandu Valley",
    detail: "Delivered via Pathao/Indrive",
    fee: 99,
  },
  {
    id: "outside",
    label: "Outside Valley (Nepal)",
    detail: "Delivered via Pathao/Indrive",
    fee: 149,
  },
  {
    id: "international",
    label: "International",
    detail: "Concierge will confirm delivery arrangement",
    fee: 0,
  },
];

export function quoteShipping(zoneId: string, subtotal: number): { fee: number; note: string } {
  const zone = ATTAR_SHIPPING_ZONES.find((z) => z.id === zoneId) ?? ATTAR_SHIPPING_ZONES[0];
  if (zone.freeOver !== undefined && subtotal >= zone.freeOver) {
    return { fee: 0, note: `${zone.label}: FREE (over NPR ${zone.freeOver}) — proposed, to confirm` };
  }
  if (zone.fee === 0) return { fee: 0, note: `${zone.label}: on request — concierge confirms` };
  return { fee: zone.fee, note: `${zone.label}: NPR ${zone.fee} estimate — concierge confirms` };
}

export const PAYMENT_GUIDE = {
  cod: "Cash on Delivery — pay the product amount on receipt. Delivery fare is paid separately to the driver.",
  qr: "Fonepay / Mobile Banking QR — scan, pay, upload screenshot (transaction ID optional).",
  esewa: "eSewa QR — scan, pay, upload screenshot (transaction ID optional).",
  khalti: "Khalti QR — scan, pay, upload screenshot (transaction ID optional).",
};
