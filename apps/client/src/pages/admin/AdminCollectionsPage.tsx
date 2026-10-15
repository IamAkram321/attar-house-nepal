import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Layers, Upload, X, Search, Sparkles, Loader2, Image as ImageIcon, PackageCheck } from 'lucide-react';
import { API_URL } from '@/lib/api-url';

interface Collection {
  id: number;
  name: string;
  description?: string;
  image?: string;
  featured: boolean;
  productIds: number[];
}

interface Product {
  id: number;
  name: string;
  category: string;
  price?: number;
}

interface CollectionForm {
  name: string;
  description: string;
  image: string;
  featured: boolean;
  productIds: number[];
}

const emptyForm: CollectionForm = {
  name: '',
  description: '',
  image: '',
  featured: false,
  productIds: [],
};

export default function AdminCollectionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCollection, setEditCollection] = useState<Collection | null>(null);
  const [form, setForm] = useState<CollectionForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery<{ collections: Collection[] }>({
    queryKey: ['admin-collections'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/collections`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch collections');
      return res.json();
    },
  });

  const { data: productsData } = useQuery<{ products: Product[] }>({
    queryKey: ['admin-products-picker'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/products-picker`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  const collections = data?.collections ?? [];
  const allProducts = productsData?.products ?? [];

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const body = new FormData();
      body.append('files', file);

      const res = await fetch(`${API_URL}/api/uploads`, {
        method: 'POST',
        credentials: 'include',
        body,
      });
      const uploadData = await res.json();

      if (!res.ok) {
        toast({ title: uploadData.error ?? 'Image upload failed', variant: 'destructive' });
        return;
      }

      setForm((prev) => ({ ...prev, image: uploadData.urls[0] }));
      toast({ title: 'Cover image uploaded' });
    } catch {
      toast({ title: 'Image upload failed. Please try again.', variant: 'destructive' });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const toggleProduct = (id: number) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(id)
        ? prev.productIds.filter((p) => p !== id)
        : [...prev.productIds, id],
    }));
  };

  const createCollection = useMutation({
    mutationFn: async (body: CollectionForm) => {
      const res = await fetch(`${API_URL}/api/admin/collections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Collection created successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      setDialogOpen(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to create collection', variant: 'destructive' }),
  });

  const updateCollection = useMutation({
    mutationFn: async ({ id, body }: { id: number; body: CollectionForm }) => {
      const res = await fetch(`${API_URL}/api/admin/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Collection updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      setDialogOpen(false);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update collection', variant: 'destructive' }),
  });

  const deleteCollection = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_URL}/api/admin/collections/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Collection deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
      setDeleteId(null);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete collection', variant: 'destructive' }),
  });

  const openAdd = () => {
    setEditCollection(null);
    setForm(emptyForm);
    setProductSearch('');
    setDialogOpen(true);
  };

  const openEdit = (collection: Collection) => {
    setEditCollection(collection);
    setForm({
      name: collection.name ?? '',
      description: collection.description ?? '',
      image: collection.image ?? '',
      featured: collection.featured ?? false,
      productIds: Array.isArray(collection.productIds) ? collection.productIds : [],
    });
    setProductSearch('');
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editCollection) {
      updateCollection.mutate({ id: editCollection.id, body: form });
    } else {
      createCollection.mutate(form);
    }
  };

  const isPending = createCollection.isPending || updateCollection.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
              <Layers className="h-7 w-7 text-primary" />
              Collections
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Organize products into curated groups and featured storefront showcases.
            </p>
          </div>
          <Button 
            onClick={openAdd}
            className="shadow-md hover:shadow-lg transition-all duration-200 bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-medium"
          >
            <Plus className="h-4 w-4" />
            Add Collection
          </Button>
        </div>

        {/* Content Table Card */}
        <div className="bg-card/70 backdrop-blur-md border border-border/80 shadow-sm rounded-xl overflow-hidden transition-all">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/80 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">Cover</th>
                  <th className="px-6 py-4 font-semibold">Collection Name</th>
                  <th className="px-6 py-4 font-semibold">Products</th>
                  <th className="px-6 py-4 font-semibold">Featured</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span>Loading collections...</span>
                      </div>
                    </td>
                  </tr>
                ) : collections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                      <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-center">
                        <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                          <Layers className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <p className="font-medium text-foreground text-base">No collections created</p>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">
                          Get started by creating your first product collection.
                        </p>
                        <Button size="sm" onClick={openAdd} variant="outline" className="gap-2">
                          <Plus className="h-3.5 w-3.5" />
                          Create Collection
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  collections.map((c) => (
                    <tr 
                      key={c.id} 
                      className="group hover:bg-muted/30 transition-colors duration-150"
                    >
                      <td className="px-6 py-3.5">
                        <div className="h-12 w-12 rounded-lg bg-muted/50 border border-border/50 overflow-hidden flex items-center justify-center shadow-xs group-hover:border-primary/30 transition-colors">
                          {c.image ? (
                            <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-foreground text-sm">{c.name}</div>
                        {c.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-sm mt-0.5">
                            {c.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-xs font-medium text-foreground">
                          <PackageCheck className="h-3.5 w-3.5 text-muted-foreground" />
                          {c.productIds?.length ?? 0} items
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {c.featured ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles className="h-3 w-3 fill-amber-500" />
                            Featured
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => openEdit(c)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteId(c.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl border border-border shadow-2xl">
            <DialogHeader className="px-6 py-4 border-b border-border/80 bg-muted/20">
              <DialogTitle className="font-serif text-xl font-semibold">
                {editCollection ? 'Edit Collection' : 'Create New Collection'}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set cover imagery, update metadata, and curate associated products.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 px-6 py-5 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collection Name *</label>
                <Input 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  placeholder="e.g. Summer Essentials, Limited Edition" 
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Cover Image</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                {form.image ? (
                  <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden border border-border group bg-muted">
                    <img src={form.image} alt="Cover Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="gap-1.5"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Replace
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => setForm((prev) => ({ ...prev, image: '' }))}
                        className="gap-1.5"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className="border-2 border-dashed border-border/80 hover:border-primary/50 rounded-lg p-6 text-center cursor-pointer bg-muted/20 hover:bg-muted/40 transition-all duration-200"
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center justify-center py-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                        <p className="text-xs text-muted-foreground">Uploading image...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">Click to upload cover banner</p>
                        <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG or WEBP up to 5MB</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                <Textarea 
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  placeholder="Provide a brief summary for customers..." 
                  rows={2} 
                  className="bg-background resize-none"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3.5 bg-muted/20">
                <div className="space-y-0.5">
                  <label htmlFor="featured-toggle" className="text-sm font-medium text-foreground cursor-pointer">
                    Featured Collection
                  </label>
                  <p className="text-xs text-muted-foreground">Highlight this collection on the homepage showcase</p>
                </div>
                <Checkbox 
                  id="featured-toggle"
                  checked={form.featured} 
                  onCheckedChange={(checked) => setForm({ ...form, featured: Boolean(checked) })} 
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Assign Products
                  </label>
                  <span className="text-xs font-medium text-primary">
                    {form.productIds.length} selected
                  </span>
                </div>

                {allProducts.length > 0 && (
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search products..." 
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-9 h-9 text-xs bg-background"
                    />
                  </div>
                )}

                <div className="border border-border/80 rounded-lg max-h-48 overflow-y-auto divide-y divide-border/60 bg-background">
                  {allProducts.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-4 text-center">No products found in system.</p>
                  ) : filteredProducts.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-4 text-center">No products match search criteria.</p>
                  ) : (
                    filteredProducts.map((p) => {
                      const isSelected = form.productIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleProduct(p.id)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors text-xs select-none ${
                            isSelected ? 'bg-primary/5 font-medium' : 'hover:bg-muted/40'
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleProduct(p.id)}
                          />
                          <span className="text-foreground truncate">{p.name}</span>
                          {p.category && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded ml-auto shrink-0">
                              {p.category}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-3.5 border-t border-border/80 bg-muted/20 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                size="sm"
                onClick={handleSubmit} 
                disabled={isPending || !form.name.trim()} 
                className="gap-2"
              >
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editCollection ? 'Save Changes' : 'Create Collection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Alert */}
        <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent className="rounded-xl border border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif">Delete Collection?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-muted-foreground">
                This action cannot be undone. The collection will be deleted, but all contained products will remain in your catalog.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="h-9 px-3 text-xs">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId !== null && deleteCollection.mutate(deleteId)}
                className="h-9 px-3 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteCollection.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Delete Collection'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}