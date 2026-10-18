import { Link } from "wouter";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { BrandLogo } from "../common/BrandLogo";
import { buildShopHref } from "@/lib/catalog";

const socials = [
  { icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com" },
  { icon: FaFacebookF, label: "Facebook", href: "https://www.facebook.com" },
  { icon: FaTiktok, label: "TikTok", href: "https://www.tiktok.com" },
];

const shopLinks = [
  { title: "For Him", href: buildShopHref({ audience: "him" }) },
  { title: "For Her", href: buildShopHref({ audience: "her" }) },
  { title: "Unisex", href: buildShopHref({ audience: "unisex" }) },
  { title: "Attars", href: buildShopHref({ kind: "attar" }) },
  { title: "Perfumes", href: buildShopHref({ kind: "perfume" }) },
  { title: "Bestsellers", href: buildShopHref({ preset: "bestsellers" }) },
  { title: "Brands", href: "/brands" },
  { title: "Offers", href: "/offers" },
];

const helpLinks = [
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "FAQ", href: "/faq" },
  { title: "Shipping", href: "/shipping" },
  { title: "Returns", href: "/returns" },
  { title: "Privacy", href: "/privacy-policy" },
  { title: "Terms", href: "/terms" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-pine-ink text-ivory/75 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <BrandLogo variant="light" size="md" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory/65">
              Attar House Nepal is a Nepal-based importer and retailer of established attar houses
              including Al-Nuaim, Al-Rehab and Adil Qadri. Attars are our primary business;
              perfumes are secondary. We do not manufacture attars.
            </p>
            <div className="mt-5 flex gap-2">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-white/15 text-ivory/60 hover:text-ivory hover:border-white/30 transition-colors"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">Shop</p>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((item) => (
                <li key={item.title}>
                  <Link href={item.href} className="text-sm text-ivory/70 hover:text-white transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">Help</p>
            <ul className="mt-4 space-y-2.5">
              {helpLinks.map((item) => (
                <li key={item.title}>
                  <Link href={item.href} className="text-sm text-ivory/70 hover:text-white transition-colors">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory/50">Contact</p>
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-ivory/70">Kathmandu, Nepal</p>
              <div className="space-y-1">
                <a href="tel:+9779869348963" className="block text-ivory/70 hover:text-white transition-colors">
                  +977 9869348963
                </a>
                <a href="tel:+9779823521296" className="block text-ivory/70 hover:text-white transition-colors">
                  +977 9823521296
                </a>
              </div>
              <a
                href="mailto:hello@attarhousenepal.com"
                className="block text-ivory/70 hover:text-white transition-colors break-all"
              >
                hello@attarhousenepal.com
              </a>
              <p className="text-xs text-ivory/50 leading-relaxed">
                Attar oils 3–12ml · Sprays as listed. Sizes and prices confirmed per product.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ivory/45">
          <p>© {currentYear} Attar House Nepal. All rights reserved.</p>
          <p className="uppercase tracking-[0.18em] text-[10px]">Authentic imports · Attars first</p>
        </div>
      </div>
    </footer>
  );
}
