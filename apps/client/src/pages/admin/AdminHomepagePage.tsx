import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LayoutTemplate, RotateCcw } from "lucide-react";
import {
  homepageAdminApi,
  HOMEPAGE_SECTION_FALLBACKS,
  type HomepageSectionContent,
} from "@/lib/homepage-sections";
import { uploadFilesWithTimeout } from "@/lib/api-url";

interface SectionForm {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  overlayTitle: string;
  overlaySubtitle: string;
  isActive: boolean;
}

const emptyForm: SectionForm = {
  eyebrow: "",
  title: "",
  description: "",
  image: "",
  primaryCtaLabel: "",
  primaryCtaHref: "",
  secondaryCtaLabel: "",
  secondaryCtaHref: "",
  overlayTitle: "",
  overlaySubtitle: "",
  isActive: true,
};

function toForm(s: HomepageSectionContent): SectionForm {
  return {
    eyebrow: s.eyebrow ?? "",
    title: s.title ?? "",
    description: s.description ?? "",
    image: s.image ?? "",
    primaryCtaLabel: s.primaryCtaLabel ?? "",
    primaryCtaHref: s.primaryCtaHref ?? "",
    secondaryCtaLabel: s.secondaryCtaLabel ?? "",
    secondaryCtaHref: s.secondaryCtaHref ?? "",
    overlayTitle: s.overlayTitle ?? "",
    overlaySubtitle: s.overlaySubtitle ?? "",
    isActive: s.isActive ?? true,
  };
}

