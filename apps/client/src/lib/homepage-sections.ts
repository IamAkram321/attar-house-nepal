import { useQuery } from "@tanstack/react-query";
import { API_URL } from "./api-url";

export interface HomepageSectionContent {
  key: string;
  eyebrow: string | null;
  title: string;
  description: string | null;
  image: string | null;
  primaryCtaLabel: string | null;
  primaryCtaHref: string | null;
  secondaryCtaLabel: string | null;
  secondaryCtaHref: string | null;
  overlayTitle: string | null;
  overlaySubtitle: string | null;
  sortOrder: number;
  isActive: boolean;
}

/** Bundled fallback — identical to the server defaults, shown only after
 *  the fetch settles (the section renders a skeleton first, never a swap). */
export const HOMEPAGE_SECTION_FALLBACKS: Record<string, HomepageSectionContent> = {
  "why-attar": {
    key: "why-attar",
    eyebrow: "Why attar",
    title: "Concentrated oils, honest sizes",
    description:
      "Small bottles, profound presence. Concentrated, alcohol-free oils worn close to the skin — from a 3ml discovery to a 12ml devotion, every oil lists only its own sizes, each honestly priced.",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200",
    primaryCtaLabel: "Shop attars",
    primaryCtaHref: "/shop?kind=attar",
    secondaryCtaLabel: "How to apply",
    secondaryCtaHref: "/faq",
    overlayTitle: "3ml · 6ml · 9ml · 10ml · 12ml",
    overlaySubtitle: "Alcohol-free concentrated oils — sizes and prices shown per product.",
    sortOrder: 0,
    isActive: true,
  },
};

export function useHomepageSection(key: string) {
  const query = useQuery({
    queryKey: ["homepage-section", key],
    queryFn: async (): Promise<HomepageSectionContent> => {
      const res = await fetch(`${API_URL}/api/homepage-sections/${key}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load section");
      const data = (await res.json()) as { section: HomepageSectionContent };
      return data.section;
    },
    staleTime: 60_000,
    retry: 1,
  });

  const section = query.data ?? HOMEPAGE_SECTION_FALLBACKS[key];
  return { ...query, section };
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

export const homepageAdminApi = {
  getAll: () => adminFetch("/homepage-sections") as Promise<{ sections: HomepageSectionContent[]; availableKeys: string[] }>,
  save: (key: string, input: Partial<HomepageSectionContent>) =>
    adminFetch(`/homepage-sections/${key}`, { method: "PUT", body: JSON.stringify(input) }),
};
