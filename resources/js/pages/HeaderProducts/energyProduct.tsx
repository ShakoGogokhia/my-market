import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import slugify from "slugify";
import { IoSearch } from "react-icons/io5";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import {
  SlidersHorizontal,
  Package,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Filter,
  Check,
} from "lucide-react";

import { useTranslation } from "@/translation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../../components/ui/pagination";

type ProductImage = string | { url?: string };

type ProductType = {
  id: number;
  name: string;
  brand?: string;
  code?: string;
  category?: string;
  visible?: number;
  in_stock: number | string;
  price: number | string;
  new_price?: number | string | null;
  discounted_price?: number | string | null;
  applied_promocode?: boolean;
  pre_order_discount_applied?: boolean;
  already_preordered?: boolean;
  image?: string | { url?: string } | null;
  images?: ProductImage[];
};

export default function ProductPage() {
  const { t } = useTranslation();
  const tp = t("body.energy");

  const [products, setProducts] = useState<ProductType[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");
  const [brandQuery, setBrandQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [filterStock, setFilterStock] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [sortOption, setSortOption] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const scrollTargetRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const productsPerPage = 18;

  const carouselImages = [
    "/images/CarouselIMG/generalis-webiscover.jpg",
    "/images/CarouselIMG/mymarketis-cover-1.jpg",
    "/images/CarouselIMG/generalis-3-coveri-chasasmeli.jpg",
    "/images/CarouselIMG/generalis-meore-coveri-chasasmeli.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4500);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("productsPage");
      if (saved) {
        setCurrentPage(parseInt(saved, 10));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("productsPage", currentPage.toString());
    }
  }, [currentPage]);

  useEffect(() => {
    resetInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    if (category) {
      setSelectedCategories([category]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get("/products"),
          axios.get("/categories"),
        ]);

        const rawProducts = productsRes.data.products || productsRes.data || [];
        const visibleProducts = rawProducts.filter(
          (product: ProductType) => Number(product.visible) === 1
        );

        setProducts(visibleProducts);

        const cats = Array.isArray(categoriesRes.data?.categories)
          ? categoriesRes.data.categories
          : Array.isArray(categoriesRes.data)
            ? categoriesRes.data
            : [];

        setAllCategories(cats);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("შეცდომა მონაცემების ჩატვირთვისას");
      }
    };

    fetchData();
  }, []);

  const allBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => (p.brand || "").trim()))).filter(Boolean);
  }, [products]);

  const translatedCategories = useMemo(() => {
    return allCategories.map((key) => ({
      key,
      label: t(`categories.${key}`, { defaultValue: key }),
    }));
  }, [allCategories, t]);

  const filteredBrands = useMemo(() => {
    return allBrands.filter((brand) =>
      brand.toLowerCase().includes(brandQuery.toLowerCase())
    );
  }, [allBrands, brandQuery]);

  const filteredTranslatedCategories = useMemo(() => {
    return translatedCategories.filter((cat) =>
      cat.label.toLowerCase().includes(categoryQuery.toLowerCase())
    );
  }, [translatedCategories, categoryQuery]);

  const groupedProducts = useMemo(() => {
    const grouped: Record<string, ProductType> = {};

    products.forEach((product) => {
      const stock = Number(product.in_stock || 0);

      if (grouped[product.name]) {
        grouped[product.name].in_stock =
          Number(grouped[product.name].in_stock || 0) + stock;
      } else {
        grouped[product.name] = {
          ...product,
          in_stock: stock,
        };
      }
    });

    return Object.values(grouped);
  }, [products]);

  const filteredGroupedProducts = useMemo(() => {
    const list = groupedProducts
      .filter((product) => {
        const displayPrice = getDisplayPrice(product);
        return (
          Number(displayPrice.current) >= minPrice &&
          Number(displayPrice.current) <= maxPrice
        );
      })
      .filter((product) => (filterStock ? Number(product.in_stock) > 0 : true))
      .filter((product) =>
        selectedBrands.length > 0 ? selectedBrands.includes(product.brand || "") : true
      )
      .filter((product) => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return true;

        return (
          (product.name || "").toLowerCase().includes(query) ||
          (product.code || "").toLowerCase().includes(query) ||
          (product.brand || "").toLowerCase().includes(query)
        );
      })
      .filter((product) =>
        selectedCategories.length > 0
          ? selectedCategories.includes(product.category || "")
          : true
      );

    if (sortOption === "price-asc") {
      list.sort(
        (a, b) => Number(getDisplayPrice(a).current) - Number(getDisplayPrice(b).current)
      );
    } else if (sortOption === "price-desc") {
      list.sort(
        (a, b) => Number(getDisplayPrice(b).current) - Number(getDisplayPrice(a).current)
      );
    } else if (sortOption === "stock-desc") {
      list.sort((a, b) => Number(b.in_stock) - Number(a.in_stock));
    } else if (sortOption === "az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === "za") {
      list.sort((a, b) => b.name.localeCompare(a.name));
    }

    return list;
  }, [
    groupedProducts,
    minPrice,
    maxPrice,
    filterStock,
    selectedBrands,
    searchTerm,
    selectedCategories,
    sortOption,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredGroupedProducts.length / productsPerPage)
  );

  const currentProducts = useMemo(() => {
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredGroupedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  }, [filteredGroupedProducts, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const pagesToShow = 5;
  const startPage =
    Math.floor((currentPage - 1) / pagesToShow) * pagesToShow + 1;
  const endPage = Math.min(startPage + pagesToShow - 1, totalPages);
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);

    if (scrollTargetRef.current) {
      scrollTargetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  function getProductImageUrl(product: ProductType): string {
    if (Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === "string") return firstImage;
      if (firstImage?.url) return firstImage.url;
    }

    if (product.image) {
      if (typeof product.image === "string") return product.image;
      if (product.image?.url) return product.image.url;
    }

    return "/images/placeholder.png";
  }

  function getDisplayPrice(product: ProductType) {
    const original = Number(product.price || 0);
    const newPrice = Number(product.new_price || 0);
    const discounted = Number(product.discounted_price || 0);

    if (newPrice > 0) {
      return {
        current: newPrice,
        old: original,
        hasDiscount: newPrice < original,
      };
    }

    if (product.applied_promocode || product.pre_order_discount_applied) {
      return {
        current: discounted || original,
        old: original,
        hasDiscount: discounted > 0 && discounted < original,
      };
    }

    return {
      current: original,
      old: null,
      hasDiscount: false,
    };
  }

  const clearAllFilters = () => {
    setSearchTerm("");
    setCategoryQuery("");
    setBrandQuery("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setFilterStock(false);
    setMinPrice(0);
    setMaxPrice(20000);
    setSortOption("");
    setCurrentPage(1);
  };

  const activeFiltersCount =
    selectedCategories.length +
    selectedBrands.length +
    (filterStock ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (minPrice > 0 ? 1 : 0) +
    (maxPrice < 20000 ? 1 : 0) +
    (sortOption ? 1 : 0);

  const handleNextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    resetInterval();
  };

  const handlePrevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    resetInterval();
  };

  const FilterSidebar = () => (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-2.5 text-white">
              <Filter size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">{tp.filter}</h2>
              <p className="text-xs text-slate-500">აირჩიე სასურველი ფილტრები</p>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <RotateCcw size={13} />
              გასუფთავება
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            {t("body.energy.searchInProduct")}
          </label>
          <div className="relative">
            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("body.energy.searchInProduct")}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            {t("body.energy.sort")}
          </label>
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
          >
            <option value="">---</option>
            <option value="price-asc">{t("body.energy.priceLowToHigh")}</option>
            <option value="price-desc">{t("body.energy.priceHighToLow")}</option>
            <option value="stock-desc">მარაგი</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              {t("body.energy.priceMin")}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                ₾
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-800">
              {t("body.energy.priceMax")}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
                placeholder="20000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                ₾
              </span>
            </div>
          </div>
        </div>

        <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-slate-100">
          <span className="text-sm font-medium text-slate-700">
            {t("body.energy.inStockOnly")}
          </span>
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full transition ${
              filterStock
                ? "bg-slate-900 text-white shadow-[0_8px_18px_rgba(15,23,42,0.18)]"
                : "border border-slate-300 bg-white text-transparent"
            }`}
          >
            <Check size={14} />
          </div>
          <input
            type="checkbox"
            checked={filterStock}
            onChange={(e) => {
              setFilterStock(e.target.checked);
              setCurrentPage(1);
            }}
            className="hidden"
          />
        </label>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            {t("body.energy.filterByCategory")}
          </label>

          <div className="relative">
            <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={categoryQuery}
              onChange={(e) => {
                setCategoryQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("body.energy.typeFilter")}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div className="mt-2 max-h-56 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            {filteredTranslatedCategories.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
            ) : (
              filteredTranslatedCategories.map((cat) => {
                const active = selectedCategories.includes(cat.key);

                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setSelectedCategories((prev) =>
                        prev.includes(cat.key)
                          ? prev.filter((c) => c !== cat.key)
                          : [...prev, cat.key]
                      );
                      setCurrentPage(1);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                      active
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat.label}</span>
                    {active && <span className="text-xs font-semibold text-emerald-700">Selected</span>}
                  </button>
                );
              })
            )}
          </div>

          {selectedCategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setSelectedCategories((prev) => prev.filter((c) => c !== cat))
                  }
                  className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(5,150,105,0.18)] transition hover:bg-emerald-700"
                >
                  {t(`categories.${cat}`, { defaultValue: cat })} ×
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            {t("body.energy.brand")}
          </label>

          <div className="relative">
            <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={brandQuery}
              onChange={(e) => {
                setBrandQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={t("body.energy.typeFilter")}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div className="mt-2 max-h-56 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            {filteredBrands.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">No matches</div>
            ) : (
              filteredBrands.map((brand) => {
                const active = selectedBrands.includes(brand);

                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => {
                      setSelectedBrands((prev) =>
                        prev.includes(brand)
                          ? prev.filter((b) => b !== brand)
                          : [...prev, brand]
                      );
                      setCurrentPage(1);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                      active
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{brand}</span>
                    {active && <span className="text-xs font-semibold text-emerald-700">Selected</span>}
                  </button>
                );
              })
            )}
          </div>

          {selectedBrands.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() =>
                    setSelectedBrands((prev) => prev.filter((b) => b !== brand))
                  }
                  className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-[0_8px_16px_rgba(15,23,42,0.18)] transition hover:bg-slate-800"
                >
                  {brand} ×
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head title={t("footer.products")} />
      <Header />
      <Toaster richColors />

      <div className="min-h-screen bg-[#f8fafc]">
        <div className="mx-auto max-w-[1920px] px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  {t("body.energy.backToProducts")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("footer.products")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* HERO ONLY FROM FIRST FILE STYLE */}
          <section className="group relative mb-10 h-[260px] w-full overflow-hidden rounded-[2.2rem] bg-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.14)] sm:h-[340px] lg:h-[420px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: "circOut" }}
                src={carouselImages[currentIndex]}
                alt={`carousel-${currentIndex}`}
                className="absolute h-full w-full object-cover"
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

            <div className="absolute inset-x-4 bottom-4 z-10 flex items-end justify-between sm:inset-x-6 sm:bottom-6 lg:inset-x-8 lg:bottom-8">
              <div className="flex gap-2">
                {carouselImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentIndex(i);
                      resetInterval();
                    }}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      i === currentIndex ? "w-10 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrevSlide}
                  className="rounded-2xl bg-white/20 p-3 text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:p-4"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  onClick={handleNextSlide}
                  className="rounded-2xl bg-white/20 p-3 text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:p-4"
                >
                  <ChevronRight size={22} />
                </button>
              </div>
            </div>
          </section>

          <div ref={scrollTargetRef} />

          <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <div>
              <h2 className="text-xl font-black text-slate-900">{t("footer.products")}</h2>
              <p className="text-sm text-slate-500">
                {t("body.energy.foundProducts").replace(
                  "{count}",
                  String(filteredGroupedProducts.length)
                )}
              </p>
            </div>

            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
            >
              <SlidersHorizontal size={16} />
              ფილტრი
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
              <FilterSidebar />
            </aside>

            <main>
              <div className="mx-auto w-full max-w-[1480px]">
                <div className="mb-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        {t("footer.products")}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {t("body.energy.foundProducts").replace(
                          "{count}",
                          String(filteredGroupedProducts.length)
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {searchTerm && (
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                          ძებნა: {searchTerm}
                        </span>
                      )}
                      {filterStock && (
                        <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
                          მარაგშია
                        </span>
                      )}
                      {sortOption && (
                        <span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
                          დალაგებული
                        </span>
                      )}
                      {selectedCategories.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          {t(`categories.${cat}`, { defaultValue: cat })}
                        </span>
                      ))}
                      {selectedBrands.slice(0, 3).map((brand) => (
                        <span
                          key={brand}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {currentProducts.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Package size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">
                      პროდუქტები ვერ მოიძებნა
                    </h3>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                      შეცვალე ძებნის ტექსტი, კატეგორია, ბრენდი ან ფასის ფილტრი და თავიდან სცადე.
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      ფილტრების გასუფთავება
                    </button>
                  </div>
                ) : (
                  <>
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
                      }}
                      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    >
                      {currentProducts.map((product) => {
                        const displayPrice = getDisplayPrice(product);
                        const imageUrl = getProductImageUrl(product);
                        const inStock = Number(product.in_stock) > 0;
                        const discount =
                          displayPrice.hasDiscount && displayPrice.old
                            ? Math.round(
                                ((Number(displayPrice.old) - Number(displayPrice.current)) /
                                  Number(displayPrice.old)) *
                                  100
                              )
                            : 0;

                        return (
                          <motion.div
                            key={product.id}
                            variants={{
                              hidden: { opacity: 0, y: 16 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            transition={{ duration: 0.35 }}
                            className="group relative"
                          >
                            <Link
                              href={route("products.show", {
                                product: product.id,
                                name: slugify(product.name, { lower: true }),
                              })}
                              className="block h-full outline-none"
                            >
                              <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
                                <div className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
                                  <div className="absolute inset-x-4 top-4 z-20 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-xl">
                                      <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                          inStock ? "bg-emerald-500" : "bg-slate-400"
                                        }`}
                                      />
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                        {inStock ? "In Stock" : "Out"}
                                      </span>
                                    </div>

                                    {discount > 0 && (
                                      <div className="rounded-full bg-emerald-600 px-2.5 py-1.5 text-[10px] font-black text-white shadow-lg shadow-emerald-200">
                                        -{discount}%
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex h-[250px] items-center justify-center p-6">
                                    <img
                                      src={imageUrl}
                                      alt={product.name}
                                      loading="lazy"
                                      className="h-full w-full object-contain transition-all duration-500 group-hover:scale-105"
                                    />
                                  </div>
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                  <div className="space-y-1.5">
                                    {product.brand && (
                                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                                        {product.brand}
                                      </p>
                                    )}

                                    <h3 className="line-clamp-2 min-h-[52px] text-[17px] font-bold leading-6 text-slate-900 transition-colors group-hover:text-emerald-700">
                                      {product.name}
                                    </h3>
                                  </div>

                                  <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                                    <div className="flex flex-col">
                                      {discount > 0 && displayPrice.old && (
                                        <span className="text-xs font-medium text-slate-400 line-through decoration-emerald-400/40">
                                          {Number(displayPrice.old).toFixed(2)} ₾
                                        </span>
                                      )}

                                      <div className="flex items-baseline gap-1 text-slate-900">
                                        <span className="text-2xl font-black tracking-tight">
                                          {Math.floor(Number(displayPrice.current))}
                                        </span>
                                        <span className="text-sm font-bold">
                                          .
                                          {(Number(displayPrice.current) % 1)
                                            .toFixed(2)
                                            .slice(2)}{" "}
                                          ₾
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white transition-all duration-300 group-hover:w-[100px] group-hover:bg-emerald-700">
                                      <span className="absolute opacity-0 transition-opacity duration-300 group-hover:opacity-100 text-[11px] font-bold tracking-wide">
                                        VIEW
                                      </span>
                                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-7" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    <div className="mt-10 flex justify-center">
                      <Pagination>
                        <PaginationPrevious
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                        >
                          {t("body.energy.previous", "წინა")}
                        </PaginationPrevious>

                        {pageNumbers.map((number) => (
                          <PaginationItem
                            key={number}
                            className={`list-none rounded-full ${
                              number === currentPage
                                ? "border border-slate-900 bg-slate-900 text-white"
                                : "bg-white text-slate-800"
                            }`}
                          >
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(number);
                              }}
                              className="rounded-full px-4 py-2 transition hover:bg-slate-100"
                            >
                              {number}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationNext
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                        >
                          {t("body.energy.next", "შემდეგი")}
                        </PaginationNext>
                      </Pagination>
                    </div>
                  </>
                )}
              </div>
            </main>
          </div>
        </div>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto rounded-l-[32px] border-l border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <h3 className="text-xl font-black text-slate-900">ფილტრები</h3>
                  <p className="text-xs text-slate-500">მოკლე, სწრაფი და ზუსტი ფილტრაცია</p>
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="rounded-full bg-white p-2 text-slate-700 shadow-sm"
                >
                  <X size={18} />
                </button>
              </div>

              <FilterSidebar />

              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="mt-4 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                დასრულება
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
