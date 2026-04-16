import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { AdminAlertDialogFrame } from "@/components/admin/admin-alert-dialog-frame";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Toaster, toast } from "sonner";
import { Users as UsersIcon, ShieldCheck, UserRound, Search, PencilLine } from "lucide-react";

const breadcrumbs: BreadcrumbItem[] = [{ title: "მომხმარებლები", href: "/Users" }];

type AdminUser = {
  id: number;
  admin: boolean;
  address?: string | null;
  contact_person?: string | null;
  email: string;
  mobile_number?: string | null;
  name: string;
  organization_identification_code?: string | null;
  organization_location?: string | null;
  registration_type?: string | null;
};

type PageProps = {
  auth: {
    user?: {
      admin?: boolean;
    };
  };
  users?: AdminUser[];
};

type UserDetails = Partial<AdminUser>;

function StatCard({
  title,
  value,
  icon,
  tone = "default",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  tone?: "default" | "green" | "sky";
}) {
  const toneClass =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
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

function UserEditDialog({
  open,
  onOpenChange,
  userDetails,
  setUserDetails,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userDetails: UserDetails;
  setUserDetails: Dispatch<SetStateAction<UserDetails>>;
  onSave: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AdminAlertDialogFrame
        title="მომხმარებლის რედაქტირება"
        description="განაახლეთ მომხმარებლის მონაცემები dashboard-ის სტილში გაფორმებულ მოდალში."
        className="sm:max-w-2xl"
        footer={
          <>
            <AlertDialogCancel onClick={() => onOpenChange(false)}>
              გაუქმება
            </AlertDialogCancel>
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={onSave}>
              შენახვა
            </Button>
          </>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="user-name">სახელი</Label>
            <Input
              id="user-name"
              value={userDetails.name || ""}
              onChange={(event) =>
                setUserDetails({ ...userDetails, name: event.target.value })
              }
              className="h-11 rounded-xl border-slate-300 bg-white"
              placeholder="სახელი"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-email">ელფოსტა</Label>
            <Input
              id="user-email"
              value={userDetails.email || ""}
              onChange={(event) =>
                setUserDetails({ ...userDetails, email: event.target.value })
              }
              className="h-11 rounded-xl border-slate-300 bg-white"
              placeholder="ელფოსტა"
            />
          </div>

          <label className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={userDetails.admin || false}
              onChange={(event) =>
                setUserDetails({
                  ...userDetails,
                  admin: event.target.checked,
                })
              }
            />
            ადმინისტრატორი
          </label>

          <div className="space-y-2">
            <Label htmlFor="user-phone">ტელეფონი</Label>
            <Input
              id="user-phone"
              value={userDetails.mobile_number || ""}
              onChange={(event) =>
                setUserDetails({
                  ...userDetails,
                  mobile_number: event.target.value,
                })
              }
              className="h-11 rounded-xl border-slate-300 bg-white"
              placeholder="ტელეფონის ნომერი"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-code">ორგანიზაციის კოდი</Label>
            <Input
              id="user-code"
              value={userDetails.organization_identification_code || ""}
              onChange={(event) =>
                setUserDetails({
                  ...userDetails,
                  organization_identification_code: event.target.value,
                })
              }
              className="h-11 rounded-xl border-slate-300 bg-white"
              placeholder="ორგანიზაციის კოდი"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-contact">საკონტაქტო პირი</Label>
            <Input
              id="user-contact"
              value={userDetails.contact_person || ""}
              onChange={(event) =>
                setUserDetails({
                  ...userDetails,
                  contact_person: event.target.value,
                })
              }
              className="h-11 rounded-xl border-slate-300 bg-white"
              placeholder="საკონტაქტო პირი"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-location">ლოკაცია</Label>
            <Input
              id="user-location"
              value={userDetails.organization_location || ""}
              onChange={(event) =>
                setUserDetails({
                  ...userDetails,
                  organization_location: event.target.value,
                })
              }
              className="h-11 rounded-xl border-slate-300 bg-white"
              placeholder="ორგანიზაციის მდებარეობა"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-registration">რეგისტრაციის ტიპი</Label>
            <Input
              id="user-registration"
              value={userDetails.registration_type || ""}
              onChange={(event) =>
                setUserDetails({
                  ...userDetails,
                  registration_type: event.target.value,
                })
              }
              className="h-11 rounded-xl border-slate-300 bg-white"
              placeholder="რეგისტრაციის ტიპი"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="user-address">მისამართი</Label>
            <Input
              id="user-address"
              value={userDetails.address || ""}
              onChange={(event) =>
                setUserDetails({
                  ...userDetails,
                  address: event.target.value,
                })
              }
              className="h-11 rounded-xl border-slate-300 bg-white"
              placeholder="მისამართი"
            />
          </div>
        </div>
      </AdminAlertDialogFrame>
    </AlertDialog>
  );
}

export default function Users() {
  const { auth, users: initialUsers = [] } = usePage<PageProps>().props;
  const user = auth?.user;

  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "staff">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails>({});

  useEffect(() => {
    if (!user?.admin) window.location.href = "/";
  }, [user]);

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();

    return users.filter((currentUser) => {
      const matchesSearch =
        currentUser.name.toLowerCase().includes(query) ||
        currentUser.email.toLowerCase().includes(query);

      const matchesRole =
        filterRole === "all" ||
        (filterRole === "admin" && currentUser.admin) ||
        (filterRole === "staff" && !currentUser.admin);

      return matchesSearch && matchesRole;
    });
  }, [users, search, filterRole]);

  const stats = {
    total: users.length,
    admins: users.filter((currentUser) => currentUser.admin).length,
    staff: users.filter((currentUser) => !currentUser.admin).length,
  };

  const handleEdit = (selectedUser: AdminUser) => {
    setEditingUser(selectedUser);
    setUserDetails({ ...selectedUser });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingUser) return;

    axios
      .put(`/users/${editingUser.id}`, userDetails)
      .then((response) => {
        const updatedUser = response.data.user;
        const message = response.data.message || "მომხმარებელი განახლდა.";

        setUsers((previous) =>
          previous.map((currentUser) =>
            currentUser.id === updatedUser.id ? updatedUser : currentUser,
          ),
        );
        setDialogOpen(false);
        setEditingUser(null);
        toast.success(message);
      })
      .catch((error) => {
        if (
          error.response?.status === 500 &&
          error.response?.data?.message?.includes("Integrity constraint violation")
        ) {
          toast.error("ელფოსტა უკვე არსებობს.");
        } else {
          toast.error("მომხმარებლის განახლება ვერ მოხერხდა.");
        }
      });
  };

  if (!user || !user.admin) return null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="მომხმარებლები" />
      <Toaster richColors position="top-right" />

      <AdminPageShell
        badge="მომხმარებლების მართვა"
        title="მომხმარებლები"
        description="დაათვალიერეთ, გაფილტრეთ და დაარედაქტირეთ მომხმარებლები dashboard-ის სტილში გაფორმებულ ადმინისტრაციულ პანელში."
        actions={
          <a href="/dashboard">
            <Button variant="secondary" className="bg-white text-slate-950 hover:bg-slate-100">
              მთავარ გვერდზე დაბრუნება
            </Button>
          </a>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard title="სულ მომხმარებლები" value={stats.total} icon={<UsersIcon className="h-6 w-6" />} />
            <StatCard title="ადმინისტრატორები" value={stats.admins} icon={<ShieldCheck className="h-6 w-6" />} tone="green" />
            <StatCard title="სტაფი" value={stats.staff} icon={<UserRound className="h-6 w-6" />} tone="sky" />
          </div>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">ძიება და ფილტრები</CardTitle>
                  <CardDescription>მოძებნეთ მომხმარებელი სახელით ან ელფოსტით და შეამცირეთ სია როლით.</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  ნაპოვნია {filteredUsers.length} შედეგი
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
                    placeholder="სახელი ან ელფოსტა"
                    className="h-11 rounded-xl border-slate-300 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>როლი</Label>
                <Select
                  value={filterRole}
                  onValueChange={(value) => setFilterRole(value as "all" | "admin" | "staff")}
                >
                  <SelectTrigger className="h-11 rounded-xl border-slate-300">
                    <SelectValue placeholder="როლით ფილტრაცია" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ყველა</SelectItem>
                    <SelectItem value="admin">ადმინისტრატორები</SelectItem>
                    <SelectItem value="staff">სტაფი</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">მომხმარებლების სია</CardTitle>
                  <CardDescription>დააწკაპეთ რედაქტირებაზე, რომ გახსნათ dashboard-style modal.</CardDescription>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  სულ {users.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {filteredUsers.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="font-semibold text-slate-700">სახელი</TableHead>
                        <TableHead className="font-semibold text-slate-700">ელფოსტა</TableHead>
                        <TableHead className="font-semibold text-slate-700">როლი</TableHead>
                        <TableHead className="font-semibold text-slate-700">ტელეფონი</TableHead>
                        <TableHead className="font-semibold text-slate-700">ორგანიზაცია</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">მოქმედებები</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredUsers.map((currentUser) => (
                        <TableRow key={currentUser.id} className="hover:bg-slate-50/70">
                          <TableCell className="font-medium text-slate-900">{currentUser.name}</TableCell>
                          <TableCell>{currentUser.email}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                currentUser.admin
                                  ? "rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                  : "rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100"
                              }
                            >
                              {currentUser.admin ? "ადმინისტრატორი" : "სტაფი"}
                            </Badge>
                          </TableCell>
                          <TableCell>{currentUser.mobile_number || "N/A"}</TableCell>
                          <TableCell>{currentUser.organization_location || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(currentUser)}
                              className="rounded-xl"
                            >
                              <PencilLine className="mr-1 h-4 w-4" />
                              რედაქტირება
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <UsersIcon className="h-6 w-6 text-slate-500" />
                  </div>
                  <div className="text-lg font-semibold text-slate-900">მომხმარებელი ვერ მოიძებნა</div>
                  <p className="mt-1 text-sm text-slate-500">სცადეთ სხვა საძიებო სიტყვა ან როლის ფილტრი.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <UserEditDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingUser(null);
          }}
          userDetails={userDetails}
          setUserDetails={setUserDetails}
          onSave={handleSave}
        />
      </AdminPageShell>
    </AppLayout>
  );
}
