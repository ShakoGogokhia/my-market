import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { AdminAlertDialogFrame } from "@/components/admin/admin-alert-dialog-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast, Toaster } from "sonner";
import {
  CalendarClock,
  ClipboardList,
  Eye,
  Loader2,
  Package2,
  RefreshCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [{ title: "წინასწარი შეკვეთები", href: "/admin/pre-orders" }];

type User = {
  name: string;
  mobile_number: string | null;
};

type Product = {
  name: string;
};

type PreOrder = {
  id: number;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  note: string | null;
  created_at: string;
  quantity: number;
  user: User | null;
  product: Product | null;
};

type PageProps = {
  auth: {
    user?: {
      admin?: boolean;
    };
  };
  preOrders?: PreOrder[];
};

function StatCard({
  title,
  value,
  icon,
  tone = "default",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
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

export default function PreOrders() {
  const { preOrders = [], auth } = usePage<PageProps>().props;
  const user = auth?.user;

  const [orders, setOrders] = useState<PreOrder[]>(preOrders);
  const [searchProduct, setSearchProduct] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PreOrder | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    if (!user?.admin) {
      window.location.href = "/";
    }
  }, [user]);

  useEffect(() => {
    setOrders(preOrders);
  }, [preOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchProduct, searchCustomer]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const productName = order.product?.name.toLowerCase() ?? "";
      const customerName = (order.customer_name ?? "").toLowerCase();

      return (
        productName.includes(searchProduct.toLowerCase()) &&
        customerName.includes(searchCustomer.toLowerCase())
      );
    });
  }, [orders, searchProduct, searchCustomer]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * itemsPerPage;
  const pageOrders = filteredOrders.slice(start, start + itemsPerPage);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const stats = {
    total: orders.length,
    quantity: orders.reduce((sum, order) => sum + Number(order.quantity || 0), 0),
    products: new Set(orders.map((order) => order.product?.name).filter(Boolean)).size,
    customers: new Set(orders.map((order) => order.customer_name).filter(Boolean)).size,
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const submitDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeletingId(deleteTarget.id);
      await axios.delete(`/admin/pre-orders/${deleteTarget.id}`);
      setOrders((previous) => previous.filter((order) => order.id !== deleteTarget.id));
      toast.success("წინასწარი შეკვეთა წაიშალა.");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting pre-order:", error);
      toast.error("წაშლა ვერ მოხერხდა.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!user || !user.admin) return null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="წინასწარი შეკვეთები" />
      <Toaster richColors position="top-right" />

      <AdminPageShell
        badge="წინასწარი შეკვეთების მართვა"
        title="წინასწარი შეკვეთები"
        description="დაათვალიერეთ, მოძებნეთ და მართეთ მომხმარებლების წინასწარი შეკვეთები dashboard-ის სტილში."
        actions={
          <Button variant="secondary" className="bg-white text-slate-950 hover:bg-slate-100" onClick={refreshPage}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            განახლება
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="სულ შეკვეთები" value={stats.total} icon={<ClipboardList className="h-6 w-6" />} />
            <StatCard title="სულ რაოდენობა" value={stats.quantity} icon={<Package2 className="h-6 w-6" />} tone="sky" />
            <StatCard title="უნიკალური პროდუქტი" value={stats.products} icon={<Eye className="h-6 w-6" />} tone="green" />
            <StatCard title="მომხმარებლები" value={stats.customers} icon={<Users className="h-6 w-6" />} tone="amber" />
          </div>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">ძიება და ფილტრები</CardTitle>
                  <CardDescription>მოძებნეთ შეკვეთები პროდუქტის ან მომხმარებლის სახელით.</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  ნაპოვნია {filteredOrders.length} შედეგი
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>პროდუქტი</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-11 rounded-xl border-slate-300 pl-9"
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="პროდუქტის სახელით ძიება"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>მომხმარებელი</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-11 rounded-xl border-slate-300 pl-9"
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                    placeholder="მომხმარებლის სახელით ძიება"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">წინასწარი შეკვეთები</CardTitle>
                  <CardDescription>სუფთა ცხრილი სწრაფი მიმოხილვისა და წაშლის მოქმედებით.</CardDescription>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  გვერდი {safePage} / {totalPages}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {pageOrders.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="font-semibold text-slate-700">პროდუქტი</TableHead>
                        <TableHead className="font-semibold text-slate-700">რაოდენობა</TableHead>
                        <TableHead className="font-semibold text-slate-700">მომხმარებელი</TableHead>
                        <TableHead className="font-semibold text-slate-700">ელფოსტა</TableHead>
                        <TableHead className="font-semibold text-slate-700">ტელეფონი</TableHead>
                        <TableHead className="font-semibold text-slate-700">შენიშვნა</TableHead>
                        <TableHead className="font-semibold text-slate-700">დრო</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">მოქმედება</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {pageOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-slate-50/70">
                          <TableCell className="font-medium text-slate-900">
                            {order.product?.name ?? "მიუთითებელი"}
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.customer_name}</TableCell>
                          <TableCell>{order.customer_email ?? "-"}</TableCell>
                          <TableCell>{order.customer_phone ?? "-"}</TableCell>
                          <TableCell className="max-w-[280px] truncate">{order.note ?? "-"}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2 text-slate-700">
                              <CalendarClock className="h-4 w-4 text-slate-400" />
                              {new Date(order.created_at).toLocaleString("ka-GE")}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteTarget(order)}
                              className="rounded-xl"
                              disabled={deletingId === order.id}
                            >
                              {deletingId === order.id ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="mr-1 h-4 w-4" />
                              )}
                              წაშლა
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <ClipboardList className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="text-lg font-semibold text-slate-900">შეკვეთა ვერ მოიძებნა</div>
                  <p className="mt-1 text-sm text-slate-500">სცადეთ სხვა ფილტრი ან დაელოდეთ ახალ შეკვეთებს.</p>
                </div>
              )}

              {pageOrders.length > 0 ? (
                <>
                  <Separator />
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <p>
                      ნაჩვენებია {start + 1}-დან {Math.min(start + itemsPerPage, filteredOrders.length)}-მდე, სულ{" "}
                      {filteredOrders.length} შეკვეთა
                    </p>
                    <Badge variant="outline" className="rounded-full px-4 py-2">
                      {safePage}
                    </Badge>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </AdminPageShell>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AdminAlertDialogFrame
          title="წინასწარი შეკვეთის წაშლა"
          description={`დარწმუნებული ხართ, რომ გსურთ წაშალოთ "${deleteTarget?.customer_name || "ეს შეკვეთა"}"?`}
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
            ეს მოქმედება შეუქცევადია და შეკვეთა წაიშლება მონაცემთა ბაზიდან.
          </div>
        </AdminAlertDialogFrame>
      </AlertDialog>
    </AppLayout>
  );
}
