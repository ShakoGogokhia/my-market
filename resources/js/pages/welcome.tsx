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
  const carouselImages = [
    "/images/CarouselIMG/generalis-webiscover.jpg",
    "/images/CarouselIMG/mymarketis-cover-1.jpg",
    "/images/CarouselIMG/generalis-3-coveri-chasasmeli.jpg",
    "/images/CarouselIMG/generalis-meore-coveri-chasasmeli.jpg",
  ];

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 3000);
  };
  const resetInterval = () => {
    clearInterval(intervalRef.current);
    startAutoSlide();
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(intervalRef.current);
  }, [carouselImages.length]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    resetInterval();
  };

  const handlePrev = () => {
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

  function getProductImageUrl(product) {
    if (Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === "string" && firstImage.trim() !== "") {
        return firstImage;
      }
      if (
        firstImage &&
        typeof firstImage === "object" &&
        typeof firstImage.url === "string" &&
        firstImage.url.trim() !== ""
      ) {
        return firstImage.url;
      }
    }
    if (
      product.image &&
      typeof product.image === "string" &&
      product.image.trim() !== ""
    ) {
      return product.image;
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
        <title>General Technology</title>
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
                className="relative flex items-center justify-end w-full"
              >
                <div className="relative flex items-center">
                  <AnimatePresence>
                    {searchOpen && (
                      <motion.input
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 250, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t("body.energy.searchInProduct")}
                        className="p-3 pl-4 pr-10 rounded-full border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 absolute right-12 bg-white"
                        style={{ zIndex: 10 }}
                      />
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => setSearchOpen((prev) => !prev)}
                    className="w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center transition-shadow shadow-md z-20"
                  >
                    <IoSearch size={20} />
                  </button>
                </div>

                <AnimatePresence>
                  {searchOpen && searchTerm && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="
             absolute top-16 right-0
             w-[calc(100%-2rem)] sm:w-[400px] lg:w-[600px]
             bg-white/90 backdrop-blur-md rounded-xl shadow-lg
             max-h-[60vh] overflow-y-auto
             p-4
             z-30
           "
                    >
                      {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                          {filteredProducts.map((product) => (
                            <Link
                              key={product.id}
                              href={route("products.show", {
                                product: product.id,
                                name: slugify(product.name, { lower: true }),
                              })}
                              className=""
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
                                className="flex items-center space-x-3 bg-white rounded-lg shadow p-3 hover:bg-gray-50 cursor-pointer"
                              >
                                <Link
                                  href={route("products.show", {
                                    product: product.id,
                                    name: slugify(product.name, {
                                      lower: true,
                                    }),
                                  })}
                                  className=""
                                ></Link>
                                <div className="relative flex items-center justify-center bg-gray-50 rounded-xl p-4">
                                  <img
                                    src={getProductImageUrl(product)}
                                    alt={product.name}
                                    className="w-20 h-20 object-contain rounded transition-all duration-300"
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-800 truncate">
                                    {product.name}
                                  </h4>
                                  <p className="text-green-600 font-bold">
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
                        <div className="text-center text-gray-500 py-8">
                          ვერ მოიძებნა პროდუქტი.
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {loading
                    ? Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm"
                      >
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
                            className="flex h-full min-h-[470px] flex-col overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                          >
                            <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-gray-50 to-slate-100 p-5">
                              <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
                                {product.brand && (
                                  <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-700 shadow-sm">
                                    {product.brand}
                                  </span>
                                )}

                                {(hasNewPrice || hasDiscounted) && (
                                  <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                                    SALE
                                  </span>
                                )}
                              </div>

                              <div className="flex min-h-[210px] items-center justify-center pt-6">
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="max-h-[190px] w-full object-contain transition duration-500 group-hover:scale-105"
                                />
                              </div>
                            </div>

                            <div className="flex flex-1 flex-col p-4">
                              <div className="mb-3">
                                <h3 className="line-clamp-2 min-h-[52px] text-[17px] font-black leading-6 text-gray-900">
                                  {product.name}
                                </h3>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                                  {product.category && (
                                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                                      {t(`categories.${product.category}`, {
                                        defaultValue: product.category,
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="mb-4">
                                {oldPrice ? (
                                  <div className="flex flex-wrap items-end gap-2">
                                    <span className="text-sm font-medium text-gray-400 line-through">
                                      {oldPrice.toFixed(2)} ₾
                                    </span>
                                    <span className="text-2xl font-black tracking-tight text-emerald-700">
                                      {finalPrice.toFixed(2)} ₾
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-2xl font-black tracking-tight text-gray-900">
                                    {finalPrice.toFixed(2)} ₾
                                  </span>
                                )}
                              </div>

                              <div className="mb-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${product.in_stock > 0
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                                >
                                  {product.in_stock > 0
                                    ? t("body.energy.inStock")
                                    : t("body.energy.outOfStock")}
                                </span>
                              </div>

                              {product.in_stock > 0 ? (
                                <motion.button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleAddToCart(product);
                                  }}
                                  disabled={loadingProductId === product.id}
                                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {loadingProductId === product.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      იტვირთება...
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="h-4 w-4" />
                                      {t("body.energy.addToCart")}
                                    </>
                                  )}
                                </motion.button>
                              ) : (
                                <div className="mt-auto space-y-3">
                                  <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-2.5">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updatePreOrderQty(product.id, -1);
                                      }}
                                      className="rounded-full bg-white p-2 shadow-sm transition hover:bg-gray-100"
                                    >
                                      -
                                    </button>

                                    <span className="min-w-[32px] text-center text-sm font-black text-gray-900">
                                      {product.preorder_qty ?? 1}
                                    </span>

                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updatePreOrderQty(product.id, 1);
                                      }}
                                      className="rounded-full bg-white p-2 shadow-sm transition hover:bg-gray-100"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <motion.button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();

                                      if (!isLoggedIn) {
                                        toast.error(
                                          "გთხოვთ, გაიაროთ ავტორიზაცია წინასწარი შეკვეთისთვის"
                                        );
                                        return;
                                      }

                                      handlePreOrder(product, product.preorder_qty ?? 1);
                                    }}
                                    disabled={
                                      loadingProductId === product.id ||
                                      product.already_preordered
                                    }
                                    className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition ${product.already_preordered
                                      ? "cursor-not-allowed bg-gray-400"
                                      : "bg-amber-500 shadow-md hover:bg-amber-600"
                                      }`}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {loadingProductId === product.id ? (
                                      <span className="inline-flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        იტვირთება...
                                      </span>
                                    ) : product.already_preordered ? (
                                      t("body.energy.alreadyPreOrdered")
                                    ) : (
                                      t("body.energy.preOrderButton")
                                    )}
                                  </motion.button>
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
