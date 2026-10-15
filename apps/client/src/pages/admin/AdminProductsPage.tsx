import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Pencil, Trash2, Package, Upload, X, Loader2, Star, AlertCircle } from 'lucide-react';
import { API_URL } from '@/lib/api-url';

interface ProductForm {
  name: string;
  price: string;
  compareAtPrice: string;
  category: string;
  description: string;
  shortDescription: string;
  stock: string;
  inStock: boolean;
  featured: boolean;
  images: string[];
  topNotes: string;
  heartNotes: string;
  baseNotes: string;
  sizes: string;
  concentration: string;
  tags: string;
  weight: string;
}

const emptyForm: ProductForm = {
  name: '',
  price: '',
  compareAtPrice: '',
  category: '',
  description: '',
  shortDescription: '',
  stock: '',
  inStock: true,
  featured: false,
  images: [],
  topNotes: '',
  heartNotes: '',
  baseNotes: '',
  sizes: '6ml',
  concentration: 'Concentrated Perfume Oil (Alcohol-Free)',
  tags: '',
  weight: '',
};

const DEFAULT_CATEGORIES = [  'Floral Attars',
  'Oud & Hindi Oud',
  'Musk Attars',
  'Woody & Sacred Woods',
  'Amber & Resins',
  'Herbal & Earthy',
  'Traditional Indian Attars',
  'Mukhallat & Oriental Blends',
  'Attar Oils',
  'Oriental Sprays',
  'Discovery Sets',
];

/** Quick shelf assignment from the products table (no dialog needed). */
const SHELF_BADGES = [
  { id: 'bestseller', label: 'Bestseller' },
  { id: 'new', label: 'New' },
  { id: 'combo', label: 'Combo' },
  { id: 'offer', label: 'Offer' },
] as const;

const BADGE_ALIASES: Record<string, string[]> = {
  bestseller: ['bestseller', 'bestselling'],
  new: ['new', 'new-arrival', 'new-arrivals'],
  combo: ['combo', 'combos', 'combo-deal', 'combo-deals'],
  offer: ['offer', 'offers', 'sale', 'discount', 'deal'],
};

function canonTagWord(s: string): string {
  return s.trim().toLowerCase().replace(/[\s_\-]+/g, "");
}

function isBadgeSignal(tag: string, badge: string): boolean {
  const tl = tag.trim().toLowerCase();
  const aliases = BADGE_ALIASES[badge] ?? [badge];
  const canonAliases = aliases.map(canonTagWord);
  if (canonAliases.includes(canonTagWord(tl))) return true;
  if (tl.startsWith('badge:')) {
    const parts = tl.slice(6).split(/[,/]/).map((s) => s.trim());
    return parts.some((p) => p === badge || canonAliases.includes(canonTagWord(p)));
  }
  return false;
}

function hasShelfBadge(tags: unknown, badge: string): boolean {
  if (!Array.isArray(tags)) return false;
  return tags.some((t) => isBadgeSignal(String(t), badge));
}

/** Toggle a shelf badge tag; preserves size: tags and sibling badges. */
function toggleShelfBadge(tags: unknown, badge: string): string[] {
  const list: string[] = Array.isArray(tags) ? tags.map((t) => String(t)) : [];
  if (!list.some((t) => isBadgeSignal(t, badge))) return [...list, `badge:${badge}`];
  const out: string[] = [];
  for (const t of list) {
    const tl = t.trim().toLowerCase();
    const aliases = BADGE_ALIASES[badge] ?? [badge];
    const canonAliases = aliases.map(canonTagWord);
    if (canonAliases.includes(canonTagWord(tl))) continue;
    if (tl.startsWith('badge:')) {
      const prefixLen = t.toLowerCase().indexOf('badge:') + 6;
      const kept = t
        .slice(prefixLen)
        .split(/[,/]/)
        .map((s) => s.trim())
        .filter((s) => s && s.toLowerCase() !== badge && !canonAliases.includes(canonTagWord(s)));
      if (kept.length > 0) out.push(`${t.slice(0, prefixLen)}${kept.join(',')}`);
      continue;
    }
    out.push(t);
  }
  return out;
}

/** Quick audience lanes from the products table (no dialog needed). */
type ShelfAudience = 'him' | 'her' | 'unisex';

const AUDIENCE_LANES: { id: ShelfAudience; label: string }[] = [
  { id: 'him', label: 'For Him' },
  { id: 'her', label: 'For Her' },
  { id: 'unisex', label: 'Unisex' },
];

const AUDIENCE_TAG = { him: 'for-him', her: 'for-her', unisex: 'unisex' } as const;

