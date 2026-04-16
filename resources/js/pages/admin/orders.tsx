import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { AdminAlertDialogFrame } from "@/components/admin/admin-alert-dialog-frame";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster, toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Package2,
  Search,
  Truck,
} from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [{ title: "შეკვეთები", href: "/admin/orders" }];

type OrderItem = {
  id: number;
  product_image?: string;
  product_name?: string;
  product_price?: number | string;
  quantity?: number;
};

type OrderUser = {
  address?: string | null;
  contact_person?: string | null;
  email?: string | null;
  mobile_number?: string | null;
  name?: string | null;
  organization_location?: string | null;
};

type Order = {
  id: number;
  created_at: string;
  status: string;
  total_amount: number | string;
  user_id?: number;
  user?: OrderUser;
  order_items?: OrderItem[];
};

type PageProps = {
  auth: {
    user?: {
      admin?: boolean;
    };
  };
  orders?: Order[];
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

function OrderEditDialog({
  open,
  onOpenChange,
  orderDetails,
  setOrderDetails,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderDetails: Partial<Order>;
  setOrderDetails: React.Dispatch<React.SetStateAction<Partial<Order>>>;
  onSave: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AdminAlertDialogFrame
        title="შეკვეთის რედაქტირება"
        description="განაახლეთ თანხა ან სტატუსი dashboard-ის სტილში გაფორმებულ მოდალში."
        className="sm:max-w-xl"
        footer={
          <>
            <AlertDialogCancel onClick={() => onOpenChange(false)}>
              გაუქმება
            </AlertDialogCancel>
            <AlertDialogAction onClick={onSave}>შენახვა</AlertDialogAction>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="order-amount">ჯამური თანხა</Label>
            <Input
              id="order-amount"
              value={orderDetails.total_amount || ""}
              onChange={(event) =>
                setOrderDetails({
                  ...orderDetails,
                  total_amount: event.target.value,
                })
              }
              className="h-11 rounded-xl border-slate-300 bg-white"
              placeholder="ჯამური თანხა"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-status">სტატუსი</Label>
            <Input
              id="order-status"
              value={orderDetails.status || ""}
              onChange={(event) =>
                setOrderDetails({
                  ...orderDetails,
                  status: event.target.value,
                })
              }
              className="h-11 rounded-xl border-slate-300 bg-white"
              placeholder="სტატუსი"
            />
          </div>
        </div>
      </AdminAlertDialogFrame>
    </AlertDialog>
  );
}

function OrderDetailsDialog({
  open,
  onOpenChange,
  order,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AdminAlertDialogFrame
        title={`შეკვეთის #${order?.id ?? ""} დეტალები`}
        description="იხილეთ შეკვეთის სრული ინფორმაცია იმავე dashboard-style მოდალში."
        className="sm:max-w-5xl"
        footer={
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            დახურვა
          </AlertDialogCancel>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">მომხმარებელი</p>
              <p className="mt-1 font-semibold text-slate-900">{order?.user?.name || "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">ელფოსტა</p>
              <p className="mt-1 font-semibold text-slate-900">{order?.user?.email || "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">ტელეფონი</p>
              <p className="mt-1 font-semibold text-slate-900">{order?.user?.mobile_number || "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">ლოკაცია</p>
              <p className="mt-1 font-semibold text-slate-900">{order?.user?.organization_location || "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">მისამართი</p>
              <p className="mt-1 font-semibold text-slate-900">{order?.user?.address || "-"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">საკონტაქტო პირი</p>
              <p className="mt-1 font-semibold text-slate-900">{order?.user?.contact_person || "-"}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="font-semibold text-slate-700">ფოტო</TableHead>
                  <TableHead className="font-semibold text-slate-700">პროდუქტი</TableHead>
                  <TableHead className="font-semibold text-slate-700">ფასი</TableHead>
                  <TableHead className="font-semibold text-slate-700">რაოდენობა</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order?.order_items?.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/70">
                    <TableCell>
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{item.product_name || "-"}</TableCell>
                    <TableCell>{item.product_price ?? "-"} ₾</TableCell>
                    <TableCell>{item.quantity ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </AdminAlertDialogFrame>
    </AlertDialog>
  );
}

export default function Orders() {
  const { auth, orders: initialOrders = [] } = usePage<PageProps>().props;
  const user = auth?.user;

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loadingOrders, setLoadingOrders] = useState<{
    [key: number]: { accept: boolean; decline: boolean };
  }>({});
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<Partial<Order>>({});
  const [detailsOrder, setDetailsOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user?.admin) window.location.href = "/";
  }, [user]);

  const setLoading = (id: number, type: "accept" | "decline", value: boolean) => {
    setLoadingOrders((previous) => ({
      ...previous,
      [id]: {
        ...(previous[id] || { accept: false, decline: false }),
        [type]: value,
      },
    }));
  };

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim();
    if (!query) return sortedOrders;
    return sortedOrders.filter((order) => order.id.toString().includes(query));
  }, [searchTerm, sortedOrders]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(start, start + itemsPerPage);

  useEffect(() => {
    if (currentPage !== safePage) setCurrentPage(safePage);
  }, [currentPage, safePage]);

  const stats = {
    total: orders.length,
    pending: orders.filter((order) => order.status === "pending").length,
    processed: orders.filter((order) => order.status !== "pending").length,
  };

  const handleAcceptOrder = (id: number) => {
    setLoading(id, "accept", true);
    axios
      .put(`/admin/orders/${id}/accept`)
      .then((response) => {
        toast.success(response.data.message || "შეკვეთა მიღებულია.");
        setOrders((previous) =>
          previous.map((order) => (order.id === id ? { ...order, status: "accepted" } : order)),
        );
        setLoading(id, "accept", false);
      })
      .catch((error) => {
        console.error("Error accepting order:", error);
        setLoading(id, "accept", false);
      });
  };

  const handleDeclineOrder = (id: number) => {
    setLoading(id, "decline", true);
    axios
      .put(`/admin/orders/${id}/decline`)
      .then((response) => {
        toast.success(response.data.message || "შეკვეთა უარყოფილია.");
        setOrders((previous) =>
          previous.map((order) => (order.id === id ? { ...order, status: "declined" } : order)),
        );
        setLoading(id, "decline", false);
      })
      .catch((error) => {
        console.error("Error declining order:", error);
        setLoading(id, "decline", false);
      });
  };

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setOrderDetails({
      total_amount: order.total_amount,
      status: order.status,
    });
  };

  const handleSave = () => {
    if (!editingOrder) return;

    axios
      .put(`/admin/orders/${editingOrder.id}`, orderDetails)
      .then((response) => {
        toast.success(response.data.message || "შეკვეთა განახლდა.");
        setOrders((previous) =>
          previous.map((order) =>
            order.id === editingOrder.id
              ? {
                  ...order,
                  total_amount: orderDetails.total_amount ?? order.total_amount,
                  status: orderDetails.status ?? order.status,
                }
              : order,
          ),
        );
        setEditingOrder(null);
      })
      .catch((error) => {
        console.error("Error updating order:", error);
        toast.error("შეკვეთის განახლება ვერ მოხერხდა.");
      });
  };

  if (!user || !user.admin) return null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="შეკვეთები" />
      <Toaster richColors position="top-right" />

      <AdminPageShell
        badge="შეკვეთების მართვა"
        title="შეკვეთები"
        description="იხილეთ, დაარედაქტირეთ და მართეთ შეკვეთები იმავე dashboard-style დიზაინში, როგორც დანარჩენი ადმინისტრაციული პანელი."
        actions={
          <a href="/dashboard">
            <Button variant="secondary" className="bg-white text-slate-950 hover:bg-slate-100">
              მთავარ გვერდზე დაბრუნება
            </Button>
          </a>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="სულ შეკვეთები" value={stats.total} icon={<Package2 className="h-6 w-6" />} />
            <StatCard title="მოლოდინში" value={stats.pending} icon={<Clock3 className="h-6 w-6" />} tone="amber" />
            <StatCard title="დამუშავებული" value={stats.processed} icon={<Truck className="h-6 w-6" />} tone="green" />
          </div>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">ძიება და სტატუსი</CardTitle>
                  <CardDescription>მოძებნეთ შეკვეთა ID-ით და სწრაფად გადახედეთ მიმდინარე შედეგებს.</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  ნაპოვნია {filteredOrders.length} შედეგი
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>ძიება</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Order ID-ით მოძებნა"
                    className="h-11 rounded-xl border-slate-300 pl-9"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>გვერდი</Label>
                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                  {safePage} / {totalPages}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">შეკვეთების სია</CardTitle>
                  <CardDescription>რედაქტირება, მიღება, უარყოფა და დეტალების ნახვა ერთ ბლოკში.</CardDescription>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  გვერდი {safePage} / {totalPages}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {currentOrders.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="font-semibold text-slate-700">შეკვეთა</TableHead>
                        <TableHead className="font-semibold text-slate-700">მომხმარებელი</TableHead>
                        <TableHead className="font-semibold text-slate-700">თანხა</TableHead>
                        <TableHead className="font-semibold text-slate-700">სტატუსი</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">მოქმედებები</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {currentOrders.map((order) => {
                        const isPending = order.status === "pending";

                        return (
                          <TableRow key={order.id} className="hover:bg-slate-50/70">
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-semibold text-slate-900">შეკვეთა #{order.id}</div>
                                <div className="text-xs text-slate-500">
                                  მომხმარებელი #{order.user_id || "-"}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-slate-900">{order.user?.name || "-"}</div>
                                <div className="text-xs text-slate-500">{order.user?.email || "-"}</div>
                              </div>
                            </TableCell>

                            <TableCell className="font-medium text-slate-900">{order.total_amount} ₾</TableCell>

                            <TableCell>
                              <Badge
                                className={
                                  isPending
                                    ? "rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100"
                                    : "rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                }
                              >
                                {isPending ? "მოლოდინში" : order.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex flex-wrap justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(order)}
                                  className="rounded-xl"
                                >
                                  რედაქტირება
                                </Button>

                                {isPending ? (
                                  <>
                                    <Button
                                      className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                                      size="sm"
                                      onClick={() => handleAcceptOrder(order.id)}
                                      disabled={loadingOrders[order.id]?.accept}
                                    >
                                      {loadingOrders[order.id]?.accept ? "მუშავდება..." : "მიღება"}
                                    </Button>
                                    <Button
                                      className="rounded-xl bg-red-600 text-white hover:bg-red-700"
                                      size="sm"
                                      onClick={() => handleDeclineOrder(order.id)}
                                      disabled={loadingOrders[order.id]?.decline}
                                    >
                                      {loadingOrders[order.id]?.decline ? "მუშავდება..." : "უარყოფა"}
                                    </Button>
                                  </>
                                ) : null}

                                <Button
                                  className="rounded-xl bg-slate-700 text-white hover:bg-slate-800"
                                  size="sm"
                                  onClick={() => setDetailsOrder(order)}
                                >
                                  დეტალები
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Package2 className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="text-lg font-semibold text-slate-900">შეკვეთა ვერ მოიძებნა</div>
                  <p className="mt-1 text-sm text-slate-500">სცადეთ სხვა ID ან გაასუფთავეთ ძიება.</p>
                </div>
              )}

              {currentOrders.length > 0 ? (
                <>
                  <div className="border-t border-slate-200 pt-4">
                    <Pagination className="justify-center">
                      {safePage > 1 ? (
                        <PaginationPrevious onClick={() => setCurrentPage(safePage - 1)}>
                          <ChevronLeft className="mr-1 h-4 w-4" />
                          წინა
                        </PaginationPrevious>
                      ) : (
                        <PaginationPrevious isActive={false}>
                          <ChevronLeft className="mr-1 h-4 w-4" />
                          წინა
                        </PaginationPrevious>
                      )}

                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <PaginationItem key={page} className={`${page === safePage ? "bg-indigo-500 text-white" : ""} rounded-full list-none`}>
                          <PaginationLink
                            href="#"
                            onClick={(event) => {
                              event.preventDefault();
                              setCurrentPage(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      {safePage < totalPages ? (
                        <PaginationNext onClick={() => setCurrentPage(safePage + 1)}>
                          შემდეგი
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </PaginationNext>
                      ) : (
                        <PaginationNext isActive={false}>
                          შემდეგი
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </PaginationNext>
                      )}
                    </Pagination>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <OrderEditDialog
          open={Boolean(editingOrder)}
          onOpenChange={(open) => {
            if (!open) setEditingOrder(null);
          }}
          orderDetails={orderDetails}
          setOrderDetails={setOrderDetails}
          onSave={handleSave}
        />

        <OrderDetailsDialog
          open={Boolean(detailsOrder)}
          onOpenChange={(open) => {
            if (!open) setDetailsOrder(null);
          }}
          order={detailsOrder}
        />
      </AdminPageShell>
    </AppLayout>
  );
}
