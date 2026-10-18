/**
 * Attar House Nepal — Shipping & Payments config (EDITABLE DRAFT)
 * =================================================================
 * Owner: edit fees and policies here. Per owner decision there is
 * currently NO free-delivery promise and NO complimentary vial offer.
 *
 * Backend note: POST /api/orders currently totals cart items only —
 * shipping is shown as an estimate and appended to order notes.
 * Concierge confirms final delivery fee. No schema change made.
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
    detail: "NPR 99 estimate — EDIT ME",
    fee: 99,
  },
  {
    id: "outside",
    label: "Outside Valley (Nepal)",
    detail: "PROPOSED: flat NPR 149, COD available — EDIT ME",
    fee: 149,
  },
  {
    id: "international",
    label: "International",
    detail: "On request via concierge — EDIT ME",
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
  cod: "Cash on Delivery — pay on receipt. Available Valley + outside (proposed).",
  qr: "Fonepay / Mobile Banking QR — scan, pay, upload screenshot + transaction ID.",
  esewa: "eSewa — TEST MODE until merchant keys are set (backend returns mock redirect). Do not claim live until verified.",
  khalti: "Khalti — TEST MODE until secret key is set (backend returns mock pidx). Do not claim live until verified.",
};
