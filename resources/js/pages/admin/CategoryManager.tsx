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
  { title: "კატეგორიები", href: "/admin/CategoryManager" },
];

type PageProps = {
  auth?: {
    user?: {
      admin?: boolean;
    };
  };
};

type CategoryItem = {
  name: string;
  icon_url?: string | null;
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

function CategoryAvatar({ category }: { category?: CategoryItem | null }) {
  if (category?.icon_url) {
    return (
      <img
        src={category.icon_url}
        alt={category.name}
        className="h-10 w-10 rounded-2xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
      <LayoutGrid className="h-5 w-5" />
    </div>
  );
}

export default function CategoriesPage() {
  const { auth } = usePage<PageProps>().props;
  const user = auth?.user;

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createIcon, setCreateIcon] = useState<File | null>(null);
  const [createIconPreview, setCreateIconPreview] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState<File | null>(null);
  const [editIconPreview, setEditIconPreview] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);

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

  useEffect(() => {
    if (!createIcon) {
      setCreateIconPreview(null);
      return;
    }

    const preview = URL.createObjectURL(createIcon);
    setCreateIconPreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [createIcon]);

  useEffect(() => {
    if (!editIcon) {
      setEditIconPreview(null);
      return;
    }

    const preview = URL.createObjectURL(editIcon);
    setEditIconPreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [editIcon]);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const query = searchTerm.toLowerCase();
    return categories.filter((category) => category.name.toLowerCase().includes(query));
  }, [categories, searchTerm]);

  const stats = {
    total: categories.length,
    filtered: filteredCategories.length,
    withIcon: categories.filter((category) => Boolean(category.icon_url)).length,
    withoutIcon: categories.filter((category) => !category.icon_url).length,
  };

  const openCreate = () => {
    setCreateName("");
    setCreateIcon(null);
    setCreateOpen(true);
  };

  const openEdit = (category: CategoryItem) => {
    setEditingCategory(category);
    setEditName(category.name);
    setEditIcon(null);
    setEditOpen(true);
  };

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    const name = createName.trim();
    if (!name) {
      toast.warning("გთხოვთ, შეიყვანოთ კატეგორიის სახელი.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      if (createIcon) {
        formData.append("icon", createIcon);
      }

      await axios.post("/categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("კატეგორია შეიქმნა.");
      setCreateOpen(false);
      setCreateName("");
      setCreateIcon(null);
      await fetchCategories();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        toast.error("ეს კატეგორია უკვე არსებობს.");
      } else {
        toast.error("კატეგორიის შექმნა ვერ მოხერხდა.");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitEdit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!editingCategory) return;

    const name = editName.trim();
    if (!name) {
      toast.warning("გთხოვთ, შეიყვანოთ კატეგორიის სახელი.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      if (editIcon) {
        formData.append("icon", editIcon);
      }
      formData.append("_method", "PUT");

      await axios.post(`/categories/${encodeURIComponent(editingCategory.name)}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("კატეგორია განახლდა.");
      setEditOpen(false);
      setEditingCategory(null);
      setEditName("");
      setEditIcon(null);
      await fetchCategories();
    } catch (err) {
      console.error("Error updating category:", err);
      toast.error("კატეგორიის განახლება ვერ მოხერხდა.");
    } finally {
      setLoading(false);
    }
  };

  const submitDelete = async () => {
    if (!deleteTarget) return;

    try {
      setLoading(true);
      await axios.delete(`/categories/${encodeURIComponent(deleteTarget.name)}`);
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
        description="დაამატეთ, შეცვალეთ და წაშალეთ კატეგორიები. თითოეულ კატეგორიას შეუძლია ჰქონდეს საკუთარი icon ან image."
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
            <Button onClick={openCreate} className="shadow-sm">
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
            <StatCard title="icon-ით" value={stats.withIcon} icon={<FolderPlus className="h-6 w-6" />} tone="green" />
            <StatCard title="icon-ის გარეშე" value={stats.withoutIcon} icon={<PencilLine className="h-6 w-6" />} tone="amber" />
          </div>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">ძიება და ფილტრი</CardTitle>
                  <CardDescription>სწრაფად მოძებნეთ კატეგორია სახელით ან ნახეთ რამდენს აქვს icon.</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  ნაპოვნია {filteredCategories.length} ჩანაწერი
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
                    placeholder="კატეგორიის სახელი..."
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
                  <CardDescription>გამოსახულება ნაჩვენებია თუ ადმინისტრატორმა ატვირთა icon ან image.</CardDescription>
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
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">icon</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-700">სახელი</th>
                      <th className="px-6 py-3 text-right font-semibold text-slate-700">მოქმედებები</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((category, index) => (
                      <tr
                        key={category.name}
                        className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} hover:bg-blue-50 transition`}
                      >
                        <td className="px-6 py-3">
                          <CategoryAvatar category={category} />
                        </td>
                        <td className="px-6 py-3">
                          <div className="space-y-1">
                            <span className="font-medium text-slate-800">{category.name}</span>
                            {!category.icon_url && (
                              <p className="text-xs text-slate-500">ნაგულისხმევი icon გამოიყენება</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => openEdit(category)}
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
                        </td>
                      </tr>
                    ))}
                    {filteredCategories.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-500 italic">
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
          description="შეიყვანეთ კატეგორიის სახელი და სურვილის შემთხვევაში ატვირთეთ icon ან image. თუ არ ატვირთავთ, ნაგულისხმევი icon გამოჩნდება."
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
          <form id="create-category-form" className="space-y-4" onSubmit={submitCreate}>
            <div className="space-y-2">
              <Label>კატეგორიის სახელი</Label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="მაგ: Cameras"
                autoFocus
                className="h-11 rounded-xl border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label>Icon ან image</Label>
              <div className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                <CategoryAvatar
                  category={createIconPreview ? { name: createName || "preview", icon_url: createIconPreview } : null}
                />
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCreateIcon(e.target.files?.[0] || null)}
                    className="h-11 rounded-xl border-slate-300"
                  />
                  <p className="text-xs text-slate-500">
                    ატვირთვა არ არის სავალდებულო. თუ არ აირჩევთ ფაილს, კატეგორია default icon-ით გამოჩნდება.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </AdminDialogFrame>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setEditingCategory(null);
            setEditIcon(null);
          }
        }}
      >
        <AdminDialogFrame
          title="კატეგორიის რედაქტირება"
          description="შეცვალეთ სახელი ან ჩაანაცვლეთ არსებული icon/image ახალი ფაილით."
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl">
                გაუქმება
              </Button>
              <Button type="submit" form="edit-category-form" disabled={loading} className="rounded-xl">
                {loading ? "ინახება..." : "შენახვა"}
              </Button>
            </>
          }
        >
          <form id="edit-category-form" className="space-y-4" onSubmit={submitEdit}>
            <div className="space-y-2">
              <Label>კატეგორიის სახელი</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-11 rounded-xl border-slate-300"
              />
            </div>

            <div className="space-y-2">
              <Label>არსებული icon</Label>
              <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <CategoryAvatar category={editIconPreview ? { name: editName || "preview", icon_url: editIconPreview } : editingCategory} />
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditIcon(e.target.files?.[0] || null)}
                    className="h-11 rounded-xl border-slate-300"
                  />
                  <p className="text-xs text-slate-500">
                    ახალი ფაილის ატვირთვა შეცვლის ძველ icon-ს. თუ ფაილს არ აირჩევთ, არსებული დარჩება.
                  </p>
                </div>
              </div>
            </div>
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
          description={`დარწმუნებული ხართ, რომ გსურთ წაშალოთ "${deleteTarget?.name || "ეს კატეგორია"}"?`}
          footer={
            <>
              <AlertDialogCancel className="rounded-xl">გაუქმება</AlertDialogCancel>
              <AlertDialogAction
                onClick={submitDelete}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                წაშლა
              </AlertDialogAction>
            </>
          }
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            icon ფაილიც წაიშლება, თუ კატეგორიას ჰქონდა ატვირთული image.
          </div>
        </AdminAlertDialogFrame>
      </AlertDialog>
    </AppLayout>
  );
}
