import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Pencil, Trash2, Tags } from 'lucide-react';
import { API_URL } from '@/lib/api-url';

interface CategoryForm {
  name: string;
  description: string;
  image: string;
}

const emptyForm: CategoryForm = { name: '', description: '', image: '' };

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/admin/categories`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  const save = useMutation({
    mutationFn: async (body: any) => {
      const url = editCategory
        ? `${API_URL}/api/admin/categories/${editCategory.id}`
        : `${API_URL}/api/admin/categories`;
      const res = await fetch(url, {
        method: editCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? 'Failed to save category');
      return payload;
    },
    onSuccess: () => {
      toast({ title: editCategory ? 'Category updated' : 'Category created' });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDialogOpen(false);
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const remove = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${API_URL}/api/admin/categories/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to delete category');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Category deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteId(null);
    },
    onError: () => toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' }),
  });

  const openAdd = () => {
    setEditCategory(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (category: any) => {
    setEditCategory(category);
    setForm({
      name: category.name ?? '',
      description: category.description ?? '',
      image: category.image ?? '',
    });
    setDialogOpen(true);
  };

  const categories: any[] = (data?.categories ?? []).filter((c: any) =>
    !search.trim() || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-5">
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">Category Shelves</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Categories appear in the shop filter and organise the catalogue. Deleting one never deletes products.
            </p>
          </div>
          <Button onClick={openAdd} className="gap-2 h-9 text-xs font-semibold rounded-xl shadow-xs shrink-0">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>

        <div className="flex items-center gap-3 bg-card border border-border/80 p-3 rounded-2xl shadow-xs">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs rounded-xl border-border/80 bg-background"
            />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Slug</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-8 bg-muted/60 animate-pulse rounded-xl w-full" />
                      </td>
                    </tr>
                  ))
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground">
                      <Tags className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No categories yet — add your first shelf</p>
                    </td>
                  </tr>
                ) : (
                  categories.map((category: any) => (
                    <tr key={category.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-foreground text-sm">{category.name}</td>
                      <td className="px-6 py-3.5 text-muted-foreground font-mono text-[11px]">{category.slug}</td>
                      <td className="px-6 py-3.5 text-muted-foreground truncate max-w-xs">{category.description || '—'}</td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(category)} className="h-8 w-8 rounded-lg hover:bg-muted">
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-500/10"
                            onClick={() => setDeleteId(category.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="font-serif font-bold text-lg">
              {editCategory ? 'Edit Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Musk Attars"
                className="h-10 text-xs rounded-xl border-border/80"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="One line for shoppers..."
                rows={3}
                className="text-xs rounded-xl border-border/80 resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Image URL (optional)</label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://…"
                className="h-10 text-xs rounded-xl border-border/80"
              />
            </div>
          </div>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-9 text-xs rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={() => save.mutate({ name: form.name, description: form.description, image: form.image })}
              disabled={save.isPending || !form.name.trim()}
              className="h-9 text-xs font-semibold rounded-xl"
            >
              {save.isPending ? 'Saving...' : editCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif font-bold">Delete Category</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              The shelf entry is removed from navigation filters. Products keep their category text and stay on sale.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="h-9 text-xs rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="h-9 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => deleteId !== null && remove.mutate(deleteId)}
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