/** Tag-based audience signals only (no haystack/default) — the admin control surface. */
function audienceSignals(tags: unknown): ShelfAudience[] {
  if (!Array.isArray(tags)) return [];
  const out = new Set<ShelfAudience>();
  const grab = (v: string) => {
    const c = v.trim().toLowerCase();
    if (c === 'for-him' || c === 'him') out.add('him');
    else if (c === 'for-her' || c === 'her') out.add('her');
    else if (c === 'unisex' || c === 'all') out.add('unisex');
  };
  for (const raw of tags) {
    const t = String(raw).trim().toLowerCase();
    if (t.startsWith('gender:') || t.startsWith('audience:')) grab(t.split(':').slice(1).join(':'));
    else grab(t);
  }
  return [...out];
}

/** Pill state: explicit signals win; untagged oils are unisex by attar tradition. */
function hasAudienceLane(tags: unknown, aud: ShelfAudience): boolean {
  const signals = audienceSignals(tags);
  if (signals.includes(aud)) return true;
  return aud === 'unisex' && signals.length === 0;
}

/** Toggle an audience lane; never strands a product with zero lanes. */
function toggleAudienceLane(tags: unknown, aud: ShelfAudience): string[] {
  const list: string[] = Array.isArray(tags) ? tags.map((t) => String(t)) : [];
  if (!audienceSignals(list).includes(aud)) return [...list, AUDIENCE_TAG[aud]];
  const keep = list.filter((t) => {
    const tl = t.trim().toLowerCase();
    const bare = tl.startsWith('gender:') || tl.startsWith('audience:') ? tl.split(':').slice(1).join(':') : tl;
    const c = bare === 'all' ? 'unisex' : bare;
    const hit =
      (aud === 'him' && (c === 'him' || c === 'for-him')) ||
      (aud === 'her' && (c === 'her' || c === 'for-her')) ||
      (aud === 'unisex' && c === 'unisex');
    return !hit;
  });
  // Turning Unisex off a fully-untagged oil would default straight back to
  // unisex — keep the original tags instead of a fake change.
  if (aud === 'unisex' && audienceSignals(keep).length === 0) return list;
  return keep;
}

const CONCENTRATION_PRESETS = [  'Concentrated Perfume Oil (Alcohol-Free)',
  'Pure Attar Oil 6ml / 12ml',
  'Mukhallat Blend (Oil)',
  'EDP Spray 100ml',
  'Discovery Set 5x2ml',
];

