import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Images, Eye, EyeOff, ArrowUpDown } from "lucide-react";
import { carouselAdminApi, useAdminSlides, type AdminSlide } from "@/lib/carousel";
import { uploadFilesWithTimeout } from "@/lib/api-url";

interface SlideForm {
  title: string;
  description: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: string;
  isActive: boolean;
}

const emptyForm: SlideForm = {
  title: "",
  description: "",
  image: "",
  ctaLabel: "",
  ctaHref: "",
  sortOrder: "0",
  isActive: true,
};

export default function AdminCarouselPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: slides = [], isLoading } = useAdminSlides();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSlide, setEditSlide] = useState<AdminSlide | null>(null);
  const [form, setForm] = useState<SlideForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [preview, setPreview] = useState<AdminSlide | null>(null);
  const [uploading, setUploading] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-carousel-slides"] });
    queryClient.invalidateQueries({ queryKey: ["hero-slides"] });
  };

  const save = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      if (editSlide) return carouselAdminApi.update(editSlide.id, body);
      return carouselAdminApi.create(body);
    },
    onSuccess: () => {
      toast({ title: editSlide ? "Slide updated" : "Slide created" });
      invalidate();
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: number | string) => carouselAdminApi.remove(id),
    onSuccess: () => {
      toast({ title: "Slide deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async (slide: AdminSlide) =>
      carouselAdminApi.update(slide.id, { isActive: !slide.isActive }),
    onSuccess: () => {
      toast({ title: "Visibility updated" });
      invalidate();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openAdd = () => {
    setEditSlide(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (slide: AdminSlide) => {
    setEditSlide(slide);
    setForm({
      title: slide.title ?? "",
      description: slide.description ?? "",
      image: slide.image ?? "",
      ctaLabel: slide.ctaLabel ?? "",
      ctaHref: slide.ctaHref ?? "",
      sortOrder: String(slide.sortOrder ?? 0),
      isActive: slide.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { ok, data } = await uploadFilesWithTimeout([file]);
      const url: string | undefined =
        data?.urls?.[0] ?? data?.files?.[0]?.url ?? data?.url ?? data?.images?.[0];
      if (!ok || !url) throw new Error(data?.error ?? "Upload failed");
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

  const submit = () => {
    if (!form.title.trim()) {
      toast({ title: "Heading is required", variant: "destructive" });
      return;
    }
    if (!form.image.trim()) {
      toast({ title: "Image is required", variant: "destructive" });
      return;
    }
    save.mutate({
      title: form.title.trim(),
      description: form.description.trim() || null,
      image: form.image.trim(),
      ctaLabel: form.ctaLabel.trim() || null,
      ctaHref: form.ctaHref.trim() || null,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    });
  };

  const sorted = [...slides].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Edit Carousel</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage the homepage hero slideshow. Changes appear on the storefront immediately.
              Lower display order shows first.
            </p>
          </div>
          <Button onClick={openAdd} className="gap-2 h-9 text-xs font-semibold rounded-xl shrink-0">
            <Plus className="h-4 w-4" /> Add Slide
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <Images className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="mt-3 font-medium">No slides yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first hero slide. Until then the storefront shows curated fallback slides.
            </p>
            <Button onClick={openAdd} className="mt-4">
              <Plus className="h-4 w-4 mr-2" /> Add Slide
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Order</th>
                    <th className="px-4 py-3 font-medium">Slide</th>
                    <th className="px-4 py-3 font-medium">CTA</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s) => (
                    <tr key={String(s.id)} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-medium">
                          <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                          {s.sortOrder}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <img
                            src={s.image}
                            alt={s.title}
                            className="w-20 h-12 rounded-lg object-cover border border-border"
                          />
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[240px]">{s.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                              {s.description || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium">{s.ctaLabel || "—"}</p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                          {s.ctaHref || ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive.mutate(s)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border ${
                            s.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                          title={s.isActive ? "Hide from homepage" : "Show on homepage"}
                        >
                          {s.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {s.isActive ? "Active" : "Hidden"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => setPreview(s)}>
                            Preview
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label="Edit slide">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(s.id)}
                            aria-label="Delete slide"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create / Edit dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editSlide ? "Edit slide" : "Add slide"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="slide-title">Heading *</Label>
                <Input
                  id="slide-title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Musk attars for everyday wear"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slide-desc">Description</Label>
                <Textarea
                  id="slide-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short line shown under the heading"
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slide-image">Image URL *</Label>
                <Input
                  id="slide-image"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  placeholder="https://…"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => handleUpload(e.target.files?.[0])}
                    className="text-xs"
                  />
                </div>
                {form.image && (
                  <img
                    src={form.image}
                    alt="Slide preview"
                    className="mt-2 w-full h-36 rounded-xl object-cover border border-border"
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="slide-cta">CTA label</Label>
                  <Input
                    id="slide-cta"
                    value={form.ctaLabel}
                    onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
                    placeholder="Shop Musk attars"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slide-href">CTA destination</Label>
                  <Input
                    id="slide-href"
                    value={form.ctaHref}
                    onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))}
                    placeholder="/shop?kind=attar&family=musk"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1.5">
                  <Label htmlFor="slide-order">Display order</Label>
                  <Input
                    id="slide-order"
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-2 pb-2">
                  <Switch
                    id="slide-active"
                    checked={form.isActive}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                  />
                  <Label htmlFor="slide-active">Active on homepage</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={save.isPending}>
                {save.isPending ? "Saving…" : editSlide ? "Save changes" : "Add slide"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview dialog */}
        <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden">
            {preview && (
              <div className="relative">
                <img src={preview.image} alt={preview.title} className="w-full h-72 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{preview.title}</h3>
                  {preview.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{preview.description}</p>
                  )}
                  {preview.ctaLabel && (
                    <p className="mt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {preview.ctaLabel} → {preview.ctaHref || "/shop"}
                    </p>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete confirm */}
        <AlertDialog open={deleteId != null} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this slide?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the slide from the homepage immediately. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId != null && remove.mutate(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