export default function AdminHomepagePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeKey, setActiveKey] = useState("why-attar");
  const [form, setForm] = useState<SectionForm>(emptyForm);
  const [customized, setCustomized] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-homepage-sections"],
    queryFn: () => homepageAdminApi.getAll(),
    staleTime: 15_000,
    retry: 1,
  });

  const keys = data?.availableKeys?.length ? data.availableKeys : Object.keys(HOMEPAGE_SECTION_FALLBACKS);
  const saved = (data?.sections ?? []).find((s) => s.key === activeKey);
  const preview: HomepageSectionContent = {
    ...(HOMEPAGE_SECTION_FALLBACKS[activeKey] as HomepageSectionContent),
    ...Object.fromEntries(Object.entries(form).filter(([, v]) => v !== "" || typeof v === "boolean")),
    key: activeKey,
  };

  useEffect(() => {
    if (saved) {
      setForm(toForm(saved));
      setCustomized(true);
    } else if (HOMEPAGE_SECTION_FALLBACKS[activeKey]) {
      setForm(toForm(HOMEPAGE_SECTION_FALLBACKS[activeKey] as HomepageSectionContent));
      setCustomized(false);
    }
  }, [saved, activeKey]);

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => homepageAdminApi.save(activeKey, body),
    onSuccess: () => {
      toast({ title: "Homepage section saved" });
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-section", activeKey] });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { ok, data: payload } = await uploadFilesWithTimeout([file]);
      const url: string | undefined =
        payload?.urls?.[0] ?? payload?.files?.[0]?.url ?? payload?.url ?? payload?.images?.[0];
      if (!ok || !url) throw new Error(payload?.error ?? "Upload failed");
      setForm((f) => ({ ...f, image: url }));
      toast({ title: "Image uploaded" });
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Please paste an image URL instead.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const set = (k: keyof SectionForm) => (value: string | boolean) =>
    setForm((f) => ({ ...f, [k]: value }));

  const submit = () => {
    if (!form.title.trim()) {
      toast({ title: "Heading is required", variant: "destructive" });
      return;
    }
    save.mutate({
      eyebrow: form.eyebrow.trim() || null,
      title: form.title.trim(),
      description: form.description.trim() || null,
      image: form.image.trim() || null,
      primaryCtaLabel: form.primaryCtaLabel.trim() || null,
      primaryCtaHref: form.primaryCtaHref.trim() || null,
      secondaryCtaLabel: form.secondaryCtaLabel.trim() || null,
      secondaryCtaHref: form.secondaryCtaHref.trim() || null,
      overlayTitle: form.overlayTitle.trim() || null,
      overlaySubtitle: form.overlaySubtitle.trim() || null,
      isActive: form.isActive,
    });
  };

  const resetToDefault = () => {
    if (HOMEPAGE_SECTION_FALLBACKS[activeKey]) {
      setForm(toForm(HOMEPAGE_SECTION_FALLBACKS[activeKey] as HomepageSectionContent));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Homepage Content</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Edit the homepage “Why Attar” section — text, photo, buttons and visibility.
              Changes appear on the storefront immediately.
            </p>
          </div>
          <Button onClick={submit} disabled={save.isPending} className="h-9 text-xs font-semibold rounded-xl shrink-0">
            {save.isPending ? "Saving…" : customized ? "Save changes" : "Publish section"}
          </Button>
        </div>

        {keys.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {keys.map((k) => (
              <Button
                key={k}
                variant={k === activeKey ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveKey(k)}
              >
                {k}
              </Button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="h-64 rounded-2xl bg-muted animate-pulse" />
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* Form */}
            <div className="rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Section: {activeKey}
                </p>
                <div className="flex items-center gap-2">
                  <Switch id="section-active" checked={form.isActive} onCheckedChange={(v) => set("isActive")(v)} />
                  <Label htmlFor="section-active">Show on homepage</Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sec-eyebrow">Eyebrow</Label>
                <Input id="sec-eyebrow" value={form.eyebrow} onChange={(e) => set("eyebrow")(e.target.value)} placeholder="Why attar" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sec-title">Heading *</Label>
                <Input id="sec-title" value={form.title} onChange={(e) => set("title")(e.target.value)} placeholder="Concentrated oils, honest sizes" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sec-desc">Description</Label>
                <Textarea id="sec-desc" value={form.description} onChange={(e) => set("description")(e.target.value)} rows={4} placeholder="A few warm lines about attar…" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sec-image">Photo URL</Label>
                <Input id="sec-image" value={form.image} onChange={(e) => set("image")(e.target.value)} placeholder="https://…" />
                <Input type="file" accept="image/*" disabled={uploading} onChange={(e) => handleUpload(e.target.files?.[0])} className="text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sec-cta1">Primary button</Label>
                  <Input id="sec-cta1" value={form.primaryCtaLabel} onChange={(e) => set("primaryCtaLabel")(e.target.value)} placeholder="Shop attars" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sec-href1">Primary link</Label>
                  <Input id="sec-href1" value={form.primaryCtaHref} onChange={(e) => set("primaryCtaHref")(e.target.value)} placeholder="/shop?kind=attar" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sec-cta2">Secondary button</Label>
                  <Input id="sec-cta2" value={form.secondaryCtaLabel} onChange={(e) => set("secondaryCtaLabel")(e.target.value)} placeholder="How to apply" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sec-href2">Secondary link</Label>
                  <Input id="sec-href2" value={form.secondaryCtaHref} onChange={(e) => set("secondaryCtaHref")(e.target.value)} placeholder="/faq" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sec-ovt">Photo strip title</Label>
                  <Input id="sec-ovt" value={form.overlayTitle} onChange={(e) => set("overlayTitle")(e.target.value)} placeholder="3ml · 6ml · 9ml · 10ml · 12ml" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sec-ovs">Photo strip subtitle</Label>
                  <Input id="sec-ovs" value={form.overlaySubtitle} onChange={(e) => set("overlaySubtitle")(e.target.value)} placeholder="…" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={resetToDefault}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset to default text
                </Button>
              </div>
            </div>

            {/* Live preview */}
            <div className="rounded-2xl border border-border overflow-hidden lg:sticky lg:top-6">
              <p className="px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground border-b border-border flex items-center gap-2">
                <LayoutTemplate className="h-3.5 w-3.5" /> Storefront preview
              </p>
              {!form.isActive ? (
                <p className="p-8 text-sm text-muted-foreground text-center">
                  Hidden — this section will not appear on the homepage until “Show on homepage” is on.
                </p>
              ) : (
                <div className="p-5 space-y-4 bg-ivory">
                  {preview.eyebrow && (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brass-deep">{preview.eyebrow}</p>
                  )}
                  <p className="text-2xl font-semibold tracking-tight text-coal">{preview.title || "Heading"}</p>
                  {preview.description && <p className="text-sm text-coal/60 leading-relaxed">{preview.description}</p>}
                  {preview.image && (
                    <div className="relative overflow-hidden rounded-xl border border-coal/10">
                      <img src={preview.image} alt={preview.title} className="aspect-[4/3] w-full object-cover" />
                      {(preview.overlayTitle || preview.overlaySubtitle) && (
                        <div className="absolute inset-x-0 bottom-0 bg-pine-ink/85 px-5 py-3">
                          {preview.overlayTitle && (
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ivory">{preview.overlayTitle}</p>
                          )}
                          {preview.overlaySubtitle && <p className="mt-0.5 text-xs text-ivory/70">{preview.overlaySubtitle}</p>}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {preview.primaryCtaLabel && <span className="rounded-lg bg-pine px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ivory">{preview.primaryCtaLabel}</span>}
                    {preview.secondaryCtaLabel && <span className="rounded-lg border border-pine/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-pine">{preview.secondaryCtaLabel}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
