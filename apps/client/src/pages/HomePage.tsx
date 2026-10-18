import { HeroCarousel } from "@/components/home/HeroCarousel";
import {
  BestsellingAttars,
  CraftPreview,
  ExploreByFamily,
  NewArrivals,
  OffersAndCombos,
  ShopByBrand,
  TrustSection,
} from "@/components/home/HomeSections";
import { useAttarSEO, ATTAR_SEO } from "@/lib/attar-seo";

export default function HomePage() {
  useAttarSEO(ATTAR_SEO.home.title, ATTAR_SEO.home.desc);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Offset for the fixed full-width header (bar + nav) */}
      <div className="pt-[118px] md:pt-[112px]">
        <HeroCarousel />
      </div>

      <main>
        <BestsellingAttars />
        <ShopByBrand />
        <ExploreByFamily />
        <NewArrivals />
        <CraftPreview />
        <OffersAndCombos />
        <TrustSection />
      </main>
    </div>
  );
}
