import { Head, Link, usePage } from "@inertiajs/react";
import { useState, useEffect, SetStateAction, useRef } from "react";
import { FaHeart, FaShoppingCart, FaBars } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";
import slugify from "slugify";
import { router } from "@inertiajs/react";
import { IoIosArrowDown } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import CookieConsent from "./Coockie/CookieConsent.tsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import ReactDOM from "react-dom/client";
import {
  Leaf,
  ScrollText,
  Briefcase,
  Phone,
  Zap,
  ShoppingCart,
  ArrowRight,
  Eye,
} from "lucide-react";
import Login from "./auth/login";
import Register from "./auth/register";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import EnergyProduct from "./HeaderProducts/energyProduct.jsx";
import Company from "./HeaderProducts/Company.js";
import Contact from "./HeaderProducts/Contact.js";
import PaymantTerm from "./HeaderProducts/PaymantTerm";
import Vacancy from "./HeaderProducts/Vacansy.tsx";
import CurrentOrders from "./authComponents/currentOrders";
import CompletedOrders from "./authComponents/completeOrders";
import UserProfile from "./authComponents/userProfile";
import ChangePasswordForm from "./authComponents/userPassword";
import Returns from "./authComponents/returns";
import WarrantyInfo from "./authComponents/warranty";
import PromoCode from "./authComponents/promoCode";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import Cart from "./HeaderProducts/Cart";
import logo from "../../../public/images/Logo/GTTTT-removebg-preview.png";
import { Button } from "../components/ui/button.js";
import { Input } from "../components/ui/input.js";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "../components/ui/label.js";
import { LogOut, Settings } from "lucide-react";
import { Loader2 } from "lucide-react";
import { type BreadcrumbItem } from "@/types";
import { motion } from "framer-motion";
import { useTranslation } from "@/translation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { Toaster, toast } from "sonner";
import HeroBackground from "./HeroBackground";
import MainLayout from "@/layouts/MainLayout";
import Products from "../HeaderProducts/energyProduct";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", staggerChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.05, y: -5, transition: { type: "spring", stiffness: 300 } },
};
const buttonVariants = {
  hover: { scale: 1.1, boxShadow: "0px 0px 8px rgba(0,0,0,0.3)" },
};
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
];
interface ProductType {
  id: number;
  name: string;
  price: number;
  new_price: number;
  discount_percent: number;
  discounted_price: number;
  created_at: string;
  in_stock: number;
  brand: string;
  images?: string[];
  description: string;
  category: string;
  applied_promocode?: string;
  preorder_qty?: number;
  already_preordered?: boolean;
  pre_order_discount_applied: boolean;
}

const dropdownData = [
  {
    title: "ყველა პროდუქცია",
    categories: [
      {
        title: "მზის ენერგია",
        items: ["On-Grid სისტემები", "Off-Grid სისტემები", "MPPT კონტროლერები"],
      },
      {
        title: "უწყვეტი კვება",
        items: ["Line Interactive UPS", "On-Line UPS", "მოდულური UPS"],
      },
      { title: "ბატარეები", items: ["AGM", "GEL", "ლითიუმ-იონური"] },
      {
        title: "დამცავი მოწყობილობები",
        items: ["DC გადამრთველები", "Bypass სისტემები"],
      },
    ],
  },
];
type SharedData = {
  auth: {
    user: {
      id: number;
      name: string;
      email: string;
      admin: string;
      mobile_number: string;
    } | null;
  };
};
const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm">
    <div className="border-b border-gray-100 bg-gradient-to-br from-gray-50 to-slate-100 p-5">
      <div className="h-[190px] w-full rounded-xl bg-gray-200" />
    </div>
    <div className="p-4">
      <div className="mb-3 h-5 w-3/4 rounded bg-gray-200" />
      <div className="mb-2 h-4 w-1/2 rounded bg-gray-100" />
      <div className="mb-4 h-6 w-24 rounded bg-gray-200" />
      <div className="h-10 w-full rounded-xl bg-gray-200" />
    </div>
  </div>
);

