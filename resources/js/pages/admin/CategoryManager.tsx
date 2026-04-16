import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { AdminAlertDialogFrame } from "@/components/admin/admin-alert-dialog-frame";
import { AdminDialogFrame } from "@/components/admin/admin-dialog-frame";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast, Toaster } from "sonner";
import { FolderPlus, LayoutGrid, PencilLine, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "მთავარი გვერდი", href: "/dashboard" },
  { title: "კატეგორიები", href: "/categories" },
];

type PageProps = {
  auth?: {
    user?: {
      admin?: boolean;
    };
  };
};

function StatCard({
  title,
  value,
  icon,
  tone = "default",
}: {
  title: string;
  value: number | string;
  icon: ReactNode;
  tone?: "default" | "green" | "amber" | "sky";
}) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : tone === "sky"
      ? "bg-sky-50 text-sky-700 border-sky-100"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          </div>
          <div className={`rounded-2xl border p-3 shadow-sm ${toneClass}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CategoriesPage() {
  const { auth } = usePage<PageProps>().props;
  const user = auth?.user;

  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/categories");
      const cats = Array.isArray(res.data?.categories)
        ? res.data.categories
        : Array.isArray(res.data)
        ? res.data
        : [];
      setCategories(cats);
    } catch (err) {
      console.error("Error loading categories:", err);
      toast.error("კატეგორიების ჩატვირთვა ვერ მოხერხდა.");
    }
  };

  useEffect(() => {
    if (!user?.admin) {
      window.location.href = "/";
      return;
    }

    fetchCategories();
  }, [user]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    return categories.filter((category) => category.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [categories, searchTerm]);

  const stats = {
    total: categories.length,
    filtered: filteredCategories.length,
    startingWithA: categories.filter((category) => category.toLowerCase().startsWith("a")).length,
    longNames: categories.filter((category) => category.length > 12).length,
  };

  const handleAddCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = newCategory.trim();
    if (!name) return toast.warning("გთხოვთ, შეიყვანოთ კატეგორიის სახელი.");

    try {
      setLoading(true);
      await axios.post("/categories", { name });
      toast.success("კატეგორია წარმატებით დაემატა.");
      setNewCategory("");
      setCreateOpen(false);
      await fetchCategories();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.error("ეს კატეგორია უკვე არსებობს.");
      } else {
        toast.error("კატეგორიის დამატება ვერ მოხერხდა.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (oldName: string) => {
    const name = editedName.trim();
    if (!name) return toast.warning("გთხოვთ, შეიყვანოთ ახალი სახელი.");

    try {
      setLoading(true);
      await axios.put(`/categories/${encodeURIComponent(oldName)}`, { name });
      toast.success("კატეგორია განახლდა.");
      setEditingCategory(null);
      setEditedName("");
      await fetchCategories();
    } catch (err) {
      console.error("Error updating category:", err);
      toast.error("კატეგორიის განახლება ვერ მოხერხდა.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteTarget) return;

    try {
      setLoading(true);
      await axios.delete(`/categories/${encodeURIComponent(deleteTarget)}`);
      toast.success("კატეგორია წაიშალა.");
      setDeleteTarget(null);
      await fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("კატეგორიის წაშლა ვერ მოხერხდა.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.admin) return null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="კატეგორიები" />
      <Toaster richColors position="top-right" />

      <AdminPageShell
        badge="კატეგორიების მართვა"
        title="კატეგორიები"
        description="დაამატეთ, შეცვალეთ და წაშალეთ კატეგორიები dashboard-ის ერთიან დიზაინში."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="secondary"
              className="bg-white text-slate-950 hover:bg-slate-100"
              onClick={fetchCategories}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              განახლება
            </Button>
            <Button onClick={() => setCreateOpen(true)} className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              ახალი კატეგორია
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="სულ კატეგორიები" value={stats.total} icon={<LayoutGrid className="h-6 w-6" />} />
            <StatCard title="ფილტრში" value={stats.filtered} icon={<Search className="h-6 w-6" />} tone="sky" />
            <StatCard title='"a"-ზე იწყება' value={stats.startingWithA} icon={<FolderPlus className="h-6 w-6" />} tone="green" />
            <StatCard title="გრძელი სახელები" value={stats.longNames} icon={<PencilLine className="h-6 w-6" />} tone="amber" />
          </div>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">ძიება და ფილტრი</CardTitle>
                  <CardDescription>სწრაფად მოძებნეთ კატეგორია სახელის მიხედვით.</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  ნაპოვნია {filteredCategories.length} შედეგი
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <Label>ძიება</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="კატეგორიის ძიება..."
                    className="h-11 rounded-xl border-slate-300 pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">კატეგორიების სია</CardTitle>
                  <CardDescription>დაარედაქტირეთ ან წაშალეთ საჭირო ჩანაწერები.</CardDescription>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  საერთო {categories.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">კატეგორიის სახელი</th>
                      <th className="px-6 py-3 text-right font-semibold text-slate-700">მოქმედებები</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category, index) => (
                      <tr key={category} className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50 transition`}>
                        <td className="px-6 py-3">
                          {editingCategory === category ? (
                            <Input
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="h-10 rounded-xl border-slate-300"
                            />
                          ) : (
                            <span className="font-medium text-slate-800">{category}</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {editingCategory === category ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                onClick={() => handleUpdateCategory(category)}
                                disabled={loading}
                              >
                                <PencilLine className="mr-1 h-4 w-4" />
                                შენახვა
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => setEditingCategory(null)}
                              >
                                გაუქმება
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-xl"
                                onClick={() => {
                                  setEditingCategory(category);
                                  setEditedName(category);
                                }}
                              >
                                <PencilLine className="mr-1 h-4 w-4" />
                                რედაქტირება
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                className="rounded-xl"
                                onClick={() => setDeleteTarget(category)}
                                disabled={loading}
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                წაშლა
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredCategories.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-12 text-center text-slate-500 italic">
                          კატეგორია ვერ მოიძებნა
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Separator />
        </div>
      </AdminPageShell>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <AdminDialogFrame
          title="ახალი კატეგორიის დამატება"
          description="შეიყვანეთ კატეგორიის სახელი და ის დაუყოვნებლივ გამოჩნდება სიაში."
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl">
                გაუქმება
              </Button>
              <Button type="submit" form="create-category-form" disabled={loading} className="rounded-xl">
                {loading ? "ინახება..." : "დამატება"}
              </Button>
            </>
          }
        >
          <form id="create-category-form" className="space-y-4" onSubmit={handleAddCategory}>
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="მაგ: მზის აქსესუარები"
              autoFocus
              className="h-11 rounded-xl border-slate-300"
            />
          </form>
        </AdminDialogFrame>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AdminAlertDialogFrame
          title="კატეგორიის წაშლა"
          description={`დარწმუნებული ხართ, რომ გსურთ წაშალოთ "${deleteTarget || "ეს კატეგორია"}"?`}
          footer={
            <>
              <AlertDialogCancel className="rounded-xl">გაუქმება</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCategory}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                წაშლა
              </AlertDialogAction>
            </>
          }
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            ეს მოქმედება კატეგორიას სამუდამოდ წაშლის.
          </div>
        </AdminAlertDialogFrame>
      </AlertDialog>
    </AppLayout>
  );
}
