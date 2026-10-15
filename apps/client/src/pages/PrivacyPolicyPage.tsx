import { Link } from 'wouter';

const sections = [
  {
    title: '1. Information We Collect',
    body: `When you visit or commission products through Attar House Nepal, we may collect: your name, contact email address, physical delivery address, telephone number, and order history. If you sign in via Google, we receive basic profile coordinates (name, email address, profile avatar) from Google strictly for session identification.`,
  },
  {
    title: '2. Use of Olfactory Preferences',
    body: `Information you share about fragrance preferences and sensitivities (favorite families, notes to avoid) is maintained with strict discretion. We use your data exclusively to recommend attars, fulfill orders, and communicate concierge updates. We never monetize or sell patron information to third parties.`,
  },
  {
    title: '3. Sessions & Encrypted Storage',
    body: `We employ essential session tokens to preserve your shopping bag and maintain authenticated sessions. These tokens are secured and never utilized for unauthorized behavioral ad tracking.`,
  },
  {
    title: '4. Third-Party Fulfillment & Couriers',
    body: `Your delivery coordinates are shared solely with authorized white-glove courier partners to complete climate-protected flacon delivery and verify receipt.`,
  },
  {
    title: '5. Order Record Retention',
    body: `Your order history is retained so that reorders and support requests can be handled accurately. Contact the concierge at any time to review your records.`,
  },
  {
    title: '6. Patron Rights',
    body: `You retain the absolute right to inspect, amend, or request the deletion of your personal contact records at any time by contacting our private concierge at concierge@ayeshafragrances.com.`,
  },
  {
    title: '7. Revisions to This Policy',
    body: `Any revisions to this Privacy Policy will be published on this portal with an updated ratification date.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-36 pb-28 bg-[#FAF8F5] text-neutral-900 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#8C6D37] mb-2 block">
          Legal & Privacy
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-neutral-950 mb-3">Privacy Policy</h1>
        <p className="font-mono text-xs text-neutral-400 uppercase tracking-widest mb-12">Effective: October 2026</p>

        <p className="text-neutral-600 font-light text-base leading-relaxed mb-12">
          At <strong className="font-medium text-neutral-950">Attar House Nepal</strong>, we respect the utmost privacy and confidentiality of our esteemed patrons. This policy details how your personal records and orders are preserved and safeguarded.
        </p>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs">
              <h2 className="font-serif text-xl font-normal text-neutral-900 mb-2">{s.title}</h2>
              <p className="text-neutral-600 font-light text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-8 mt-12 shadow-sm">
          <h3 className="font-serif text-xl font-normal text-neutral-900 mb-2">Questions Regarding Your Records?</h3>
          <p className="text-neutral-600 font-light text-sm leading-relaxed">
            Please direct all inquiries to{' '}
            <a href="mailto:concierge@ayeshafragrances.com" className="text-[#8C6D37] underline font-medium">
              concierge@ayeshafragrances.com
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}