export default function Welcome() {
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const { lang, setLang, t } = useTranslation();
  const [activeTab, setActiveTab] = useState("description");
  const [loadingProductId, setLoadingProductId] = useState(null);
  const cleanup = useMobileNavigation();
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const [products, setProducts] = useState<ProductType[]>([]);
  const [showBody, setShowBody] = useState(true);
  const [newArrivals, setNewArrivals] = useState<ProductType[]>([]);
  const { auth } = usePage().props as unknown as SharedData;
  const user = auth?.user;

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.03 },
  };

  const [cartItems, setCartItems] = useState<any[]>([]);

  const [cartItemCount, setCartItemCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);
  const termsTimer = useRef<NodeJS.Timeout | null>(null);
  const handleTermsMouseEnter = () => {
    if (termsTimer.current) clearTimeout(termsTimer.current);
    setOpenTerms(true);
  };
  const handleTermsMouseLeave = () => {
    termsTimer.current = setTimeout(() => setOpenTerms(false), 150);
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSelectProduct = (p: ProductType) => {
    const imgs = p.images?.length ? p.images : [p.image];
    setSelectedProduct({ ...p, images: imgs });
  };

  const handleBackToGrid = () => {
    setSelectedProduct(null);
  };

  useEffect(() => {
    function loadCartFromStorage() {
      const saved = localStorage.getItem("cartItems");
      const items = saved ? JSON.parse(saved) : [];
      setCartItems(items);
      setCartItemCount(
        items.reduce((sum: number, i: any) => sum + (i.quantity ?? 1), 0)
      );
    }

    loadCartFromStorage();
    window.addEventListener("cartUpdated", loadCartFromStorage);

    return () => {
      window.removeEventListener("cartUpdated", loadCartFromStorage);
    };
  }, []);

  const isLoggedIn = Boolean(auth.user);

  useEffect(() => {
    setLoading(true);
    axios
      .get<ProductType[]>("/products")
      .then(({ data }) => {
        const allProducts = (data.products || []).map((p) => ({
          ...p,
          preorder_qty: 1, // ✅ initialize quantity
        }));
        setProducts(allProducts);
        console.log("Loaded products:", allProducts);
        const visible = allProducts.filter((p) => p.visible === 1);
        visible.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setNewArrivals(visible.slice(0, 9));
      })
      .catch((err) => console.error("Error loading products:", err))
      .finally(() => setLoading(false));
  }, []);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [language, setLanguage] = useState("ქარ");

  const languages = [
    {
      code: "ka",
      label: "ქართული",
      flag: "https://upload.wikimedia.org/wikipedia/commons/0/0f/Flag_of_Georgia.svg",
    },
    {
      code: "en",
      label: "English",
      flag: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg",
    },
  ];

  const handleChange = (e: { target: { value: SetStateAction<string> } }) => {
    setLanguage(e.target.value);
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);
  const defaultCarouselImages = [
    "/images/CarouselIMG/generalis-webiscover.jpg",
    "/images/CarouselIMG/mymarketis-cover-1.jpg",
    "/images/CarouselIMG/generalis-3-coveri-chasasmeli.jpg",
    "/images/CarouselIMG/generalis-meore-coveri-chasasmeli.jpg",
  ];
  const [carouselImages, setCarouselImages] = useState<string[]>(defaultCarouselImages);

  useEffect(() => {
    axios
      .get("/carousel-images")
      .then((res) => {
        const images = Array.isArray(res.data?.carousel_images)
          ? res.data.carousel_images
              .map((item: { image_url?: string }) => item.image_url)
              .filter((src: string | undefined): src is string => Boolean(src))
          : [];

        setCarouselImages(images.length > 0 ? images : defaultCarouselImages);
      })
      .catch(() => setCarouselImages(defaultCarouselImages));
  }, []);

  const startAutoSlide = () => {
    if (carouselImages.length < 2) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 3000);
  };
  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    startAutoSlide();
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [carouselImages.length]);

  const handleNext = () => {
    if (carouselImages.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    resetInterval();
  };

  const handlePrev = () => {
    if (carouselImages.length === 0) return;
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + carouselImages.length) % carouselImages.length
    );
    resetInterval();
  };

  const handleLoginSuccess = () => {
    setShowBody(true);
    setShowLogin(true);
  };
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const toggleDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [usePage().url]);

  const handleLanguageChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    const newLang = e.target.value as "ka" | "en";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