export default function AdminProductsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [lowStock, setLowStock] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories from database endpoint
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const availableCategories: string[] =
    categoriesData?.categories && Array.isArray(categoriesData.categories)
      ? categoriesData.categories.map((c: any) => typeof c === 'string' ? c : c.name || c.slug)
      : DEFAULT_CATEGORIES;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (selected.length === 0) return;

    setIsUploadingImage(true);
    try {
      const body = new FormData();
      selected.forEach((file) => body.append('files', file));

      const res = await fetch(`${API_URL}/api/uploads`, {
        method: 'POST',
        credentials: 'include',
        body,
      });
      const data = await res.json();

      if (!res.ok) {
        toast({
          title: 'Image upload failed',
          description: data.error ?? 'Please try again or paste an image URL below.',
          variant: 'destructive',
        });
        return;
      }

      setForm((prev) => ({ ...prev, images: [...prev.images, ...data.urls] }));
    } catch {
      toast({ title: 'Image upload failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    const url = imageUrl.trim();
    if (!url) return;
    if (!/^https?:\/\/.+/i.test(url)) {
      toast({ title: 'Invalid URL', description: 'Image URL must start with http(s)://', variant: 'destructive' });
      return;
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
    setImageUrl('');
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const params = new URLSearchParams();
  if (debouncedSearch) params.set('search', debouncedSearch);
  if (lowStock) params.set('lowStock', 'true');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', debouncedSearch, lowStock],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/products?${params}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const createProduct = useMutation({
    mutationFn: async (body: any) => {
      const res = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? 'Failed to create product');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Product created' });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: any }) => {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? 'Failed to update product');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Product updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  /** Lightweight row-level update for shelf badges + category (no dialog side-effects). */
  const quickUpdate = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: any }) => {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload as { error?: string }).error ?? 'Failed to update product');
      }
      return res.json();
    },
    onSuccess: (_data, variables: any) => {
      toast({ title: variables?.notice ?? 'Product updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['catalog-products'] });
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_URL}/api/admin/products/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Product deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDeleteId(null);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' }),
  });

  const openAdd = () => {
    setEditProduct(null);
    setImageUrl('');
    setForm({
      ...emptyForm,
      category: availableCategories[0] ?? '',
    });
    setDialogOpen(true);
  };

  const openEdit = (product: any) => {
    setEditProduct(product);
    setImageUrl('');
    const mats: string[] = Array.isArray(product.materials) ? product.materials : [];
    const pick = (prefix: string) => {
      const line = mats.find((m) => new RegExp(`^${prefix}:`, 'i').test(m));
      return line ? line.replace(new RegExp(`^${prefix}:\\s*`, 'i'), '') : '';
    };
    setForm({
      name: product.name ?? '',
      price: product.price != null ? String(product.price) : '',
      compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : '',
      category: product.category ?? (availableCategories[0] ?? ''),
      description: product.description ?? '',
      shortDescription: product.shortDescription ?? '',
      stock: product.stock != null ? String(product.stock) : '',
      inStock: product.inStock ?? true,
      featured: product.featured ?? false,
      images: Array.isArray(product.images) ? product.images : [],
      topNotes: pick('Top'),
      heartNotes: pick('Heart') || pick('Middle'),
      baseNotes: pick('Base'),
      sizes: Array.isArray(product.colors) ? product.colors.join(', ') : (product.colors ?? '6ml'),
      concentration: product.dimensions ?? 'Concentrated Perfume Oil (Alcohol-Free)',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags ?? ''),
      weight: product.weight ?? '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast({ title: 'Product title is required', variant: 'destructive' });
      return;
    }
    if (form.price === '' || Number.isNaN(Number(form.price))) {
      toast({ title: 'A valid price (NPR) is required', variant: 'destructive' });
      return;
    }
    if (!form.category.trim()) {
      toast({ title: 'Category is required', variant: 'destructive' });
      return;
    }
    const materials = [
      form.topNotes.trim() ? `Top: ${form.topNotes.trim()}` : null,
      form.heartNotes.trim() ? `Heart: ${form.heartNotes.trim()}` : null,
      form.baseNotes.trim() ? `Base: ${form.baseNotes.trim()}` : null,
    ].filter((x): x is string => !!x);
    // Sizes accept per-size NPR prices: "6ml=349, 9ml=499, 12ml".
    // Plain sizes reuse the product price; priced sizes become `size:6ml=349` tags.
    const sizeEntries = form.sizes.split(',').map((s) => s.trim()).filter(Boolean).map((entry) => {
      const [label, price] = entry.split('=').map((s) => s.trim());
      return { label, price: price && !Number.isNaN(Number(price)) ? Number(price) : null };
    }).filter((s) => s.label);
    const colors = sizeEntries.map((s) => s.label);
    const sizeTags = sizeEntries.filter((s) => s.price != null).map((s) => `size:${s.label}=${s.price}`);
    const tags = [
      ...form.tags.split(',').map((s) => s.trim()).filter((t) => t && !/^size\s*:/i.test(t)),
      ...sizeTags,
    ];
    const body = {
      name: form.name,
      price: form.price !== '' ? Number(form.price) : undefined,
      compareAtPrice: form.compareAtPrice !== '' ? Number(form.compareAtPrice) : undefined,
      category: form.category,
      description: form.description,
      shortDescription: form.shortDescription,
      stock: form.stock !== '' ? Number(form.stock) : undefined,
      inStock: form.inStock,
      featured: form.featured,
      images: form.images,
      materials,
      colors,
      dimensions: form.concentration,
      weight: form.weight || colors[0] || '',
      tags,
    };
    if (editProduct) {
      updateProduct.mutate({ id: editProduct.id, body });
    } else {
      createProduct.mutate(body);
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">Catalog Management</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage attar inventory, notes, sizes (6ml / 9ml / 12ml), pricing NPR, and verification status.
            </p>
          </div>
          <Button onClick={openAdd} className="gap-2 h-9 text-xs font-semibold rounded-xl shadow-xs shrink-0">
            <Plus className="h-4 w-4" /> Add New Product
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border/80 p-3 rounded-2xl shadow-xs">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-border/80 bg-background"
            />
          </div>
          <button
            onClick={() => setLowStock(!lowStock)}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              lowStock
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : 'bg-background border-border/80 text-muted-foreground hover:text-foreground hover:border-border'
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Low Stock Only
          </button>
        </div>

        {/* Products Data Table */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Shelves</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-8 bg-muted/60 animate-pulse rounded-xl w-full" />
                      </td>
                    </tr>
                  ))
                ) : (data?.products ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-muted-foreground">
                      <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No products found matching criteria</p>
                    </td>
                  </tr>
                ) : (
                  (data?.products ?? []).map((product: any) => {
                    const img = (product.images ?? [])[0];
                    const stock = product.stock ?? 0;
                    return (
                      <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-3.5 font-medium">
                          <div className="flex items-center gap-3">
                            {img ? (
                              <img
                                src={img}
                                alt={product.name}
                                className="h-10 w-10 object-cover rounded-xl border border-border/80 shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-muted/50 rounded-xl border border-border/80 flex items-center justify-center shrink-0">
                                <Package className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground text-sm">{product.name}</span>
                                {product.featured && (
                                  <span className="p-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20" title="Featured Product">
                                    <Star className="h-3 w-3 fill-amber-500" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate max-w-xs">{product.shortDescription || 'No description'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground font-medium">
                          <select
                            value={product.category ?? ''}
                            onChange={(e) =>
                              quickUpdate.mutate({
                                id: product.id,
                                body: { category: e.target.value },
                                notice: `Moved to ${e.target.value}`,
                              } as any)
                            }
                            disabled={quickUpdate.isPending}
                            title="Move to another category"
                            className="max-w-[150px] truncate bg-muted px-2 py-1 rounded-lg border border-border/60 text-xs font-medium focus:outline-none focus:border-primary cursor-pointer disabled:opacity-60"
                          >
                            {product.category && !availableCategories.includes(product.category) && (
                              <option value={product.category}>{product.category}</option>
                            )}
                            {availableCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex flex-wrap gap-1 max-w-[210px]">
                            {SHELF_BADGES.map((shelf) => {
                              const active = hasShelfBadge(product.tags, shelf.id);
                              return (
                                <button
                                  key={shelf.id}
                                  type="button"
                                  disabled={quickUpdate.isPending}
                                  title={active ? `Remove from ${shelf.label}` : `Add to ${shelf.label}`}
                                  onClick={() =>
                                    quickUpdate.mutate({
                                      id: product.id,
                                      body: { tags: toggleShelfBadge(product.tags, shelf.id) },
                                      notice: active
                                        ? `Removed from ${shelf.label}`
                                        : `Added to ${shelf.label}`,
                                    } as any)
                                  }
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
                                    active
                                      ? 'border-pine bg-pine text-ivory'
                                      : 'border-border/80 bg-background text-muted-foreground hover:text-foreground hover:border-primary'
                                  }`}
                                >
                                  {shelf.label}
                                </button>
                              );
                            })}
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1 max-w-[210px] border-t border-border/60 pt-1.5">
                            {AUDIENCE_LANES.map((lane) => {
                              const active = hasAudienceLane(product.tags, lane.id);
                              return (
                                <button
                                  key={lane.id}
                                  type="button"
                                  disabled={quickUpdate.isPending}
                                  title={active ? `Remove from ${lane.label}` : `List in ${lane.label}`}
                                  onClick={() =>
                                    quickUpdate.mutate({
                                      id: product.id,
                                      body: { tags: toggleAudienceLane(product.tags, lane.id) },
                                      notice: active
                                        ? `Removed from ${lane.label}`
                                        : `Listed in ${lane.label}`,
                                    } as any)
                                  }
                                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
                                    active
                                      ? 'border-brass-deep bg-brass/15 text-brass-deep'
                                      : 'border-border/80 bg-background text-muted-foreground hover:text-foreground hover:border-primary'
                                  }`}
                                >
                                  {lane.label}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-semibold text-foreground">NPR {Number(product.price ?? 0).toLocaleString()}</div>
                          {product.compareAtPrice && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              NPR {Number(product.compareAtPrice).toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`font-semibold ${stock < 5 ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-foreground'}`}>
                            {stock} units
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            product.inStock 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(product)} className="h-8 w-8 rounded-lg hover:bg-muted">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-500/10"
                              onClick={() => setDeleteId(product.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-lg">
              {editProduct ? 'Edit Catalog Item' : 'Create New Product'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-5 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Product Title *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Al-Nuaim Chocolate Musk 6ml"
                className="h-10 text-xs rounded-xl border-border/80"
              />
            </div>

            {/* Image Attachments */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Attar bottle photography (front, 6ml / 9.9ml / 100ml, discovery flat-lay)</label>
              <input
                ref={imageInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg"
                className="hidden"
                onChange={handleImageSelect}
              />
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-border/80 rounded-xl p-5 text-center cursor-pointer hover:bg-muted/30 transition-colors"
              >
                {isUploadingImage ? (
                  <Loader2 className="h-5 w-5 mx-auto mb-2 text-primary animate-spin" />
                ) : (
                  <Upload className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                )}
                <p className="text-xs text-muted-foreground font-medium">
                  {isUploadingImage ? 'Uploading files...' : 'Click to select high-res PNG or JPG files'}
                </p>
                <p className="text-[11px] text-muted-foreground/80 mt-1">
                  No upload? Paste an image URL below — images are optional.
                </p>
              </div>

              <div className="flex gap-2 mt-3">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImageUrl();
                    }
                  }}
                  placeholder="https://… paste image URL"
                  className="h-9 text-xs rounded-xl border-border/80"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddImageUrl}
                  className="h-9 text-xs rounded-xl shrink-0"
                >
                  Add
                </Button>
              </div>

              {form.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.images.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/80 group">
                      <img src={url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Price (NPR) *</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0"
                  className="h-10 text-xs rounded-xl border-border/80"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Compare Price (NPR)</label>
                <Input
                  type="number"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  placeholder="0"
                  className="h-10 text-xs rounded-xl border-border/80"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {form.category && !availableCategories.includes(form.category) && (
                    <option value={form.category}>{form.category}</option>
                  )}
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Stock Quantity</label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                  className="h-10 text-xs rounded-xl border-border/80"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Short Summary</label>
              <Input
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="Brief highlights for store cards..."
                className="h-10 text-xs rounded-xl border-border/80"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Detailed Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Heritage story, character, occasion — no unverified purity/longevity claims"
                rows={3}
                className="text-xs rounded-xl border-border/80 resize-none"
              />
            </div>

            <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-4">
              <p className="text-xs font-semibold">Attar details (notes, sizes, concentration)</p>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Top notes (comma-separated)</label>
                  <Input value={form.topNotes} onChange={(e) => setForm({ ...form, topNotes: e.target.value })} placeholder="e.g. Cinnamon, bergamot — or 'To confirm'" className="h-10 text-xs rounded-xl border-border/80" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Heart notes</label>
                  <Input value={form.heartNotes} onChange={(e) => setForm({ ...form, heartNotes: e.target.value })} placeholder="e.g. Dates, praline — or 'To confirm'" className="h-10 text-xs rounded-xl border-border/80" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Base notes</label>
                  <Input value={form.baseNotes} onChange={(e) => setForm({ ...form, baseNotes: e.target.value })} placeholder="e.g. Vanilla, musk, amber — or 'To confirm'" className="h-10 text-xs rounded-xl border-border/80" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Sizes + per-size NPR (comma-separated)</label>
                  <Input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="6ml=349, 9ml=499, 12ml" className="h-10 text-xs rounded-xl border-border/80" />
                  <p className="text-[11px] text-muted-foreground">Plain sizes reuse the product price. Use <span className="font-mono">6ml=349</span> to price a size individually — shown on cards and detail pages, charged in cart.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Concentration / type</label>
                  <select value={form.concentration} onChange={(e) => setForm({ ...form, concentration: e.target.value })} className="flex h-10 w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs font-medium">
                    {CONCENTRATION_PRESETS.map((c) => (<option key={c} value={c}>{c}</option>))}
                    {!CONCENTRATION_PRESETS.includes(form.concentration) && form.concentration && (<option value={form.concentration}>{form.concentration}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Tags — powers nav, search & shelves (comma-separated)</label>
                  <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="brand:Al-Nuaim, gender:unisex, type:attar, family:musk, badge:bestseller" className="h-10 text-xs rounded-xl border-border/80" />
                  <p className="text-[11px] text-muted-foreground">Conventions — brand:Name · gender:for-him|for-her|unisex (blank = Unisex) · type:attar|perfume · family:musk|oud|floral|fruity|woody|sweet|fresh|oriental|traditional · badge:bestseller|new|combo|offer|favourite. Only tagged shelves appear in menus.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Weight / size label</label>
                  <Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="6ml" className="h-10 text-xs rounded-xl border-border/80" />
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                  className="rounded border-border/80 h-4 w-4 accent-primary"
                />
                In Stock & Purchasing Active
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded border-border/80 h-4 w-4 accent-primary"
                />
                Feature on Homepage
              </label>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-9 text-xs rounded-xl">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending} className="h-9 text-xs font-semibold rounded-xl">
              {isPending ? 'Saving...' : editProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif font-bold">Delete Catalog Item</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently remove this product? This action cannot be reverted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-9 text-xs rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="h-9 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => deleteId !== null && deleteProduct.mutate(deleteId)}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}