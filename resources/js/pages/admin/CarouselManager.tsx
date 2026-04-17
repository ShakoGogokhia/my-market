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
import { Checkbox } from "@/components/ui/checkbox";
import { toast, Toaster } from "sonner";
import { EyeOff, ImagePlus, LayoutGrid, PencilLine, Plus, RefreshCcw, Search, Trash2 } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [
  { title: "მთავარი გვერდი", href: "/dashboard" },
  { title: "სლაიდერის სურათები", href: "/admin/carousel-images" },
];

type PageProps = {
  auth?: {
    user?: {
      admin?: boolean;
    };
  };
};

type CarouselImageItem = {
  id: number;
  title?: string | null;
  image_url: string;
  sort_order?: number;
  active?: boolean;
  created_at?: string | null;
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

function CarouselPreview({ image }: { image?: CarouselImageItem | null }) {
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      {image?.image_url ? (
        <img src={image.image_url} alt={image.title || "carousel"} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-slate-400">
          <ImagePlus className="h-10 w-10" />
        </div>
      )}
    </div>
  );
}

export default function CarouselManager() {
  const { auth } = usePage<PageProps>().props;
  const user = auth?.user;

  const [items, setItems] = useState<CarouselImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createOrder, setCreateOrder] = useState("0");
  const [createActive, setCreateActive] = useState(true);
  const [createImage, setCreateImage] = useState<File | null>(null);
  const [createPreview, setCreatePreview] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CarouselImageItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editOrder, setEditOrder] = useState("0");
  const [editActive, setEditActive] = useState(true);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CarouselImageItem | null>(null);

  const fetchItems = async () => {
    const res = await axios.get("/admin/carousel-images/list");
    const list = Array.isArray(res.data?.carousel_images) ? res.data.carousel_images : [];
    setItems(list);
  };

  useEffect(() => {
    if (!user?.admin) {
      window.location.href = "/";
      return;
    }

    fetchItems().catch((err) => {
      console.error(err);
      toast.error("სლაიდერის სურათები ვერ ჩაიტვირთა.");
    });
  }, [user]);

  useEffect(() => {
    if (!createImage) {
      setCreatePreview(null);
      return;
    }
    const preview = URL.createObjectURL(createImage);
    setCreatePreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [createImage]);

  useEffect(() => {
    if (!editImage) {
      setEditPreview(null);
      return;
    }
    const preview = URL.createObjectURL(editImage);
    setEditPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [editImage]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const query = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        (item.title || "").toLowerCase().includes(query) ||
        String(item.sort_order || "").includes(query),
    );
  }, [items, searchTerm]);

  const stats = {
    total: items.length,
    active: items.filter((item) => item.active).length,
    inactive: items.filter((item) => !item.active).length,
    withTitle: items.filter((item) => Boolean(item.title)).length,
  };

  const openCreate = () => {
    setCreateTitle("");
    setCreateOrder("0");
    setCreateActive(true);
    setCreateImage(null);
    setCreateOpen(true);
  };

  const openEdit = (item: CarouselImageItem) => {
    setEditingItem(item);
    setEditTitle(item.title || "");
    setEditOrder(String(item.sort_order ?? 0));
    setEditActive(Boolean(item.active));
    setEditImage(null);
    setEditOpen(true);
  };

  const submitCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!createImage) {
      toast.warning("გთხოვთ, აირჩიოთ სურათი.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", createTitle.trim());
      formData.append("sort_order", createOrder || "0");
      formData.append("active", createActive ? "1" : "0");
      formData.append("image", createImage);

      await axios.post("/admin/carousel-images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("სლაიდერის სურათი დაემატა.");
      setCreateOpen(false);
      await fetchItems();
    } catch (error) {
      console.error(error);
      toast.error("სლაიდერის სურათი ვერ დაემატა.");
    } finally {
      setLoading(false);
    }
  };

  const submitEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingItem) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("sort_order", editOrder || "0");
      formData.append("active", editActive ? "1" : "0");
      if (editImage) {
        formData.append("image", editImage);
      }
      formData.append("_method", "PUT");

      await axios.post(`/admin/carousel-images/${editingItem.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("სლაიდერის სურათი განახლდა.");
      setEditOpen(false);
      setEditingItem(null);
      await fetchItems();
    } catch (error) {
      console.error(error);
      toast.error("სლაიდერის სურათი ვერ განახლდა.");
    } finally {
      setLoading(false);
    }
  };

  const submitDelete = async () => {
    if (!deleteTarget) return;
    try {
      setLoading(true);
      await axios.delete(`/admin/carousel-images/${deleteTarget.id}`);
      toast.success("სლაიდერის სურათი წაიშალა.");
      setDeleteTarget(null);
      await fetchItems();
    } catch (error) {
      console.error(error);
      toast.error("სლაიდერის სურათი ვერ წაიშალა.");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.admin) return null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="სლაიდერის სურათები" />
      <Toaster richColors position="top-right" />

      <AdminPageShell
        badge="მთავარი გვერდის სლაიდერი"
        title="სლაიდერის სურათები"
        description="მართეთ მთავარი გვერდის სლაიდერში ნაჩვენები სურათები."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" className="bg-white text-slate-950 hover:bg-slate-100" onClick={fetchItems}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              განახლება
            </Button>
            <Button onClick={openCreate} className="shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              სურათის დამატება
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="სულ სლაიდები" value={stats.total} icon={<LayoutGrid className="h-6 w-6" />} />
            <StatCard title="აქტიური" value={stats.active} icon={<ImagePlus className="h-6 w-6" />} tone="green" />
            <StatCard title="დამალული" value={stats.inactive} icon={<EyeOff className="h-6 w-6" />} tone="amber" />
            <StatCard title="სათაურით" value={stats.withTitle} icon={<PencilLine className="h-6 w-6" />} tone="sky" />
          </div>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">ძიება</CardTitle>
                  <CardDescription>იპოვეთ სლაიდები სათაურით ან დალაგების ნომრით.</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  ნაპოვნია {filteredItems.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>სლაიდების ძიება</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="სათაური ან დალაგების ნომერი"
                    className="h-11 rounded-xl border-slate-300 pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-sm">
                <CardContent className="space-y-4 p-4">
                  <CarouselPreview image={item} />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="line-clamp-1 text-base font-semibold text-slate-900">
                        {item.title || "უსათაურო"}
                      </h3>
                      <Badge variant={item.active ? "default" : "secondary"} className="rounded-full">
                        {item.active ? "აქტიური" : "დამალული"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">დალაგების ნომერი: {item.sort_order ?? 0}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => openEdit(item)}>
                      <PencilLine className="mr-2 h-4 w-4" />
                      რედაქტირება
                    </Button>
                    <Button type="button" variant="destructive" className="rounded-xl" onClick={() => setDeleteTarget(item)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <Card className="rounded-3xl border-dashed border-slate-300 bg-white shadow-sm">
              <CardContent className="py-16 text-center text-slate-500">
                ჯერ სლაიდერის სურათები არ არის.
              </CardContent>
            </Card>
          )}

          <Separator />
        </div>
      </AdminPageShell>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <AdminDialogFrame
          title="სლაიდერის სურათის დამატება"
          description="ატვირთეთ სურათი მთავარი გვერდის სლაიდერისთვის. შეგიძლიათ დატოვოთ აქტიურად ან დამალოთ."
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl">
                გაუქმება
              </Button>
              <Button type="submit" form="carousel-create-form" disabled={loading} className="rounded-xl">
                {loading ? "ინახება..." : "შენახვა"}
              </Button>
            </>
          }
        >
          <form id="carousel-create-form" className="space-y-4" onSubmit={submitCreate}>
            <div className="space-y-2">
              <Label>სათაური</Label>
              <Input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} className="h-11 rounded-xl border-slate-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>დალაგების ნომერი</Label>
                <Input type="number" min="0" value={createOrder} onChange={(e) => setCreateOrder(e.target.value)} className="h-11 rounded-xl border-slate-300" />
              </div>
              <div className="flex items-end">
                <label className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">აქტიური</span>
                  <Checkbox checked={createActive} onCheckedChange={(checked) => setCreateActive(Boolean(checked))} />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>სურათი</Label>
              <Input type="file" accept="image/*" onChange={(e) => setCreateImage(e.target.files?.[0] || null)} className="h-11 rounded-xl border-slate-300" />
              <CarouselPreview image={createPreview ? { id: 0, image_url: createPreview } : null} />
            </div>
          </form>
        </AdminDialogFrame>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <AdminDialogFrame
          title="სლაიდერის სურათის რედაქტირება"
          description="შეცვალეთ სათაური, ნომერი, აქტიურობა ან თავად სურათი."
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl">
                გაუქმება
              </Button>
              <Button type="submit" form="carousel-edit-form" disabled={loading} className="rounded-xl">
                {loading ? "ინახება..." : "განახლება"}
              </Button>
            </>
          }
        >
          <form id="carousel-edit-form" className="space-y-4" onSubmit={submitEdit}>
            <div className="space-y-2">
              <Label>სათაური</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-11 rounded-xl border-slate-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>დალაგების ნომერი</Label>
                <Input type="number" min="0" value={editOrder} onChange={(e) => setEditOrder(e.target.value)} className="h-11 rounded-xl border-slate-300" />
              </div>
              <div className="flex items-end">
                <label className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700">აქტიური</span>
                  <Checkbox checked={editActive} onCheckedChange={(checked) => setEditActive(Boolean(checked))} />
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <Label>სურათის შეცვლა</Label>
              <Input type="file" accept="image/*" onChange={(e) => setEditImage(e.target.files?.[0] || null)} className="h-11 rounded-xl border-slate-300" />
              <CarouselPreview image={editPreview ? { id: 0, image_url: editPreview } : editingItem} />
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
          title="სლაიდერის სურათის წაშლა"
          description="დარწმუნებული ხართ, რომ გსურთ ამ სლაიდის წაშლა მთავარი გვერდიდან?"
          footer={
            <>
              <AlertDialogCancel className="rounded-xl">გაუქმება</AlertDialogCancel>
              <AlertDialogAction onClick={submitDelete} className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                წაშლა
              </AlertDialogAction>
            </>
          }
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            სურათის ფაილიც წაიშლება საცავიდან.
          </div>
        </AdminAlertDialogFrame>
      </AlertDialog>
    </AppLayout>
  );
}