function getProductImageUrl(product: {
  images?: Array<string | { url?: string | null }>;
  image?: string | null;
}) {
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];

    if (typeof firstImage === "object" && firstImage?.url?.trim()) {
      return firstImage.url;
    }

    if (typeof firstImage === "string" && firstImage.trim()) {
      return firstImage;
    }
  }

  return "/images/placeholder.png";
}

  const addToCart = (product: ProductType) => {
    setLoadingProductId(product.id);

    const existing = localStorage.getItem("cartItems");
    const cart: any[] = existing ? JSON.parse(existing) : [];
    const priceNum = Number(product.price);
    const newPrice = Number(product.new_price ?? 0);
    const discPrice = Number(product.discounted_price ?? 0);

    const hasPromo = !!product.applied_promocode;
    let unitPrice = priceNum;
    if (newPrice > 0) {
      unitPrice = newPrice;
    } else if (product.pre_order_discount_applied) {
      unitPrice = discPrice;
    } else if (product.applied_promocode) {
      unitPrice = discPrice;
    }

    const idx = cart.findIndex((item) => item.id === product.id);

    if (idx > -1) {
      cart[idx].quantity = (cart[idx].quantity || 1) + 1;
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
    setCartItems(cart);

    setCartItemCount(cart.reduce((sum, item) => sum + (item.quantity || 0), 0));
    window.dispatchEvent(new Event("cartUpdated"));

    setLoadingProductId(null);
    toast.success(`${product.name} დაემატა კალათაში!`);
  };

  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const prevImg = () =>
    setCurrentImgIdx((i) =>
      i === 0 ? (selectedProduct?.images!.length ?? 1) - 1 : i - 1
    );
  const nextImg = () =>
    setCurrentImgIdx((i) => (i + 1) % (selectedProduct?.images!.length ?? 1));

  const handleAddToCart = async (product: ProductType) => {
    setLoadingProductId(product.id);
    await new Promise((resolve) => setTimeout(resolve, 300));
    addToCart(product);
    setLoadingProductId(null);
  };
  const [view, setView] = useState<string>("body");
  const show = (v: string) => () => setView(v);
  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved && saved !== lang) {
      setLang(saved as "ka" | "en");
    }
  }, []);
  const filteredProducts = searchTerm
    ? products.filter((p) => {
      const term = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        (p.code && p.code.toLowerCase().includes(term))
      );
    })
    : newArrivals;

  const handlePreOrder = async (product: ProductType, qty: number) => {
    setLoadingProductId(product.id);
    try {
      const response = await axios.post("/pre-orders", {
        product_id: product.id,
        customer_name: user?.name || "",
        customer_email: user?.email || "",
        customer_phone: user?.mobile_number || "",
        quantity: qty, // ✅ use the qty passed in
        note: "",
      });

      toast.success(
        response.data.message || "წინასწარი შეკვეთა წარმატებით განხორციელდა!"
      );

      setProducts((arr) =>
        arr.map((p) =>
          p.id === product.id
            ? { ...p, already_preordered: true, preorder_qty: qty } // ✅ save correct qty
            : p
        )
      );

      setNewArrivals((arr) =>
        arr.map((p) =>
          p.id === product.id
            ? { ...p, already_preordered: true, preorder_qty: qty }
            : p
        )
      );
    } catch (error) {
      toast.error("შეცდომა წინასწარი შეკვეთის დროს.");
      console.error(error);
    } finally {
      setLoadingProductId(null);
    }
  };
  const updatePreOrderQty = (productId: number, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, preorder_qty: Math.max((p.preorder_qty ?? 1) + delta, 1) }
          : p
      )
    );

    setNewArrivals((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, preorder_qty: Math.max((p.preorder_qty ?? 1) + delta, 1) }
          : p
      )
    );
  };

  return (
    <>
      <Header />
      <CookieConsent />
      <Head>
        <title>General Technology asdadasdads</title>
        <link
          rel="preload"
          as="image"
          href="/images/CarouselIMG/generalis-webiscover.jpg"
        />
      </Head>

      <Toaster />
      <div className="bg-white">
        {showBody && (
          <div className=" bg-gradient-to-br from-gray-100 via-white to-gray-200 pb-10">
            <div className="w-full    p-6 text-gray-900 ">
              <div
                ref={searchRef}
                className="relative flex w-full justify-end"
              >
                <div className="relative flex items-center gap-3 rounded-full border border-white/60 bg-white/75 px-2 py-2 shadow-[0_18px_45px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                  <AnimatePresence>
                    {searchOpen && (
                      <motion.div
                        initial={{ width: 0, opacity: 0, x: 16 }}
                        animate={{ width: "min(26rem, calc(100vw - 7rem))", opacity: 1, x: 0 }}
                        exit={{ width: 0, opacity: 0, x: 16 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="relative">
                          <IoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t("body.energy.searchInProduct")}
                            className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-900 shadow-inner outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                            style={{ zIndex: 10 }}
                            autoComplete="off"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => setSearchOpen((prev) => !prev)}
                    aria-label="Toggle search"
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-all duration-300 ${
                      searchOpen
                        ? "bg-slate-900 shadow-[0_14px_30px_rgba(15,23,42,0.22)]"
                        : "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_14px_30px_rgba(16,185,129,0.28)] hover:scale-105 hover:from-emerald-600 hover:to-emerald-700"
                    }`}
                  >
                    <IoSearch size={20} />
                  </button>
                </div>

                <AnimatePresence>
                  {searchOpen && searchTerm && (
                    <motion.div
                      initial={{ opacity: 0, y: 16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="absolute right-0 top-16 z-30 max-h-[60vh] w-[calc(100vw-2rem)] overflow-y-auto rounded-[1.5rem] border border-slate-200 bg-white/95 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:w-[400px] lg:w-[640px]"
                    >
                      <div className="mb-4 rounded-[1.35rem] border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                              {t("body.energy.searchResults")}
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-700">
                              {t("body.energy.searchResultsFound").replace(
                                "{count}",
                                String(filteredProducts.length)
                              )}
                            </p>
                          </div>

                          <div className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-slate-100">
                            {searchTerm.trim() || t("body.energy.allProducts")}
                          </div>
                        </div>
                      </div>

                      {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                          {filteredProducts.map((product) => (
                            <Link
                              key={product.id}
                              href={route("products.show", {
                                product: product.id,
                                name: slugify(product.name, { lower: true }),
                              })}
                              className="group block"
                            >
                              <motion.div
                                key={product.id}
                                variants={{
                                  hidden: { opacity: 0, x: 20 },
                                  visible: { opacity: 1, x: 0 },
                                }}
                                initial="hidden"
                                animate="visible"
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3 rounded-[1.25rem] border border-slate-100 bg-white p-3 shadow-[0_6px_20px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]"
                              >
                                <Link
                                  href={route("products.show", {
                                    product: product.id,
                                    name: slugify(product.name, {
                                      lower: true,
                                    }),
                                  })}
                                  className="hidden"
                                ></Link>
                                <div className="relative flex h-20 w-20 flex-none items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-white">
                                  <img
                                    src={getProductImageUrl(product)}
                                    alt={product.name}
                                    className="h-full w-full object-contain p-2.5 transition-transform duration-300 group-hover:scale-[1.05]"
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h4 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900 group-hover:text-emerald-700">
                                    {product.name}
                                  </h4>
                                  <p className="mt-1 text-sm font-black text-emerald-600">
                                    {product.new_price !== null &&
                                      product.new_price !== undefined &&
                                      Number(product.new_price) !== 0 ? (
                                      <>
                                        <span className="line-through text-gray-500 mr-2">
                                          {isNaN(Number(product.price))
                                            ? "0.00"
                                            : Number(product.price).toFixed(
                                              2
                                            )}{" "}
                                          ₾
                                        </span>
                                        <span>
                                          {isNaN(Number(product.new_price))
                                            ? "0.00"
                                            : Number(product.new_price).toFixed(
                                              2
                                            )}{" "}
                                          ₾
                                        </span>
                                      </>
                                    ) : product.applied_promocode ? (
                                      <>
                                        <span className="line-through text-gray-500 mr-2">
                                          {isNaN(Number(product.price))
                                            ? "0.00"
                                            : Number(product.price).toFixed(
                                              2
                                            )}{" "}
                                          ₾
                                        </span>
                                        <span>
                                          {isNaN(
                                            Number(product.discounted_price)
                                          )
                                            ? "0.00"
                                            : Number(
                                              product.discounted_price
                                            ).toFixed(2)}{" "}
                                          ₾
                                        </span>
                                      </>
                                    ) : (
                                      <span>
                                        {isNaN(Number(product.price))
                                          ? "0.00"
                                          : Number(product.price).toFixed(
                                            2
                                          )}{" "}
                                        ₾
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </motion.div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                            <IoSearch size={20} />
                          </div>
                          <div className="text-sm font-semibold text-slate-900">
                            {t("body.energy.noProducts")}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {t("body.energy.searchTip")}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="relative pt-10 flex">
              <div className="relative w-full mx-auto mt-10 px-2 sm:px-4 max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">

                <img
                  src={carouselImages[currentIndex]}
                  alt={`Carousel Image ${currentIndex}`}
                  className="w-full h-full object-cover rounded-xl transition-none shadow-lg"
                />

                {/* LEFT ARROW */}
                <button
                  onClick={handlePrev}
                  className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 
      rounded-full bg-white/80 p-3 shadow-lg backdrop-blur-md 
      transition hover:scale-110 hover:bg-white"
                >
                  <ChevronLeft size={22} className="text-black" />
                </button>

                {/* RIGHT ARROW */}
                <button
                  onClick={handleNext}
                  className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 
      rounded-full bg-white/80 p-3 shadow-lg backdrop-blur-md 
      transition hover:scale-110 hover:bg-white"
                >
                  <ChevronRight size={22} className="text-black" />
                </button>

                {/* DOTS */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`rounded-full transition-all duration-300 ${index === currentIndex
                          ? "w-10 h-2.5 bg-white shadow-md"
                          : "w-2.5 h-2.5 bg-white/60 hover:bg-white"
                        }`}
                    />
                  ))}
                </div>

              </div>
            </div>
            <div className="w-full mx-auto mt-10 px-2 sm:px-4 max-w-full sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl">
              <div className="rounded-[24px] border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                      {t("body.newArrivals")}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {newArrivals.length} პროდუქტი
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-[1.6rem] border border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                          <div className="absolute inset-3 rounded-full bg-slate-200/70 blur-2xl" />
                          <div className="absolute inset-0 p-6">
                            <div className="h-full w-full rounded-[1.2rem] bg-slate-200" />
                          </div>
                        </div>
                        <div className="px-3.5 py-3.5">
                          <div className="mb-3 space-y-2">
                            <div className="h-3 w-20 rounded bg-slate-200" />
                            <div className="h-5 w-full rounded bg-slate-200" />
                            <div className="h-4 w-24 rounded-full bg-slate-100" />
                          </div>
                          <div className="flex items-end justify-between border-t border-slate-100 pt-3">
                            <div className="space-y-2">
                              <div className="h-3 w-14 rounded bg-slate-100" />
                              <div className="h-6 w-24 rounded bg-slate-200" />
                            </div>
                            <div className="h-9 w-9 rounded-2xl border border-slate-200 bg-white" />
                          </div>
                        </div>
                      </div>
                    ))
                    : newArrivals.map((product) => {
                      const originalPrice = Number(product.price || 0);
                      const newPrice = Number(product.new_price || 0);
                      const discountedPrice = Number(product.discounted_price || 0);

                      const hasNewPrice = newPrice > 0;
                      const hasDiscounted =
                        (product.applied_promocode || product.pre_order_discount_applied) &&
                        discountedPrice > 0 &&
                        discountedPrice < originalPrice;

                      const finalPrice = hasNewPrice
                        ? newPrice
                        : hasDiscounted
                          ? discountedPrice
                          : originalPrice;

                      const oldPrice =
                        hasNewPrice || hasDiscounted ? originalPrice : null;
                      const discount =
                        oldPrice && oldPrice > 0
                          ? Math.max(
                              0,
                              Math.floor(((oldPrice - finalPrice) / oldPrice) * 100)
                            )
                          : 0;

                      const imageUrl =
                        Array.isArray(product.images) && product.images.length
                          ? typeof product.images[0] === "string"
                            ? product.images[0]
                            : product.images[0]?.url ?? "/images/placeholder.png"
                          : product.image ?? "/images/placeholder.png";

                      return (
                        <Link
                          key={product.id}
                          href={route("products.show", {
                            product: product.id,
                            name: slugify(product.name, { lower: true }),
                          })}
                          className="group block h-full"
                        >
                          <motion.div
                            className="relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-500 hover:-translate-y-1 hover:border-emerald-100 hover:shadow-[0_20px_44px_-18px_rgba(15,23,42,0.14)]"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                          >
                            <div className="relative aspect-[1/1] overflow-hidden rounded-[1.6rem] border border-slate-100 bg-gradient-to-b from-slate-50 to-white">
                              <div className="absolute inset-x-2.5 top-2.5 z-20 flex items-start justify-between">
                                <div className={`flex items-center gap-1 rounded-full border px-2.5 py-1 shadow-sm backdrop-blur-md ${product.in_stock > 0 ? "border-emerald-100 bg-white/90 text-emerald-700" : "border-slate-200 bg-white/90 text-slate-500"
                                  }`}>
                                  <div className={`h-1.5 w-1.5 rounded-full ${product.in_stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                                  <span className="text-[9px] font-bold uppercase tracking-wide">
                                    {product.in_stock > 0 ? t("body.energy.inStock") : t("body.energy.outOfStock")}
                                  </span>
                                </div>

                                {discount > 0 && (
                                  <div className="rounded-full bg-emerald-600 px-2.5 py-1 text-[9px] font-black text-white shadow-lg shadow-emerald-200/40">
                                    -{discount}%
                                  </div>
                                )}
                              </div>

                              <div className="flex h-full w-full items-center justify-center p-6 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="h-full w-full object-contain drop-shadow-xl"
                                />
                              </div>

                              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <div className="flex items-center gap-2 translate-y-4 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-900 shadow-2xl transition-transform duration-500 group-hover:translate-y-0">
                                  <Eye size={13} />
                                  {t("body.energy.view")}
                                </div>
                              </div>
                            </div>

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

                              <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
                                <div className="flex flex-col">
                                  {oldPrice ? (
                                    <span className="text-[11px] font-semibold text-slate-400 line-through">
                                      {oldPrice.toFixed(2)} ₾
                                    </span>
                                  ) : null}
                                  <div className="flex items-baseline gap-1 text-slate-900">
                                    <span className="text-xl font-black tracking-tight">
                                      {Math.floor(finalPrice)}
                                    </span>
                                    <span className="text-xs font-bold text-slate-500">
                                      .{Number(finalPrice % 1).toFixed(2).slice(2)} ₾
                                    </span>
                                  </div>
                                </div>

                                <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm transition-all duration-300 group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:scale-105">
                                  <ArrowRight size={16} />
                                </div>
                              </div>

                              {product.in_stock > 0 ? (
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
                                      {t("body.energy.addToCart")}
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="h-4 w-4" />
                                      {t("body.energy.addToCart")}
                                    </>
                                  )}
                                </motion.button>
                              ) : (
                                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                  {t("body.energy.outOfStock")}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </Link>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
