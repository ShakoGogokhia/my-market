import { Head, useForm, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  BadgePercent,
  ClipboardList,
  DollarSign,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [{ title: "პრომოკოდები", href: "/admin/promocodes" }];

type User = {
  id: number;
  name: string;
};

type Credit = {
  credited_amount?: number | string;
};

type Promo = {
  id: number;
  code: string;
  owner_user_id: number;
  discount_percent: number | string;
  owner_credit_percent: number | string;
  used?: boolean;
  created_at: string;
  credits?: Credit[];
};

type PageProps = {
  auth: {
    user?: {
      admin?: boolean;
    };
  };
  users?: User[];
  promocodes?: Promo[];
};

type GroupedPromos = Record<
  number,
  {
    ownerName: string;
    months: Record<
      string,
      {
        totalCredit: number;
        promos: (Promo & { totalCreditsForPromo: number })[];
      }
    >;
  }
>;

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

export default function Promocodes() {
  const { auth, users = [], promocodes = [] } = usePage<PageProps>().props;
  const user = auth?.user;

  const [promos, setPromos] = useState(promocodes);
  const [genCount, setGenCount] = useState(1);
  const [genOwner, setGenOwner] = useState("");
  const [genDiscount, setGenDiscount] = useState(5);
  const [genOwnerCredit, setGenOwnerCredit] = useState(5);
  const [genLoading, setGenLoading] = useState(false);

  const { data, setData, post, reset, errors } = useForm({
    code: "",
    owner_user_id: "",
    discount_percent: "",
    owner_credit_percent: "",
  });

  useEffect(() => {
    if (!user?.admin) window.location.href = "/";
  }, [user]);

  useEffect(() => {
    setPromos(promocodes);
  }, [promocodes]);

  const loadPromos = async () => {
    try {
      const response = await axios.get("/promo-codes");
      setPromos(response.data || []);
    } catch {
      toast.error("პრომოკოდების ჩატვირთვა ვერ მოხერხდა.");
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    post("/promo-codes", {
      onSuccess: (page) => {
        toast.success("პრომოკოდი წარმატებით დაემატა.");
        reset();
        setPromos((page.props as PageProps).promocodes || []);
      },
      onError: () => toast.error("პრომოკოდის დამატება ვერ მოხერხდა."),
    });
  };

  const deletePromo = (id: number) => {
    if (!confirm("წავშალოთ ეს პრომოკოდი?")) return;

    axios
      .delete(`/promo-codes/${id}`)
      .then(() => {
        setPromos((previous) => previous.filter((promo) => promo.id !== id));
        toast.success("პრომოკოდი წაიშალა.");
      })
      .catch(() => toast.error("პრომოკოდის წაშლა ვერ მოხერხდა."));
  };

  const randomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = Math.floor(Math.random() * 11) + 5;
    return Array.from({ length })
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join("");
  };

  const handleGenerate = () => {
    if (genCount < 1 || genCount > 100) {
      toast.warning("რაოდენობა უნდა იყოს 1-დან 100-მდე.");
      return;
    }

    if (!genOwner) {
      toast.warning("გთხოვთ, აირჩიოთ მფლობელი.");
      return;
    }

    setGenLoading(true);

    const codes = Array.from({ length: genCount }).map(() => ({
      code: randomCode(),
      owner_user_id: genOwner,
      discount_percent: genDiscount,
      owner_credit_percent: genOwnerCredit,
    }));

    axios
      .post("/promo-codes/bulk", { codes })
      .then((response) => {
        toast.success(`შეიქმნა ${response.data.count} კოდი.`);
        loadPromos();
        setGenCount(1);
        setGenOwner("");
      })
      .catch((error) => {
        console.error(error);
        toast.error(error.response?.data?.message || "გენერაცია ვერ მოხერხდა.");
      })
      .finally(() => setGenLoading(false));
  };

  const groupedByOwner = useMemo<GroupedPromos>(() => {
    const grouped: GroupedPromos = {};

    promos.forEach((promo) => {
      const ownerId = promo.owner_user_id;
      const ownerName = users.find((currentUser) => currentUser.id === ownerId)?.name || "Unknown Owner";
      const date = new Date(promo.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const totalCreditsForPromo = (promo.credits || []).reduce(
        (sum, credit) => sum + Number(credit.credited_amount || 0),
        0,
      );

      if (!grouped[ownerId]) {
        grouped[ownerId] = { ownerName, months: {} };
      }

      if (!grouped[ownerId].months[monthKey]) {
        grouped[ownerId].months[monthKey] = {
          totalCredit: 0,
          promos: [],
        };
      }

      grouped[ownerId].months[monthKey].totalCredit += totalCreditsForPromo;
      grouped[ownerId].months[monthKey].promos.push({
        ...promo,
        totalCreditsForPromo,
      });
    });

    return grouped;
  }, [promos, users]);

  const stats = {
    total: promos.length,
    owners: Object.keys(groupedByOwner).length,
    used: promos.filter((promo) => promo.used).length,
    credits: promos.reduce(
      (sum, promo) =>
        sum +
        (promo.credits || []).reduce((creditSum, credit) => creditSum + Number(credit.credited_amount || 0), 0),
      0,
    ),
  };

  if (!user || !user.admin) return null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="პრომოკოდები" />
      <Toaster richColors position="top-right" />

      <AdminPageShell
        badge="პრომოკოდების მართვა"
        title="პრომოკოდები"
        description="დაამატეთ, გაანაწილეთ და მართეთ პრომოკოდები იმავე dashboard-style ვიზუალით, როგორც დანარჩენი ადმინისტრაციული პანელი."
        actions={
          <a href="/dashboard">
            <Button variant="secondary" className="bg-white text-slate-950 hover:bg-slate-100">
              მთავარ გვერდზე დაბრუნება
            </Button>
          </a>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="სულ კოდები" value={stats.total} icon={<BadgePercent className="h-6 w-6" />} />
            <StatCard title="მფლობელები" value={stats.owners} icon={<Users className="h-6 w-6" />} tone="sky" />
            <StatCard title="გამოყენებული" value={stats.used} icon={<ShieldCheck className="h-6 w-6" />} tone="green" />
            <StatCard title="ჯამური კრედიტი" value={stats.credits.toFixed(2)} icon={<DollarSign className="h-6 w-6" />} tone="amber" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.05fr_1.1fr]">
            <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">პრომოკოდის დამატება</CardTitle>
                <CardDescription>შექმენით ერთეული პრომოკოდი და მიანიჭეთ კონკრეტულ მომხმარებელს.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>კოდი</Label>
                    <Input
                      value={data.code}
                      onChange={(event) => setData("code", event.target.value)}
                      className="h-11 rounded-xl border-slate-300"
                      placeholder="მაგ: SUMMER2026"
                    />
                    {errors.code ? <p className="text-sm font-medium text-red-500">{errors.code}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label>მფლობელი</Label>
                    <select
                      value={data.owner_user_id}
                      onChange={(event) => setData("owner_user_id", event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">აირჩიეთ მფლობელი</option>
                      {users.map((currentUser) => (
                        <option key={currentUser.id} value={currentUser.id}>
                          {currentUser.name}
                        </option>
                      ))}
                    </select>
                    {errors.owner_user_id ? (
                      <p className="text-sm font-medium text-red-500">{errors.owner_user_id}</p>
                    ) : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>ფასდაკლება %</Label>
                      <Input
                        type="number"
                        value={data.discount_percent}
                        onChange={(event) => setData("discount_percent", event.target.value)}
                        className="h-11 rounded-xl border-slate-300"
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>მფლობელის კრედიტი %</Label>
                      <Input
                        type="number"
                        value={data.owner_credit_percent}
                        onChange={(event) => setData("owner_credit_percent", event.target.value)}
                        className="h-11 rounded-xl border-slate-300"
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    დამატება
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">მასობრივი გენერაცია</CardTitle>
                <CardDescription>შექმენით რამდენიმე პრომოკოდი ერთდროულად, იგივე დიზაინის გამოყენებით.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>რაოდენობა (1-100)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={genCount}
                      onChange={(event) => setGenCount(Number(event.target.value))}
                      className="h-11 rounded-xl border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>მფლობელი</Label>
                    <select
                      value={genOwner}
                      onChange={(event) => setGenOwner(event.target.value)}
                      className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">აირჩიეთ მფლობელი</option>
                      {users.map((currentUser) => (
                        <option key={currentUser.id} value={currentUser.id}>
                          {currentUser.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>ფასდაკლება %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={genDiscount}
                      onChange={(event) => setGenDiscount(Number(event.target.value))}
                      className="h-11 rounded-xl border-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>კრედიტი %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={genOwnerCredit}
                      onChange={(event) => setGenOwnerCredit(Number(event.target.value))}
                      className="h-11 rounded-xl border-slate-300"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Loader2 className={`h-4 w-4 ${genLoading ? "animate-spin" : ""} text-slate-600`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">გენერაცია მზად არის</p>
                      <p className="text-sm text-slate-500">მაქსიმუმ 100 კოდი ერთდროულად.</p>
                    </div>
                  </div>
                  <Button onClick={handleGenerate} disabled={genLoading} className="rounded-xl">
                    {genLoading ? "გენერირდება..." : "გენერირება"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">ძებნა და ანალიზი</CardTitle>
                  <CardDescription>გადახედეთ პრომოკოდებს მფლობელისა და თვის მიხედვით დაჯგუფებულად.</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  ჯგუფები: {Object.keys(groupedByOwner).length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                <div className="flex flex-wrap items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-slate-500" />
                  <span>ჯამური კრედიტები და გამოყენება ავტომატურად ითვლება მოცემული პრომოკოდების მიხედვით.</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">არსებული პრომოკოდები</CardTitle>
                  <CardDescription>დაჯგუფებულია მფლობელებისა და თვეების მიხედვით.</CardDescription>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  სულ {promos.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.keys(groupedByOwner).length > 0 ? (
                Object.entries(groupedByOwner).map(([ownerId, ownerGroup]) => (
                  <div key={ownerId} className="overflow-hidden rounded-3xl border border-slate-200">
                    <div className="border-b border-slate-200 bg-slate-950 px-6 py-5 text-white">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-lg font-semibold">{ownerGroup.ownerName}</p>
                            <p className="text-sm text-slate-300">მფლობელის პრომოკოდები</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 bg-white p-4 md:p-6">
                      {Object.entries(ownerGroup.months).map(([month, monthGroup]) => (
                        <div key={month} className="overflow-hidden rounded-2xl border border-slate-200">
                          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
                            <div className="font-semibold text-slate-900">{month}</div>
                            <Badge className="rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100">
                              ჯამური კრედიტი: {monthGroup.totalCredit.toFixed(2)} ₾
                            </Badge>
                          </div>

                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                  <TableHead className="font-semibold text-slate-700">კოდი</TableHead>
                                  <TableHead className="font-semibold text-slate-700">ფასდაკლება</TableHead>
                                  <TableHead className="font-semibold text-slate-700">კრედიტი</TableHead>
                                  <TableHead className="font-semibold text-slate-700">ჯამური კრედიტი</TableHead>
                                  <TableHead className="text-right font-semibold text-slate-700">მოქმედება</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {monthGroup.promos.map((promo) => (
                                  <TableRow key={promo.id} className={promo.used ? "opacity-50" : "hover:bg-slate-50/70"}>
                                    <TableCell className="font-medium text-slate-900">{promo.code}</TableCell>
                                    <TableCell>{promo.discount_percent}%</TableCell>
                                    <TableCell>{promo.owner_credit_percent}%</TableCell>
                                    <TableCell>{Number(promo.totalCreditsForPromo).toFixed(2)} ₾</TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deletePromo(promo.id)}
                                        className="rounded-xl"
                                      >
                                        <Trash2 className="mr-1 h-4 w-4" />
                                        წაშლა
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <BadgePercent className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="text-lg font-semibold text-slate-900">პრომოკოდები ვერ მოიძებნა</div>
                  <p className="mt-1 text-sm text-slate-500">დაამატეთ ახალი კოდი ან გენერირეთ რამდენიმე ერთდროულად.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />
        </div>
      </AdminPageShell>
    </AppLayout>
  );
}
