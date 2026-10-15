import { Link } from 'wouter';
import { Clock, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { ATTAR_SHIPPING_ZONES } from '@/lib/attar-shipping';

const sections = [
  {
    icon: Clock,
    title: 'Flacon Inspection & Curing',
    body: 'Each flacon of Attar House Nepal is individually inspected, hand-filled, and cold-sealed upon allocation. We do not store pre-boxed mass stock. Standard collection orders are dispatched within 2-4 business days.',
  },
  {
    icon: ShieldCheck,
    title: 'Climate-Insulated Luxury Packaging',
    body: 'Fragrance absolutes and organic resins are sensitive to rapid temperature shifts. Every flacon is cocooned in thermal-shielded, shock-absorbent presentation casing with tamper-evident golden seals to preserve olfactory purity throughout transit.',
  },
  {
    icon: Truck,
    title: 'White-Glove Courier Delivery',
    body: 'All consignments are dispatched via insured, tracked courier services requiring an adult signature upon delivery. Tracking coordinates are transmitted via private concierge email as soon as your flacon leaves our Maison vault.',
  },
  {
    icon: Truck,
    title: 'Careful Handling',
    body: 'Attar oils are packed to prevent leaks and breakage. If anything arrives damaged, photograph the parcel and contact us within 48 hours for a replacement.',
  },
];

export default function ShippingPage() {
  return (
    <div className="pt-36 pb-28 bg-[#FAF8F5] text-neutral-900 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="mb-12">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#8C6D37] mb-2 block">
            Maison Services
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-normal text-neutral-950 mb-4">
            Shipping & White-Glove Delivery
          </h1>
          <p className="text-neutral-600 font-light text-base md:text-lg leading-relaxed">
            How your precious flacon is protected, packed, and delivered from our atelier vault directly to your residence.
          </p>
        </div>

        <div className="space-y-10 mb-12">
          {sections.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-6 p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-[#C5A265]/10 border border-[#C5A265]/30 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-[#8C6D37]" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-normal text-neutral-900 mb-2">{title}</h2>
                <p className="text-neutral-600 font-light text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-10 shadow-md mb-8">
          <h3 className="font-serif text-2xl font-normal text-neutral-900 mb-2">Delivery zones</h3>
          <p className="text-neutral-600 font-light text-sm leading-relaxed mb-6">
            Estimates only. Backend charges cart subtotal; concierge confirms the final delivery fee at checkout.
          </p>
          <div className="space-y-3">
            {ATTAR_SHIPPING_ZONES.map((z) => (
              <div key={z.id} className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 p-4">
                <div>
                  <p className="font-semibold text-sm text-neutral-900">{z.label}</p>
                  <p className="text-xs text-neutral-500 font-light mt-0.5">{z.detail}</p>
                </div>
                <span className="font-mono text-xs font-semibold text-neutral-900 shrink-0">{z.fee === 0 ? "On request" : `NPR ${z.fee}`}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-8 sm:p-10 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#C5A265]" />
            <h3 className="font-serif text-2xl font-normal text-neutral-900">Concierge Delivery Support</h3>
          </div>
          <p className="text-neutral-600 font-light text-sm leading-relaxed mb-6">
            For specialized time-critical delivery, private jet charter handover, or international diplomatic courier dispatch, please contact our private concierge directly.
          </p>
          <p className="text-neutral-600 font-light text-sm leading-relaxed">
            Questions regarding an in-transit order?{' '}
            <Link href="/contact" className="text-[#8C6D37] font-medium underline underline-offset-4 hover:text-neutral-950">
              Inquire with Concierge
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}