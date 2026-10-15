import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, Pencil, Trash2, Compass } from 'lucide-react';
import { API_URL } from '@/lib/api-url';
import {
  filterCatalog,
  brandsPresent,
  familiesPresent,
  SHOP_FAMILIES,
  buildShopHref,
  type CatalogProduct,
} from '@/lib/catalog';

interface NavRow {
  label: string;
  detail: string;
  count: number | null;
  viewHref: string;
  manageHref: string;
  manageLabel: string;
  onDelete?: () => void;
}

function Section({ title, hint, rows }: { title: string; hint: string; rows: NavRow[] }) {
  return (
    <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60 bg-muted/20">
        <h2 className="font-serif text-base font-semibold text-foreground">{title}</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <tbody className="divide-y divide-border/60">
            {rows.map((row) => (
              <tr key={row.label} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-3">
                  <p className="font-semibold text-foreground text-sm">{row.label}</p>
                  <p className="text-[11px] text-muted-foreground">{row.detail}</p>
                </td>
                <td className="px-6 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">
                  {row.count == null ? '—' : `${row.count} item${row.count === 1 ? '' : 's'}`}
                </td>
                <td className="px-6 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link href={row.viewHref}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs rounded-lg gap-1">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </Link>
                    <Link href={row.manageHref}>
                      <Button variant="ghost" size="sm" className="h-8 text-xs rounded-lg gap-1">
                        <Pencil className="h-3.5 w-3.5" /> {row.manageLabel}
                      </Button>
                    </Link>
                    {row.onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                        onClick={row.onDelete}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminNavigationPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'category' | 'collection'; id: number; name: string } | null>(null);

  const { data: productsData } = useQuery({
    queryKey: ['admin-nav-products'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/products?limit=100`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });
  const { data: collectionsData } = useQuery({
    queryKey: ['admin-nav-collections'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/collections`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch collections');
      return res.json();
    },
  });
  const { data: categoriesData } = useQuery({
    queryKey: ['admin-nav-categories'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/categories`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const products: CatalogProduct[] = useMemo(
    () => (Array.isArray(productsData?.products) ? productsData.products : []),
    [productsData]
  );
  const collections: any[] = useMemo(
    () => (Array.isArray(collectionsData?.collections) ? collectionsData.collections : []),
    [collectionsData]
  );
  const categories: any[] = useMemo(
    () => (Array.isArray(categoriesData?.categories) ? categoriesData.categories : []),
    [categoriesData]
  );

  const removeEntry = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) throw new Error('Nothing selected');
      const res = await fetch(`${API_URL}/api/admin/${deleteTarget.kind === 'category' ? 'categories' : 'collections'}/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Delete failed');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: `${deleteTarget?.kind === 'category' ? 'Category' : 'Collection'} deleted` });
      queryClient.invalidateQueries({ queryKey: ['admin-nav-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-nav-collections'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteTarget(null);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete entry', variant: 'destructive' }),
  });

  const n = (list: CatalogProduct[]) => list.length;
  const brands = brandsPresent(products);
  const families = familiesPresent(products);

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="border-b border-border/80 pb-5">
          <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">Storefront Navigation</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Every menu below is live catalogue data — counts update as you add, retag or delete products, categories and collections.
            Delete shelves here; manage items in their pages.
          </p>
        </div>

        <Section
          title="Home · For Him · For Her · Unisex"
          hint="Audience shelves derive from product gender tags (blank = Unisex)."
          rows={[
            { label: 'Home', detail: 'Landing page', count: null, viewHref: '/', manageHref: '/admin/products', manageLabel: 'Products' },
            { label: 'For Him', detail: 'audience=him', count: n(filterCatalog(products, { audience: 'him' })), viewHref: buildShopHref({ audience: 'him' }), manageHref: '/admin/products', manageLabel: 'Products' },
            { label: 'For Her', detail: 'audience=her', count: n(filterCatalog(products, { audience: 'her' })), viewHref: buildShopHref({ audience: 'her' }), manageHref: '/admin/products', manageLabel: 'Products' },
            { label: 'Unisex', detail: 'audience=unisex', count: n(filterCatalog(products, { audience: 'unisex' })), viewHref: buildShopHref({ audience: 'unisex' }), manageHref: '/admin/products', manageLabel: 'Products' },
          ]}
        />

        <Section
          title="Attars — families"
          hint="Only families with stocked products appear in the menu. Retag a product's family to move it."
          rows={[
            { label: 'All Attars', detail: 'kind=attar', count: n(filterCatalog(products, { kind: 'attar' })), viewHref: buildShopHref({ kind: 'attar' }), manageHref: '/admin/products', manageLabel: 'Products' },
            ...SHOP_FAMILIES.map((f) => ({
              label: f.name,
              detail: `family=${f.slug}`,
              count: n(filterCatalog(products, { kind: 'attar', family: f.slug })),
              viewHref: buildShopHref({ kind: 'attar', family: f.slug }),
              manageHref: '/admin/products',
              manageLabel: 'Products',
            })),
          ]}
        />

        <Section
          title="Perfumes & Collections"
          hint="Collections are fully admin-managed; deleting one never deletes products."
          rows={[
            { label: 'All Perfumes', detail: 'kind=perfume', count: n(filterCatalog(products, { kind: 'perfume' })), viewHref: buildShopHref({ kind: 'perfume' }), manageHref: '/admin/products', manageLabel: 'Products' },
            ...collections.map((c: any) => ({
              label: c.name,
              detail: `${(c.productIds ?? []).length} linked products`,
              count: (c.productIds ?? []).length,
              viewHref: `/collections/${c.slug}`,
              manageHref: '/admin/collections',
              manageLabel: 'Collections',
              onDelete: () => setDeleteTarget({ kind: 'collection', id: c.id, name: c.name }),
            })),
          ]}
        />

        <Section
          title="Bestsellers"
          hint="Badge + featured + rating driven. Tag products badge:bestseller in Catalog to fill these shelves."
          rows={[
            { label: 'Bestselling Attars', detail: 'preset=bestsellers + attar', count: n(filterCatalog(products, { kind: 'attar', preset: 'bestsellers' })), viewHref: buildShopHref({ kind: 'attar', preset: 'bestsellers' }), manageHref: '/admin/products', manageLabel: 'Products' },
            { label: 'Bestselling Perfumes', detail: 'preset=bestsellers + perfume', count: n(filterCatalog(products, { kind: 'perfume', preset: 'bestsellers' })), viewHref: buildShopHref({ kind: 'perfume', preset: 'bestsellers' }), manageHref: '/admin/products', manageLabel: 'Products' },
            { label: 'Customer Favourites', detail: 'top rated', count: Math.min(12, n(filterCatalog(products, { preset: 'favourites' }))), viewHref: buildShopHref({ preset: 'favourites' }), manageHref: '/admin/reviews', manageLabel: 'Reviews' },
          ]}
        />

        <Section
          title="Brands"
          hint="Brand shelves open automatically from product brand tags. Remove a shelf by retagging or deleting its products."
          rows={[
            ...brands.map((b) => ({
              label: b,
              detail: `brand=${b}`,
              count: n(filterCatalog(products, { brand: b })),
              viewHref: buildShopHref({ brand: b }),
              manageHref: '/admin/products',
              manageLabel: 'Products',
            })),
            ...(brands.length === 0 ? [{ label: 'No brand shelves yet', detail: 'Add brand: tags on products', count: 0, viewHref: '/brands', manageHref: '/admin/products', manageLabel: 'Products' }] : []),
          ]}
        />

        <Section
          title="Offers"
          hint="Discounts derive from compare-at prices and offer/combo tags."
          rows={[
            { label: 'Special Offers', detail: 'preset=offers', count: n(filterCatalog(products, { preset: 'offers' })), viewHref: buildShopHref({ preset: 'offers' }), manageHref: '/admin/products', manageLabel: 'Products' },
            { label: 'Attar Combo Deals', detail: 'attar + combos', count: n(filterCatalog(products, { kind: 'attar', preset: 'combos' })), viewHref: buildShopHref({ kind: 'attar', preset: 'combos' }), manageHref: '/admin/products', manageLabel: 'Products' },
            { label: 'Discounted Products', detail: 'compare-at price drops', count: n(filterCatalog(products, { preset: 'discounted' })), viewHref: buildShopHref({ preset: 'discounted' }), manageHref: '/admin/products', manageLabel: 'Products' },
          ]}
        />

        <Section
          title="Category shelves"
          hint="Shop filter pills + admin product form options. Safe to delete — products are untouched."
          rows={categories.map((c: any) => ({
            label: c.name,
            detail: c.slug,
            count: products.filter((p) => (p.category ?? '').toLowerCase() === String(c.name).toLowerCase()).length,
            viewHref: buildShopHref({ category: c.name }),
            manageHref: '/admin/categories',
            manageLabel: 'Categories',
            onDelete: () => setDeleteTarget({ kind: 'category', id: c.id, name: c.name }),
          }))}
        />

        {categories.length === 0 && (
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Compass className="h-3.5 w-3.5" /> No categories yet — create shelves in Catalog → Categories.
          </p>
        )}
      </div>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif font-bold">Delete {deleteTarget?.kind === 'category' ? 'Category' : 'Collection'}</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              “{deleteTarget?.name}” will disappear from storefront navigation. Products themselves are never deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-9 text-xs rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="h-9 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => removeEntry.mutate()}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
