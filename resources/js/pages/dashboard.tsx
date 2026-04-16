import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { cn } from "@/lib/utils";
import { toast, Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Boxes,
  Eye,
  EyeOff,
  FolderPlus,
  ImagePlus,
  Layers3,
  Package2,
  PencilLine,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X,
  DollarSign,
  RefreshCcw,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type User = { id: number; name: string; email: string; admin: boolean };
type ProductSpec = { key: string; value: string };
type ProductImage = { url: string; is_primary?: boolean };
type Product = {
  id: number;
  name: string;
  code?: string | null;
  price: number | string;
  new_price?: number | string | null;
  cost_price?: number | string | null;
  markup_percent?: number | string | null;
  description?: string | null;
  in_stock: number | string;
  brand?: string | null;
  image?: string | null;
  images?: Array<string | ProductImage>;
  visible: boolean | number;
  category?: string | null;
  warranty?: string | null;
  specifications?: ProductSpec[];
};

type PageProps = { auth: { user?: User } };

type ProductFormValues = {
  name: string;
  code: string;
  price: string;
  new_price: string;
  cost_price: string;
  markup_percent: string;
  in_stock: string;
  brand: string;
  category: string;
  warranty: string;
  description: string;
  visible: boolean;
};

type ValidationErrors = Partial<Record<keyof ProductFormValues | "images" | "specifications", string[]>>;

const breadcrumbs: BreadcrumbItem[] = [{ title: "მთავარი გვერდი", href: "/dashboard" }];

const emptyForm: ProductFormValues = {
  name: "",
  code: "",
  price: "",
  new_price: "",
  cost_price: "",
  markup_percent: "18",
  in_stock: "0",
  brand: "",
  category: "",
  warranty: "",
  description: "",
  visible: true,
};

const emptySpecs: ProductSpec[] = [{ key: "", value: "" }];

const money = (value: number | string) => {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? new Intl.NumberFormat("ka-GE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numeric)
    : "0.00";
};

const toNumber = (value: string) => Number(value);

const normalizeCategories = (categories: string[]) =>
  Array.from(
    new Set(
      categories
        .map((category) => category.trim())
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

const previewImages = (product: Product) => {
  const fromImages = (product.images || [])
    .map((item) => (typeof item === "string" ? item : item.url))
    .filter(Boolean) as string[];

  return fromImages.length > 0 ? fromImages : product.image ? [product.image] : [];
};

const cleanSpecs = (specs: ProductSpec[]) =>
  specs.map((spec) => ({ key: spec.key.trim(), value: spec.value.trim() })).filter((spec) => spec.key && spec.value);

function validate(values: ProductFormValues, fileCount: number, existingCount: number) {
  const errors: ValidationErrors = {};
  const push = (field: keyof ValidationErrors, message: string) => {
    errors[field] = [...(errors[field] || []), message];
  };

  if (values.name.trim().length < 2) push("name", "პროდუქტის სახელი მინიმუმ 2 სიმბოლო უნდა იყოს.");
  if (values.code.trim().length > 100) push("code", "კოდი 100 სიმბოლოზე მეტი ვერ იქნება.");

  const price = toNumber(values.price);
  if (!Number.isFinite(price) || price < 0) push("price", "შეიყვანეთ სწორი ფასი.");

  if (values.new_price.trim()) {
    const sale = toNumber(values.new_price);
    if (!Number.isFinite(sale) || sale < 0) push("new_price", "შეიყვანეთ სწორი ფასდაკლებული ფასი.");
    if (Number.isFinite(price) && sale > price) push("new_price", "ფასდაკლებული ფასი ძირითად ფასზე მეტი ვერ იქნება.");
  }

  if (values.cost_price.trim()) {
    const cost = toNumber(values.cost_price);
    if (!Number.isFinite(cost) || cost < 0) push("cost_price", "შეიყვანეთ სწორი თვითღირებულება.");
  }

  const markup = toNumber(values.markup_percent);
  if (!Number.isFinite(markup) || markup < 0 || markup > 100) push("markup_percent", "მარჟა უნდა იყოს 0-სა და 100-ს შორის.");

  const stock = toNumber(values.in_stock);
  if (!Number.isInteger(stock) || stock < 0) push("in_stock", "მარაგი უნდა იყოს მთელი რიცხვი.");

  if (values.brand.trim().length < 2) push("brand", "ბრენდი სავალდებულოა.");
  if (values.category.trim().length < 2) push("category", "კატეგორია სავალდებულოა.");
  if (values.warranty.trim().length < 2) push("warranty", "გარანტია სავალდებულოა.");
  if (values.description.trim().length > 4000) push("description", "აღწერა ძალიან გრძელია.");
  if (fileCount + existingCount < 1) push("images", "მინიმუმ ერთი სურათი დაამატეთ.");

  return errors;
}

function ErrorText({ errors, field }: { errors: ValidationErrors; field: keyof ValidationErrors }) {
  const message = errors[field]?.[0];
  if (!message) return null;

  return <p className="text-sm font-medium text-red-500">{message}</p>;
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 shadow-sm">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}

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
          <div className={cn("rounded-2xl border p-3 shadow-sm", toneClass)}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryPicker({
  value,
  onChange,
  categories,
  onRequestCreate,
  placeholder = "აირჩიეთ კატეგორია",
}: {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  onRequestCreate: () => void;
  placeholder?: string;
}) {
  const normalizedCategories = normalizeCategories(value ? [...categories, value] : categories);
  const selectValue = value.trim() ? value : "__empty__";

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <Label className="text-sm font-semibold text-slate-700">კატეგორია</Label>
          <p className="text-xs text-slate-500">აირჩიეთ არსებული კატეგორია ან შექმენით ახალი აქედანვე.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRequestCreate}
          className="rounded-xl border-slate-300 bg-white hover:bg-slate-50"
        >
          <FolderPlus className="mr-1 h-4 w-4" />
          ახალი
        </Button>
      </div>

      <Select value={selectValue} onValueChange={(nextValue) => onChange(nextValue === "__empty__" ? "" : nextValue)}>
        <SelectTrigger className="h-11 rounded-xl border-slate-300 bg-white">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__empty__">აირჩიეთ კატეგორია</SelectItem>
          {normalizedCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CategoryCreateDialog({
  open,
  onOpenChange,
  name,
  setName,
  onCreate,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  onCreate: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-slate-200 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">კატეგორიის შექმნა</DialogTitle>
          <DialogDescription>შეიყვანეთ ახალი კატეგორიის სახელი და ის მაშინვე გამოჩნდება სიაში.</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onCreate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="category-name">კატეგორიის სახელი</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="მაგ: მზის აქსესუარები"
              autoFocus
              className="h-11 rounded-xl border-slate-300"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
              გაუქმება
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl">
              {loading ? "ინახება..." : "შექმნა"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProductDialog({
  open,
  onOpenChange,
  mode,
  values,
  setValues,
  images,
  setImages,
  existingImages,
  setExistingImages,
  specs,
  setSpecs,
  errors,
  categories,
  onRequestCreateCategory,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  values: ProductFormValues;
  setValues: Dispatch<SetStateAction<ProductFormValues>>;
  images: File[];
  setImages: Dispatch<SetStateAction<File[]>>;
  existingImages: string[];
  setExistingImages: Dispatch<SetStateAction<string[]>>;
  specs: ProductSpec[];
  setSpecs: Dispatch<SetStateAction<ProductSpec[]>>;
  errors: ValidationErrors;
  categories: string[];
  onRequestCreateCategory: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const title = mode === "add" ? "პროდუქტის დამატება" : "პროდუქტის რედაქტირება";
  const subtitle =
    mode === "add"
      ? "შეავსეთ აუცილებელი ველები, ატვირთეთ სურათები და შექმენით ახალი პროდუქტი."
      : "განაახლეთ პროდუქტის მონაცემები, სურათები და სპეციფიკაციები.";

  const updateSpec = (index: number, field: keyof ProductSpec, value: string) =>
    setSpecs(specs.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)));

  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));
  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const addFiles = (files: FileList | null) => setImages(files ? [...images, ...Array.from(files)] : images);
  const removeFile = (index: number) => setImages(images.filter((_, i) => i !== index));
  const removeExisting = (url: string) => setExistingImages(existingImages.filter((item) => item !== url));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[94vh] w-[96vw] max-w-[96rem] overflow-hidden rounded-[28px] border-slate-200 p-0 shadow-2xl">
        <div className="max-h-[94vh] overflow-y-auto">
          <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e293b_100%)] px-6 py-7 text-white md:px-8">
            <DialogHeader className="space-y-3 text-left">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                პროდუქტის მართვა
              </div>
              <DialogTitle className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</DialogTitle>
              <DialogDescription className="max-w-2xl text-sm leading-6 text-slate-300">{subtitle}</DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-6 bg-slate-50/70 px-6 py-6 md:px-8">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
              }}
              className="space-y-6"
            >
              <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
                <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-4">
                    <SectionTitle
                      icon={<Package2 className="h-5 w-5" />}
                      title="ძირითადი ინფორმაცია"
                      subtitle="პროდუქტის მთავარი მონაცემები, რომლებიც კატალოგში გამოჩნდება."
                    />
                  </CardHeader>

                  <CardContent className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label>პროდუქტის სახელი</Label>
                      <Input
                        value={values.name}
                        onChange={(e) => setValues({ ...values, name: e.target.value })}
                        placeholder="მაგ: Solar Power Station 1200W"
                        className="h-11 rounded-xl border-slate-300 bg-white"
                      />
                      <ErrorText errors={errors} field="name" />
                    </div>

                    <div className="space-y-2">
                      <Label>პროდუქტის კოდი</Label>
                      <Input
                        value={values.code}
                        onChange={(e) => setValues({ ...values, code: e.target.value })}
                        placeholder="SKU-1234"
                        className="h-11 rounded-xl border-slate-300 bg-white"
                      />
                      <ErrorText errors={errors} field="code" />
                    </div>

                    <div className="space-y-2">
                      <Label>ბრენდი</Label>
                      <Input
                        value={values.brand}
                        onChange={(e) => setValues({ ...values, brand: e.target.value })}
                        placeholder="ბრენდის სახელი"
                        className="h-11 rounded-xl border-slate-300 bg-white"
                      />
                      <ErrorText errors={errors} field="brand" />
                    </div>

                    <div className="space-y-2">
                      <Label>კატეგორია</Label>
                      <CategoryPicker
                        value={values.category}
                        onChange={(category) => setValues({ ...values, category })}
                        categories={categories}
                        onRequestCreate={onRequestCreateCategory}
                        placeholder="აირჩიეთ ან შექმენით კატეგორია"
                      />
                      <ErrorText errors={errors} field="category" />
                    </div>

                    <div className="space-y-2">
                      <Label>გარანტია</Label>
                      <Input
                        value={values.warranty}
                        onChange={(e) => setValues({ ...values, warranty: e.target.value })}
                        placeholder="მაგ: 12 თვე"
                        className="h-11 rounded-xl border-slate-300 bg-white"
                      />
                      <ErrorText errors={errors} field="warranty" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>აღწერა</Label>
                      <Textarea
                        rows={6}
                        value={values.description}
                        onChange={(e) => setValues({ ...values, description: e.target.value })}
                        placeholder="აღწერეთ პროდუქტი, მისი ფუნქციები და მთავარი უპირატესობები."
                        className="min-h-[130px] rounded-2xl border-slate-300 bg-white"
                      />
                      <ErrorText errors={errors} field="description" />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                    <CardHeader className="pb-4">
                      <SectionTitle
                        icon={<DollarSign className="h-5 w-5" />}
                        title="ფასი და მარაგი"
                        subtitle="ფინანსური და მარაგის მონაცემები ერთ ბლოკში."
                      />
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>ფასი</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={values.price}
                            onChange={(e) => setValues({ ...values, price: e.target.value })}
                            placeholder="0.00"
                            className="h-11 rounded-xl border-slate-300"
                          />
                          <ErrorText errors={errors} field="price" />
                        </div>

                        <div className="space-y-2">
                          <Label>ფასდაკლებული ფასი</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={values.new_price}
                            onChange={(e) => setValues({ ...values, new_price: e.target.value })}
                            placeholder="არასავალდებულო"
                            className="h-11 rounded-xl border-slate-300"
                          />
                          <ErrorText errors={errors} field="new_price" />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>თვითღირებულება</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={values.cost_price}
                            onChange={(e) => setValues({ ...values, cost_price: e.target.value })}
                            placeholder="არასავალდებულო"
                            className="h-11 rounded-xl border-slate-300"
                          />
                          <ErrorText errors={errors} field="cost_price" />
                        </div>

                        <div className="space-y-2">
                          <Label>მარჟა %</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={values.markup_percent}
                            onChange={(e) => setValues({ ...values, markup_percent: e.target.value })}
                            placeholder="18"
                            className="h-11 rounded-xl border-slate-300"
                          />
                          <ErrorText errors={errors} field="markup_percent" />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>მარაგი</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={values.in_stock}
                            onChange={(e) => setValues({ ...values, in_stock: e.target.value })}
                            placeholder="0"
                            className="h-11 rounded-xl border-slate-300"
                          />
                          <ErrorText errors={errors} field="in_stock" />
                        </div>

                        <div className="space-y-2">
                          <Label>ხილვადობა</Label>
                          <button
                            type="button"
                            onClick={() => setValues({ ...values, visible: !values.visible })}
                            className={cn(
                              "flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-medium transition",
                              values.visible
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-300 bg-slate-50 text-slate-600",
                            )}
                          >
                            <span>{values.visible ? "ხილული" : "დამალული"}</span>
                            {values.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                    <CardHeader className="pb-4">
                      <SectionTitle
                        icon={<ImagePlus className="h-5 w-5" />}
                        title="მედია"
                        subtitle="ატვირთეთ, ნახეთ და მართეთ პროდუქტის სურათები."
                      />
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <label
                        htmlFor={`${mode}-images`}
                        className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-9 text-center transition hover:border-slate-400 hover:bg-slate-100"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                          <Upload className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-800">ჩააგდეთ სურათები აქ ან დააჭირეთ ასატვირთად</p>
                          <p className="text-xs text-slate-500">PNG, JPG, WEBP • თითოეული მაქსიმუმ 10 MB</p>
                        </div>
                      </label>

                      <Input
                        id={`${mode}-images`}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => addFiles(e.target.files)}
                      />
                      <ErrorText errors={errors} field="images" />

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {existingImages.map((url) => (
                          <div key={url} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <img src={url} alt="Existing product" className="h-28 w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeExisting(url)}
                              className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}

                        {images.map((file, index) => (
                          <div
                            key={`${file.name}-${file.lastModified}`}
                            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                          >
                            <div className="flex h-28 items-center justify-center px-3 text-center text-xs font-medium text-slate-500">
                              {file.name}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute right-2 top-2 rounded-full bg-black/55 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}

                        {existingImages.length === 0 && images.length === 0 ? (
                          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                            სურათი ჯერ არ არის არჩეული.
                          </div>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-4">
                  <SectionTitle
                    icon={<Boxes className="h-5 w-5" />}
                    title="სპეციფიკაციები"
                    subtitle="მაგალითად: ძაბვა, ტევადობა, ზომა, ფერი, მასალა."
                  />
                  <Button type="button" variant="outline" onClick={addSpec} className="rounded-xl border-slate-300 bg-white">
                    <Plus className="mr-1 h-4 w-4" />
                    დამატება
                  </Button>
                </CardHeader>

                <CardContent className="space-y-3">
                  {specs.map((spec, index) => (
                    <div key={`${mode}-spec-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <Input
                        value={spec.key}
                        onChange={(e) => updateSpec(index, "key", e.target.value)}
                        placeholder="სპეციფიკაციის სახელი"
                        className="h-11 rounded-xl border-slate-300"
                      />
                      <Input
                        value={spec.value}
                        onChange={(e) => updateSpec(index, "value", e.target.value)}
                        placeholder="სპეციფიკაციის მნიშვნელობა"
                        className="h-11 rounded-xl border-slate-300"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSpec(index)}
                        disabled={specs.length === 1}
                        className="h-11 w-11 rounded-xl border-slate-300"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <ErrorText errors={errors} field="specifications" />
                </CardContent>
              </Card>

              <DialogFooter className="sticky bottom-0 rounded-b-[28px] border-t border-slate-200 bg-white/90 px-0 py-4 backdrop-blur">
                <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-slate-500">
                    {mode === "add"
                      ? "ფორმის შევსების შემდეგ პროდუქტი დაემატება კატალოგში."
                      : "ცვლილებების შენახვის შემდეგ მონაცემები დაუყოვნებლივ განახლდება."}
                  </p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                      გაუქმება
                    </Button>
                    <Button type="submit" disabled={loading} className="rounded-xl">
                      {loading ? "ინახება..." : mode === "add" ? "პროდუქტის შექმნა" : "ცვლილებების შენახვა"}
                    </Button>
                  </div>
                </div>
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Dashboard() {
  const { auth } = usePage<PageProps>().props;
  const user = auth?.user;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"add" | "edit" | "delete" | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [addValues, setAddValues] = useState<ProductFormValues>(emptyForm);
  const [editValues, setEditValues] = useState<ProductFormValues>(emptyForm);

  const [addImages, setAddImages] = useState<File[]>([]);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]);

  const [addSpecs, setAddSpecs] = useState<ProductSpec[]>(emptySpecs);
  const [editSpecs, setEditSpecs] = useState<ProductSpec[]>(emptySpecs);

  const [addErrors, setAddErrors] = useState<ValidationErrors>({});
  const [editErrors, setEditErrors] = useState<ValidationErrors>({});

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryTarget, setCategoryTarget] = useState<"add" | "edit" | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([axios.get("/products"), axios.get("/categories")]);
      setProducts(productsResponse.data.products || []);
      setCategories(normalizeCategories(categoriesResponse.data.categories || []));
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("პროდუქტების ჩატვირთვა ამჟამად ვერ ხერხდება.");
    } finally {
      setLoading(false);
    }
  };

  const syncCategories = async () => {
    const response = await axios.get("/categories");
    setCategories(normalizeCategories(response.data.categories || []));
  };

  const openCategoryDialog = (target: "add" | "edit") => {
    setCategoryTarget(target);
    setCategoryName("");
    setCategoryDialogOpen(true);
  };

  const createCategory = async () => {
    const name = categoryName.trim();

    if (!name) {
      toast.warning("გთხოვთ, შეიყვანოთ კატეგორიის სახელი.");
      return;
    }

    try {
      setCategorySaving(true);
      await axios.post("/categories", { name });
      await syncCategories();

      if (categoryTarget === "add") {
        setAddValues((previous) => ({ ...previous, category: name }));
      } else if (categoryTarget === "edit") {
        setEditValues((previous) => ({ ...previous, category: name }));
      }

      toast.success("კატეგორია წარმატებით შეიქმნა.");
      setCategoryDialogOpen(false);
      setCategoryName("");
      setCategoryTarget(null);
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("ეს კატეგორია უკვე არსებობს.");
      } else {
        console.error("Error creating category:", error);
        toast.error("კატეგორიის შექმნა ვერ მოხერხდა.");
      }
    } finally {
      setCategorySaving(false);
    }
  };

  useEffect(() => {
    if (!user?.admin) window.location.href = "/";
  }, [user]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, stockFilter]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = `${product.name} ${product.code || ""} ${product.brand || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory = categoryFilter === "all" ? true : (product.category || "") === categoryFilter;

      const stock = Number(product.in_stock) || 0;
      const matchesStock = stockFilter === "all" ? true : stockFilter === "in" ? stock > 0 : stock <= 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * itemsPerPage;
  const currentProducts = filtered.slice(start, start + itemsPerPage);

  useEffect(() => {
    if (currentPage !== safePage) setCurrentPage(safePage);
  }, [currentPage, safePage]);

  const stats = {
    total: products.length,
    visible: products.filter((product) => Boolean(product.visible)).length,
    lowStock: products.filter((product) => (Number(product.in_stock) || 0) <= 5).length,
    categories: categories.length,
  };

  const openAdd = () => {
    setAddValues(emptyForm);
    setAddImages([]);
    setAddSpecs([{ key: "", value: "" }]);
    setAddErrors({});
    setAddOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);

    setEditValues({
      name: product.name || "",
      code: product.code || "",
      price: String(product.price ?? ""),
      new_price: product.new_price ? String(product.new_price) : "",
      cost_price: product.cost_price ? String(product.cost_price) : "",
      markup_percent: String(product.markup_percent ?? 18),
      in_stock: String(product.in_stock ?? 0),
      brand: product.brand || "",
      category: product.category || "",
      warranty: product.warranty || "",
      description: product.description || "",
      visible: Boolean(product.visible),
    });

    setEditExistingImages(previewImages(product));
    setEditImages([]);
    setEditSpecs(product.specifications?.length ? product.specifications : [{ key: "", value: "" }]);
    setEditErrors({});
    setEditOpen(true);
  };

  const submitAdd = async () => {
    const specIssue = addSpecs.some(
      (spec) => (spec.key.trim() || spec.value.trim()) && (!spec.key.trim() || !spec.value.trim()),
    );

    const errors = validate(addValues, addImages.length, 0);
    if (specIssue) errors.specifications = ["თითოეულ სპეციფიკაციას უნდა ჰქონდეს სახელიც და მნიშვნელობაც."];

    if (Object.keys(errors).length) {
      setAddErrors(errors);
      toast.error("გთხოვთ, გაასწოროთ მონიშნული ველები.");
      return;
    }

    const formData = new FormData();
    formData.append("name", addValues.name.trim());
    formData.append("code", addValues.code.trim());
    formData.append("price", addValues.price.trim());
    formData.append("new_price", addValues.new_price.trim() || "0");
    formData.append("cost_price", addValues.cost_price.trim() || "0");
    formData.append("markup_percent", addValues.markup_percent.trim() || "18");
    formData.append("in_stock", addValues.in_stock.trim() || "0");
    formData.append("brand", addValues.brand.trim());
    formData.append("category", addValues.category.trim());
    formData.append("warranty", addValues.warranty.trim());
    formData.append("description", addValues.description.trim());
    formData.append("visible", addValues.visible ? "1" : "0");
    formData.append("specifications", JSON.stringify(cleanSpecs(addSpecs)));
    addImages.forEach((file) => formData.append("images[]", file));

    try {
      setBusy("add");
      await axios.post("/admin/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("პროდუქტი წარმატებით შეიქმნა.");
      setAddOpen(false);
      await loadData();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setAddErrors(error.response.data.errors || {});
      } else {
        toast.error("პროდუქტის შექმნა ვერ მოხერხდა.");
      }
    } finally {
      setBusy(null);
    }
  };

  const submitEdit = async () => {
    if (!editingProduct) return;

    const specIssue = editSpecs.some(
      (spec) => (spec.key.trim() || spec.value.trim()) && (!spec.key.trim() || !spec.value.trim()),
    );

    const errors = validate(editValues, editImages.length, editExistingImages.length);
    if (specIssue) errors.specifications = ["თითოეულ სპეციფიკაციას უნდა ჰქონდეს სახელიც და მნიშვნელობაც."];

    if (Object.keys(errors).length) {
      setEditErrors(errors);
      toast.error("გთხოვთ, გაასწოროთ მონიშნული ველები.");
      return;
    }

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", editValues.name.trim());
    formData.append("code", editValues.code.trim());
    formData.append("price", editValues.price.trim());
    formData.append("new_price", editValues.new_price.trim() || "0");
    formData.append("cost_price", editValues.cost_price.trim() || "0");
    formData.append("markup_percent", editValues.markup_percent.trim() || "18");
    formData.append("in_stock", editValues.in_stock.trim() || "0");
    formData.append("brand", editValues.brand.trim());
    formData.append("category", editValues.category.trim());
    formData.append("warranty", editValues.warranty.trim());
    formData.append("description", editValues.description.trim());
    formData.append("visible", editValues.visible ? "1" : "0");
    formData.append("keep_images", JSON.stringify(editExistingImages));
    formData.append("specifications", JSON.stringify(cleanSpecs(editSpecs)));
    editImages.forEach((file) => formData.append("images[]", file));

    try {
      setBusy("edit");
      await axios.post(`/admin/products/${editingProduct.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("პროდუქტი წარმატებით განახლდა.");
      setEditOpen(false);
      setEditingProduct(null);
      await loadData();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setEditErrors(error.response.data.errors || {});
      } else {
        toast.error("პროდუქტის განახლება ვერ მოხერხდა.");
      }
    } finally {
      setBusy(null);
    }
  };

  const submitDelete = async () => {
    if (!deleteTarget) return;

    try {
      setBusy("delete");
      await axios.delete(`/admin/products/${deleteTarget.id}`);
      setProducts((previous) => previous.filter((product) => product.id !== deleteTarget.id));
      toast.success("პროდუქტი წაიშალა.");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("პროდუქტის წაშლა ვერ მოხერხდა.");
    } finally {
      setBusy(null);
    }
  };

  if (!user || !user.admin) return null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="პროდუქტები" />
      <Toaster richColors position="top-right" />

      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#f8fafc_100%)]">
        <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-6 md:px-6 lg:px-8">
          <Card className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(135deg,#0f172a_0%,#111827_50%,#1e293b_100%)] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="relative overflow-hidden px-6 py-8 text-white md:px-8 md:py-10">
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-4">
                  <Badge className="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-slate-100 hover:bg-white/10">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                    ადმინისტრატორის პანელი
                  </Badge>

                  <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">პროდუქტების მართვა</h1>
                    <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                      დაამატეთ, შეცვალეთ, წაშალეთ და გააკონტროლეთ პროდუქტები თანამედროვე და მოწესრიგებული ინტერფეისიდან.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="secondary"
                    className="rounded-2xl border-0 bg-white text-slate-900 shadow-sm hover:bg-slate-100"
                    onClick={loadData}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    განახლება
                  </Button>

                  <Button className="rounded-2xl shadow-sm" onClick={openAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    პროდუქტის დამატება
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="სულ პროდუქტები" value={stats.total} icon={<Package2 className="h-6 w-6" />} />
            <StatCard title="ხილული" value={stats.visible} icon={<Eye className="h-6 w-6" />} tone="green" />
            <StatCard title="დაბალი მარაგი" value={stats.lowStock} icon={<Layers3 className="h-6 w-6" />} tone="amber" />
            <StatCard title="კატეგორიები" value={stats.categories} icon={<Sparkles className="h-6 w-6" />} tone="sky" />
          </div>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">ძიება და ფილტრები</CardTitle>
                  <CardDescription>სწრაფად მოძებნეთ პროდუქტი ან გააფილტრეთ შედეგები.</CardDescription>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm">
                  ნაპოვნია {filtered.length} შედეგი
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>ძიება</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-11 rounded-xl border-slate-300 pl-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="სახელით, კოდით ან ბრენდით მოძებნა"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>კატეგორია</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-300">
                    <SelectValue placeholder="კატეგორიით ფილტრაცია" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ყველა კატეგორია</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>მარაგი</Label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-300">
                    <SelectValue placeholder="მარაგით ფილტრაცია" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ყველა მარაგი</SelectItem>
                    <SelectItem value="in">მარაგშია</SelectItem>
                    <SelectItem value="out">მარაგი არ არის</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">პროდუქტები</CardTitle>
                  <CardDescription>სუფთა ცხრილი სწრაფი მოქმედებებით და გამოკვეთილი სტატუსებით.</CardDescription>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  გვერდი {safePage} / {totalPages}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {loading ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
                  პროდუქტები იტვირთება...
                </div>
              ) : currentProducts.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                        <TableHead className="h-12 font-semibold text-slate-700">პროდუქტი</TableHead>
                        <TableHead className="font-semibold text-slate-700">კატეგორია</TableHead>
                        <TableHead className="font-semibold text-slate-700">ფასი</TableHead>
                        <TableHead className="font-semibold text-slate-700">მარაგი</TableHead>
                        <TableHead className="font-semibold text-slate-700">სტატუსი</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">მოქმედებები</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {currentProducts.map((product) => {
                        const images = previewImages(product);
                        const stock = Number(product.in_stock) || 0;
                        const visible = Boolean(product.visible);
                        const lowStock = stock > 0 && stock <= 5;

                        return (
                          <TableRow key={product.id} className="hover:bg-slate-50/70">
                            <TableCell>
                              <div className="flex min-w-[240px] items-center gap-3">
                                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                                  {images[0] ? (
                                    <img src={images[0]} alt={product.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <Package2 className="h-5 w-5 text-slate-400" />
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <div className="font-semibold text-slate-900">{product.name}</div>
                                  <div className="text-xs text-slate-500">
                                    {product.code || "კოდი არ არის"} • {product.brand || "ბრენდი არ არის"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline" className="rounded-full border-slate-300 bg-white">
                                {product.category || "მინიჭებული არაა"}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-semibold text-slate-900">{money(product.price)} ₾</div>
                                <div className="text-xs text-slate-500">
                                  ფასდაკლება: {product.new_price ? `${money(product.new_price)} ₾` : "არ არის მითითებული"}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-semibold text-slate-900">{stock} ცალი</div>
                                {lowStock ? (
                                  <Badge className="rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100">
                                    დაბალი მარაგი
                                  </Badge>
                                ) : stock === 0 ? (
                                  <Badge className="rounded-full bg-red-100 text-red-700 hover:bg-red-100">
                                    მარაგი არ არის
                                  </Badge>
                                ) : (
                                  <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                    ნორმაშია
                                  </Badge>
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge
                                className={cn(
                                  "rounded-full",
                                  visible
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-100",
                                )}
                              >
                                {visible ? "ხილული" : "დამალული"}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => openEdit(product)} className="rounded-xl">
                                  <PencilLine className="mr-1 h-4 w-4" />
                                  რედაქტირება
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(product)} className="rounded-xl">
                                  <Trash2 className="mr-1 h-4 w-4" />
                                  წაშლა
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
                  <div className="text-lg font-semibold text-slate-900">პროდუქტი ვერ მოიძებნა</div>
                  <p className="mt-1 text-sm text-slate-500">სცადეთ სხვა ფილტრი ან დაამატეთ პირველი პროდუქტი.</p>
                  <div className="mt-5">
                    <Button onClick={openAdd} className="rounded-xl">
                      <Plus className="mr-2 h-4 w-4" />
                      პროდუქტის დამატება
                    </Button>
                  </div>
                </div>
              )}

              {currentProducts.length > 0 ? (
                <>
                  <Separator />
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-slate-500">
                      ნაჩვენებია {start + 1}-დან {Math.min(start + itemsPerPage, filtered.length)}-მდე, სულ {filtered.length} პროდუქტი
                    </p>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        disabled={safePage <= 1}
                        className="rounded-xl"
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        წინა
                      </Button>

                      <Badge variant="outline" className="rounded-full px-4 py-2">
                        {safePage}
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                        disabled={safePage >= totalPages}
                        className="rounded-xl"
                      >
                        შემდეგი
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      <ProductDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        mode="add"
        values={addValues}
        setValues={setAddValues}
        images={addImages}
        setImages={setAddImages}
        existingImages={[]}
        setExistingImages={() => undefined}
        specs={addSpecs}
        setSpecs={setAddSpecs}
        errors={addErrors}
        categories={categories}
        onRequestCreateCategory={() => openCategoryDialog("add")}
        onSubmit={submitAdd}
        loading={busy === "add"}
      />

      <ProductDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        values={editValues}
        setValues={setEditValues}
        images={editImages}
        setImages={setEditImages}
        existingImages={editExistingImages}
        setExistingImages={setEditExistingImages}
        specs={editSpecs}
        setSpecs={setEditSpecs}
        errors={editErrors}
        categories={categories}
        onRequestCreateCategory={() => openCategoryDialog("edit")}
        onSubmit={submitEdit}
        loading={busy === "edit"}
      />

      <CategoryCreateDialog
        open={categoryDialogOpen}
        onOpenChange={(open) => {
          setCategoryDialogOpen(open);
          if (!open) {
            setCategoryName("");
            setCategoryTarget(null);
          }
        }}
        name={categoryName}
        setName={setCategoryName}
        onCreate={createCategory}
        loading={categorySaving}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="rounded-3xl border-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">პროდუქტის წაშლა</AlertDialogTitle>
            <AlertDialogDescription className="leading-6">
              ეს მოქმედება სამუდამოდ წაშლის{" "}
              <span className="font-semibold text-slate-900">{deleteTarget?.name || "ამ პროდუქტს"}</span> კატალოგიდან.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">გაუქმება</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitDelete}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy === "delete" ? "იწაშლება..." : "წაშლა"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
