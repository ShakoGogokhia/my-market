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
  RotateCcw,
  Filter,
  ArrowRight,
  Check,
  Eye,
  ShoppingCart,
  Loader2,
} from "lucide-react";

import { useTranslation } from "@/translation";
import { getCategoryLabel, type LocalizedCategory } from "@/utils/category";
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
import {
  getProductImageUrls,
  resolveProductImageUrl,
  type ProductImageSource,
} from "@/utils/productImages";

type CategoryItem = {
  name: string;
  name_en?: string | null;
  name_ru?: string | null;
  name_ka?: string | null;
  icon_url?: string | null;
};

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
  image?: ProductImageSource;
  images?: ProductImageSource[];
};

function getProductImages(product: ProductType): string[] {
  return getProductImageUrls(product);
}

export default function ProductPage() {
  const { lang, t } = useTranslation();
  const tp = t("body.energy");

  const [products, setProducts] = useState<ProductType[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);

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
  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);

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
    return allCategories.map((category) => ({
      key: category.name,
      label: getCategoryLabel(category as LocalizedCategory, lang),
      iconUrl: category.icon_url || null,
    }));
  }, [allCategories, lang]);

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
    return getProductImages(product)[0] || resolveProductImageUrl(product.image);
  }

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.src = "/images/placeholder.png";
  };

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

  const addToCart = (product: ProductType) => {
    const existing = localStorage.getItem("cartItems");
    const cart: Array<{
      id: number;
      quantity?: number;
      price?: number;
      oldPrice?: number | null;
      isDiscountedByNewPrice?: boolean;
      [key: string]: unknown;
    }> = existing ? JSON.parse(existing) : [];

    const priceNum = Number(product.price || 0);
    const newPrice = Number(product.new_price ?? 0);
    const discountedPrice = Number(product.discounted_price ?? 0);

    let unitPrice = priceNum;
    if (newPrice > 0) {
      unitPrice = newPrice;
    } else if (product.pre_order_discount_applied || product.applied_promocode) {
      unitPrice = discountedPrice;
    }

    const index = cart.findIndex((item) => item.id === product.id);

    if (index > -1) {
      cart[index].quantity = (cart[index].quantity || 1) + 1;
    } else {
      cart.push({
        ...product,
        price: unitPrice,
        oldPrice: unitPrice < priceNum ? priceNum : null,
        quantity: 1,
        isDiscountedByNewPrice: newPrice > 0,
      });
    }

    localStorage.setItem("cartItems", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    toast.success(`${product.name} დაემატა კალათაში!`);
  };

  const handleAddToCart = async (product: ProductType) => {
    setLoadingProductId(product.id);
    await new Promise((resolve) => setTimeout(resolve, 250));
    addToCart(product);
    setLoadingProductId(null);
  };

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
              <p className="text-xs text-slate-500">{tp.filterSubtitle}</p>
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <RotateCcw size={13} />
              {tp.clearFilters}
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[calc(100dvh-11rem)] space-y-4 overflow-y-auto p-5 pr-4 overscroll-contain">
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
            <option value="">{tp.all}</option>
            <option value="price-asc">{t("body.energy.priceLowToHigh")}</option>
            <option value="price-desc">{t("body.energy.priceHighToLow")}</option>
            <option value="stock-desc">{tp.stockDesc}</option>
            <option value="az">{tp.alphabeticAsc}</option>
            <option value="za">{tp.alphabeticDesc}</option>
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
            className={`flex h-6 w-6 items-center justify-center rounded-full transition ${filterStock
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

          <div className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            {filteredTranslatedCategories.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">{tp.noMatches}</div>
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
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                      active
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-2xl bg-white shadow-sm">
                      {cat.iconUrl ? (
                        <img
                          src={cat.iconUrl}
                          alt={cat.label}
                          className="h-6 w-6 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-slate-500">
                          <Package size={18} />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">{cat.label}</span>
                    {active && (
                      <span className="rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        {tp.selected}
                      </span>
                    )}
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
                  {translatedCategories.find((item) => item.key === cat)?.label || cat} ×
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

          <div className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            {filteredBrands.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">{tp.noMatches}</div>
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
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${active
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    <span>{brand}</span>
                    {active && <span className="text-xs font-semibold text-emerald-700">{tp.selected}</span>}
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

          {/* HERO */}
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
                className="absolute inset-0 h-full w-full object-fill object-center"
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
                    className={`h-2 rounded-full transition-all duration-500 ${i === currentIndex ? "w-10 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
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
          <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start lg:max-h-[calc(100dvh-3rem)] lg:overflow-y-auto lg:pr-1">
            <FilterSidebar />
          </aside>

            <main>
              <div className="mx-auto w-full max-w-[1480px]">
                {currentProducts.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Package size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {t("body.energy.noProducts")}
                    </h3>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                      {t("body.energy.noProductsDescription")}
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      {tp.clearFilters}
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
                      className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
                              hidden: { opacity: 0, y: 30 },
                              visible: { opacity: 1, y: 0 },
                            }}
                            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            className="group relative"
                          >
                            <Link
                              href={route("products.show", {
                                product: product.id,
                                name: slugify(product.name, { lower: true }),
                              })}
                              className="block h-full outline-none"
                            >
                              <div className="relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-500 hover:-translate-y-1 hover:border-emerald-100 hover:shadow-[0_20px_44px_-18px_rgba(15,23,42,0.14)]">

                                {/* Image Container */}
                                <div className="relative aspect-[1/1] overflow-hidden rounded-[1.6rem] border border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                                  {/* Floating Badges */}
                                  <div className="absolute inset-x-2.5 top-2.5 z-20 flex items-start justify-between">
                                    <div className={`flex items-center gap-1 rounded-full border px-2.5 py-1 shadow-sm backdrop-blur-md ${inStock ? "border-emerald-100 bg-white/90 text-emerald-700" : "border-slate-200 bg-white/90 text-slate-500"
                                      }`}>
                                      <div className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                                      <span className="text-[9px] font-bold uppercase tracking-wide">
                                        {inStock ? tp.inStock : tp.outOfStock}
                                      </span>
                                    </div>

                                    {discount > 0 && (
                                      <div className="rounded-full bg-emerald-600 px-2.5 py-1 text-[9px] font-black text-white shadow-lg shadow-emerald-200/40">
                                        -{discount}%
                                      </div>
                                    )}
                                  </div>

                                  {/* Product Image */}
                                  <div className="flex h-full w-full items-center justify-center p-6 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
                                    <img
                                      src={imageUrl}
                                      alt={product.name}
                                      loading="lazy"
                                      className="h-full w-full object-contain drop-shadow-xl"
                                      onError={handleImageError}
                                    />
                                  </div>

                                  {/* Hover Overlay Button */}
                                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <div className="flex items-center gap-2 translate-y-4 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-900 shadow-2xl transition-transform duration-500 group-hover:translate-y-0">
                                      <Eye size={13} />
                                      {tp.view}
                                    </div>
                                  </div>
                                </div>

                                {/* Product Info */}
                                <div className="flex flex-1 flex-col px-3.5 py-3.5">
                                  <div className="mb-3 space-y-2">
                                    {product.brand && (
                                      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-600/80">
                                        {product.brand}
                                      </span>
                                    )}
                                    <h3 className="line-clamp-2 text-[15px] font-extrabold leading-5 text-slate-900 transition-colors group-hover:text-emerald-700">
                                      {product.name}
                                    </h3>
                                    {product.code && (
                                      <p className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                                        ID: {product.code}
                                      </p>
                                    )}
                                  </div>

                                  {/* Price Section */}
                                  <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                                    <div className="flex flex-col">
                                      {discount > 0 && displayPrice.old && (
                                        <span className="text-[11px] font-semibold text-slate-400 line-through">
                                          {Number(displayPrice.old).toFixed(2)} ₾
                                        </span>
                                      )}
                                      <div className="flex items-baseline gap-1 text-slate-900">
                                        <span className="text-xl font-black tracking-tight">
                                          {Math.floor(Number(displayPrice.current))}
                                        </span>
                                        <span className="text-xs font-bold text-slate-500">
                                          .{(Number(displayPrice.current) % 1).toFixed(2).slice(2)} ₾
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition-all duration-300 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:scale-105">
                                      <ArrowRight size={16} />
                                    </div>
                                  </div>

                                  {inStock ? (
                                    <motion.button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleAddToCart(product);
                                      }}
                                      disabled={loadingProductId === product.id}
                                      className="mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                      whileTap={{ scale: 0.97 }}
                                    >
                                      {loadingProductId === product.id ? (
                                        <>
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                          {tp.addToCart}
                                        </>
                                      ) : (
                                        <>
                                          <ShoppingCart className="h-4 w-4" />
                                          {tp.addToCart}
                                        </>
                                      )}
                                    </motion.button>
                                  ) : (
                                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                      {tp.outOfStock}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </motion.div>

                    {/* Pagination */}
                    <div className="mt-16 flex justify-center">
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
                            className={`list-none rounded-full transition-all duration-300 ${number === currentPage
                                ? "scale-110 border border-slate-900 bg-slate-900 text-white shadow-lg"
                                : "bg-white text-slate-800 hover:bg-slate-100"
                              }`}
                          >
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(number);
                              }}
                              className="rounded-full px-4 py-2"
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

        {/* Mobile Filter Modal */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col overflow-hidden bg-white shadow-2xl"
            >
              <div className="border-b border-slate-100 px-6 pb-4 pt-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">{tp.filter}</h3>
                    <p className="text-xs text-slate-500">{tp.filterSubtitle}</p>
                  </div>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="rounded-full bg-slate-100 p-3 text-slate-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                <FilterSidebar />
              </div>

              <div className="border-t border-slate-100 bg-white px-4 py-4">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl"
                >
                  {tp.done}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
