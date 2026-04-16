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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toaster, toast } from "sonner";
import {
  BriefcaseBusiness,
  PencilLine,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [{ title: "ვაკანსიები", href: "/admin/vacancies" }];

type Vacancy = {
  id: number;
  title: string;
  description: string;
  work_condition?: {
    title?: string;
    description?: string;
  };
};

type VacancyFormValues = {
  title: string;
  description: string;
  work_condition: {
    title: string;
    description: string;
  };
};

type PageProps = {
  auth: {
    user?: {
      admin?: boolean;
    };
  };
  vacancies?: Vacancy[];
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
  tone?: "default" | "green" | "amber";
}) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700 border-amber-100"
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

function VacancyFormDialog({
  open,
  onOpenChange,
  mode,
  vacancyData,
  setVacancyData,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  vacancyData: VacancyFormValues;
  setVacancyData: React.Dispatch<React.SetStateAction<VacancyFormValues>>;
  onSave: () => void;
}) {
  const title = mode === "add" ? "ვაკანსიის დამატება" : "ვაკანსიის რედაქტირება";
  const description =
    mode === "add"
      ? "შეავსეთ ვაკანსიის მონაცემები dashboard-style მოდალში."
      : "განაახლეთ ვაკანსიის ინფორმაცია dashboard-style მოდალში.";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AdminAlertDialogFrame
        title={title}
        description={description}
        className="sm:max-w-2xl"
        footer={
          <>
            <AlertDialogCancel onClick={() => onOpenChange(false)}>
              გაუქმება
            </AlertDialogCancel>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={onSave}>
              {mode === "add" ? "დამატება" : "შენახვა"}
            </Button>
          </>
        }
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="vacancy-title">დასახელება</Label>
            <Input
              id="vacancy-title"
              value={vacancyData.title}
              onChange={(event) =>
                setVacancyData({ ...vacancyData, title: event.target.value })
              }
              className="h-11 rounded-xl border-slate-300 bg-white"
              placeholder="ვაკანსიის დასახელება"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacancy-description">აღწერა</Label>
            <textarea
              id="vacancy-description"
              value={vacancyData.description}
              onChange={(event) =>
                setVacancyData({ ...vacancyData, description: event.target.value })
              }
              className="min-h-32 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="ვაკანსიის აღწერა"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="work-title">სამუშაო პირობები</Label>
            <Input
              id="work-title"
              value={vacancyData.work_condition.title}
              onChange={(event) =>
                setVacancyData({
                  ...vacancyData,
                  work_condition: {
                    ...vacancyData.work_condition,
                    title: event.target.value,
                  },
                })
              }
              className="h-11 rounded-xl border-slate-300 bg-white"
              placeholder="სამუშაო პირობების სათაური"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="work-description">პირობების აღწერა</Label>
            <textarea
              id="work-description"
              value={vacancyData.work_condition.description}
              onChange={(event) =>
                setVacancyData({
                  ...vacancyData,
                  work_condition: {
                    ...vacancyData.work_condition,
                    description: event.target.value,
                  },
                })
              }
              className="min-h-32 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="სამუშაო პირობების აღწერა"
            />
          </div>
        </div>
      </AdminAlertDialogFrame>
    </AlertDialog>
  );
}

