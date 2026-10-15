import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "./api-url";
import { buildShopHref } from "./catalog";

export interface HeroSlide {
  id: number | string;
  title: string;
  description: string | null;
  image: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface CarouselResponse {
  slides: HeroSlide[];
  total: number;
}

export const FALLBACK_HERO_SLIDES: HeroSlide[] = [
  {
    id: "fallback-musk",
    title: "Musk attars for everyday wear",
    description: "Clean, close-to-skin Tahara and white musk oils from Al-Nuaim and Al-Rehab.",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1600",
    ctaLabel: "Shop Musk attars",
    ctaHref: buildShopHref({ kind: "attar", family: "musk" }),
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "fallback-oud",
    title: "Oud and Hindi oils",
    description: "Deep agarwood profiles and honeyed blends for evening and winter.",
    image:
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1600",
    ctaLabel: "Shop Oud attars",
    ctaHref: buildShopHref({ kind: "attar", family: "oud" }),
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "fallback-bestsellers",
    title: "Bestselling attars in Nepal",
    description: "Blueberry Musk, Chocolate Musk, Hawas, Khamrah and customer favourites.",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1600",
    ctaLabel: "Shop bestsellers",
    ctaHref: buildShopHref({ preset: "bestsellers" }),
    sortOrder: 2,
    isActive: true,
  },
];

async function fetchSlides(): Promise<HeroSlide[]> {
  const res = await fetch(`${API_URL}/api/carousel-slides`, { credentials: "include" });
  if (!res.ok) return [];
  const data = (await res.json()) as CarouselResponse;
  if (!Array.isArray(data.slides)) return [];
  return data.slides.filter((s) => s.isActive && s.title && s.image);
}

export function useHeroSlides() {
  const query = useQuery({
    queryKey: ["hero-slides"],
    queryFn: fetchSlides,
    staleTime: 60_000,
    retry: 1,
  });
  const slides = useMemo(() => {
    const live = (query.data ?? []).filter((s) => s.isActive);
    return live.length > 0 ? live : FALLBACK_HERO_SLIDES;
  }, [query.data]);
  return { ...query, slides, isFallback: (query.data ?? []).length === 0 };
}

export interface AdminSlide extends HeroSlide {
  createdAt?: string;
}

async function adminFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}/api/admin${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data;
}

export function useAdminSlides() {
  return useQuery({
    queryKey: ["admin-carousel-slides"],
    queryFn: async (): Promise<AdminSlide[]> => {
      const data = (await adminFetch("/carousel-slides")) as { slides: AdminSlide[] };
      return Array.isArray(data.slides) ? data.slides : [];
    },
    staleTime: 15_000,
    retry: 1,
  });
}

export const carouselAdminApi = {
  create: (input: Partial<AdminSlide>) =>
    adminFetch("/carousel-slides", { method: "POST", body: JSON.stringify(input) }),
  update: (id: number | string, input: Partial<AdminSlide>) =>
    adminFetch(`/carousel-slides/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: number | string) => adminFetch(`/carousel-slides/${id}`, { method: "DELETE" }),
};