export default function Vacancies() {
  const { auth, vacancies: initialVacancies = [] } = usePage<PageProps>().props;
  const user = auth?.user;

  const [vacancies, setVacancies] = useState<Vacancy[]>(initialVacancies);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vacancy | null>(null);
  const [vacancyData, setVacancyData] = useState<VacancyFormValues>({
    title: "",
    description: "",
    work_condition: {
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!user?.admin) window.location.href = "/";
  }, [user]);

  const filteredVacancies = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return vacancies;
    return vacancies.filter((vacancy) =>
      `${vacancy.title} ${vacancy.description} ${vacancy.work_condition?.title || ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [search, vacancies]);

  const stats = {
    total: vacancies.length,
    withWorkConditions: vacancies.filter((vacancy) => Boolean(vacancy.work_condition?.title)).length,
  };

  const handleEdit = (vacancy: Vacancy) => {
    setEditingVacancy(vacancy);
    setVacancyData({
      title: vacancy.title || "",
      description: vacancy.description || "",
      work_condition: {
        title: vacancy.work_condition?.title || "",
        description: vacancy.work_condition?.description || "",
      },
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingVacancy(null);
    setVacancyData({
      title: "",
      description: "",
      work_condition: {
        title: "",
        description: "",
      },
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!vacancyData.title || !vacancyData.description) {
      toast.error("გთხოვთ, შეავსოთ აუცილებელი ველები.");
      return;
    }

    const action = editingVacancy
      ? axios.put(`/admin/vacancies/${editingVacancy.id}`, vacancyData)
      : axios.post("/admin/vacancies", {
          title: vacancyData.title,
          description: vacancyData.description,
          work_condition: vacancyData.work_condition,
        });

    action
      .then((response) => {
        const updated = response.data.vacancy;
        const message = response.data.message || "ვაკანსია წარმატებით განახლდა.";

        setVacancies((previous) =>
          editingVacancy
            ? previous.map((vacancy) => (vacancy.id === updated.id ? updated : vacancy))
            : [updated, ...previous],
        );
        setDialogOpen(false);
        setEditingVacancy(null);
        toast.success(message);
      })
      .catch((error) => {
        console.error("Error saving vacancy:", error);
        toast.error("ვაკანსიის შენახვა ვერ მოხერხდა.");
      });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    axios
      .delete(`/admin/vacancies/${deleteTarget.id}`)
      .then((response) => {
        const message = response.data.message || "ვაკანსია წაიშალა.";
        setVacancies((previous) => previous.filter((vacancy) => vacancy.id !== deleteTarget.id));
        setDeleteTarget(null);
        toast.success(message);
      })
      .catch((error) => {
        console.error("Error deleting vacancy:", error);
        toast.error("ვაკანსიის წაშლა ვერ მოხერხდა.");
      });
  };

  if (!user || !user.admin) return null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="ვაკანსიები" />
      <Toaster richColors position="top-right" />

      <AdminPageShell
        badge="ვაკანსიების მართვა"
        title="ვაკანსიები"
        description="დაამატეთ, შეცვალეთ და წაშალეთ ვაკანსიები იმავე dashboard-style დიზაინით, როგორც დანარჩენი ადმინისტრაციული პანელი."
        actions={
          <a href="/dashboard">
            <Button variant="secondary" className="bg-white text-slate-950 hover:bg-slate-100">
              მთავარ გვერდზე დაბრუნება
            </Button>
          </a>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard
              title="სულ ვაკანსიები"
              value={stats.total}
              icon={<BriefcaseBusiness className="h-6 w-6" />}
            />
            <StatCard
              title="შეავსებული პირობები"
              value={stats.withWorkConditions}
              icon={<ShieldCheck className="h-6 w-6" />}
              tone="green"
            />
          </div>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">ძიება და მოქმედებები</CardTitle>
                  <CardDescription>მოძებნეთ ვაკანსია სახელით ან აღწერით და შექმენით ახალი ჩანაწერი.</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  ნაპოვნია {filteredVacancies.length} შედეგი
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>ძიება</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="დასახელება ან აღწერა"
                    className="h-11 rounded-xl border-slate-300 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>ახალი ჩანაწერი</Label>
                <Button onClick={openCreate} className="h-11 w-full rounded-xl">
                  <Plus className="mr-2 h-4 w-4" />
                  ვაკანსიის დამატება
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">ვაკანსიების სია</CardTitle>
                  <CardDescription>რედაქტირება და წაშლა dashboard-ის სტილში გაფორმებულ ცხრილში.</CardDescription>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  სულ {vacancies.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {filteredVacancies.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="font-semibold text-slate-700">დასახელება</TableHead>
                        <TableHead className="font-semibold text-slate-700">აღწერა</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">მოქმედებები</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVacancies.map((vacancy) => (
                        <TableRow key={vacancy.id} className="hover:bg-slate-50/70">
                          <TableCell className="font-medium text-slate-900">{vacancy.title}</TableCell>
                          <TableCell className="max-w-[420px] truncate text-slate-600">
                            {vacancy.description}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(vacancy)}
                                className="rounded-xl"
                              >
                                <PencilLine className="mr-1 h-4 w-4" />
                                რედაქტირება
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteTarget(vacancy)}
                                className="rounded-xl"
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                წაშლა
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <BriefcaseBusiness className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="text-lg font-semibold text-slate-900">ვაკანსია ვერ მოიძებნა</div>
                  <p className="mt-1 text-sm text-slate-500">სცადეთ სხვა საძიებო სიტყვა ან დაამატეთ ახალი ვაკანსია.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <VacancyFormDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingVacancy(null);
          }}
          mode={editingVacancy ? "edit" : "add"}
          vacancyData={vacancyData}
          setVacancyData={setVacancyData}
          onSave={handleSave}
        />

        <AlertDialog
          open={Boolean(deleteTarget)}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <AdminAlertDialogFrame
            title="ვაკანსიის წაშლა"
            description="ეს მოქმედება სამუდამოდ წაშლის შერჩეულ ვაკანსიას."
            className="sm:max-w-lg"
            footer={
              <>
                <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
                  გაუქმება
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  წაშლა
                </AlertDialogAction>
              </>
            }
          >
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                წაშლა შეეხებათ:
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {deleteTarget?.title || "ეს ვაკანსია"}
              </p>
            </div>
          </AdminAlertDialogFrame>
        </AlertDialog>
      </AdminPageShell>
    </AppLayout>
  );
}
