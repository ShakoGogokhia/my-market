import { Head, Link, usePage } from "@inertiajs/react";
import { useState, useEffect, SetStateAction, useRef } from "react";
import { FaHeart, FaShoppingCart, FaBars } from "react-icons/fa";
import { AnimatePresence } from "framer-motion";
import { IoIosArrowDown } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
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
import logo from "../../../public/images/Logo/Logo.png";
import { Button } from "../components/ui/button.js";
import { Input } from "../components/ui/input.js";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "../components/ui/label.js";
import { LogOut, Settings } from "lucide-react";
import { Loader2 } from "lucide-react";
import { type BreadcrumbItem } from "@/types";
import { motion } from "framer-motion";
import { useTranslation } from "@/translation";
import ProductsDropdown from "@/components/ProductsDropdown";
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
import PublicLayout from "@/layouts/PublicLayout";

export default function Header() {
  const [loading, setLoading] = useState(true);
  const { lang, setLang, t } = useTranslation();
  const [loadingProductId, setLoadingProductId] = useState(null);
  const cleanup = useMobileNavigation();
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );

  const [newArrivals, setNewArrivals] = useState<ProductType[]>([]);
  const { auth } = usePage().props as unknown as SharedData;
  const user = auth?.user;
  const [showBody, setShowBody] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);
  const [openInformation, setopenInformation] = useState(false);
  const termsTimer = useRef<NodeJS.Timeout | null>(null);
  const handleTermsMouseEnter = () => {
    if (termsTimer.current) clearTimeout(termsTimer.current);
    setOpenTerms(true);
  };
  const handleTermsMouseLeave = () => {
    termsTimer.current = setTimeout(() => setOpenTerms(false), 150);
  };
  const handleTermsMouseEnterInfo = () => {
    if (termsTimer.current) clearTimeout(termsTimer.current);
    setopenInformation(true);
  };
  const handleTermsMouseLeaveInfo = () => {
    termsTimer.current = setTimeout(() => setopenInformation(false), 150);
  };
  const handleSelectProduct = (p: ProductType) => {
    setSelectedProduct(p);
  };

  const handleBackToGrid = () => {
    setSelectedProduct(null);
  };
  const resetViews = () => {
    setShowBody(false);
    showLogin,
      showRegister,
      showCompany,
      showContact,
      showCart,
      showEnergyProduct,
      showCurrentOrders,
      showCompletedOrders,
      showReturns,
      showProfile,
      showChangePassword,
      showVacancy,
      showPaymentTerms,
      showWarranty,
      showPromoCode;
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
    {
      code: "ru",
      label: "Русский",
      flag: "https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg",
    },
  ];

  const handleChange = (e: { target: { value: SetStateAction<string> } }) => {
    setLanguage(e.target.value);
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);
  const carouselImages = [
    "https://www.intellcom.ge/files/slider/1741096969467.png",
    "https://www.intellcom.ge/files/slider/1728048068765.png",
    "https://www.intellcom.ge/files/slider/1742474368819.png",
    "https://www.intellcom.ge/files/slider/1728048068765.png",
    "https://www.intellcom.ge/files/slider/1741096969467.png",
    "https://www.intellcom.ge/files/slider/1742474368819.png",
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

  const handleLanguageChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    const newLang = e.target.value as "ka" | "en";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };
  const currentLanguage = languages.find((item) => item.code === lang) || languages[0];

  const addToCart = (product: ProductType) => {
    setLoadingProductId(product.id);

    const existing = localStorage.getItem("cartItems");
    const cart: any[] = existing ? JSON.parse(existing) : [];

    const hasPromo = !!product.applied_promocode;
    const unitPrice = hasPromo ? product.discounted_price : product.price;

    const idx = cart.findIndex((item) => item.id === product.id);

    if (idx > -1) {
      cart[idx].quantity = (cart[idx].quantity || 1) + 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: unitPrice,
        image: product.image,
        quantity: 1,
        oldPrice: hasPromo ? product.price : null,
      });
    }

    localStorage.setItem("cartItems", JSON.stringify(cart));
    setCartItems(cart);

    const newCount = cart.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
    setCartItemCount(newCount);

    setLoadingProductId(null);
    toast.success(`${product.name} დაემატა კალათაში!`);
  };

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
      setLang(saved as "ka" | "en" | "ru");
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <Head title="General Technology"></Head>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={route("home")}
            className="flex items-center gap-2 whitespace-nowrap rounded-2xl px-2 py-1"
          >
            <div className="relative flex h-24 w-[180px] flex-none items-center overflow-visible">
              <img
                src={logo}
                alt="Logo"
                className="absolute left-0 top-1/2 h-24 w-auto max-w-none origin-left -translate-y-1/2 scale-[1.6] object-contain"
              />
            </div>
          </Link>

          <div className="xl:hidden">
            <Sheet modal={false}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-11 w-11 rounded-2xl border border-slate-200 bg-white p-0 text-slate-700 shadow-sm hover:bg-slate-50 hover:text-emerald-600"
                >
                  <FaBars className="text-lg" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="top"
                className="mt-20 max-h-[calc(100vh-5rem)] w-full overflow-y-auto rounded-b-[32px] border-t border-slate-100 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]"
              >
                <nav className="space-y-4 text-base font-semibold text-slate-800">
                  <div>
                    <button
                      onClick={() => setShowProducts(!showProducts)}
                      className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-slate-900 transition hover:border-emerald-200 hover:bg-emerald-50"
                    >
                      {t("footer.products")}
                    </button>

                    {showProducts && (
                      <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                        <ProductsDropdown />
                      </div>
                    )}
                  </div>
                  <a href="/company" className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50">
                    {t("nav.company")}
                  </a>
                  <a href="/payment" className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50">
                    {t("nav.paymantTerm")}
                  </a>
                  <a href="/warranty" className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50">
                    {t("nav.warrantyTerm")}
                  </a>
                  <a href="/vacansy" className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50">
                    {t("nav.vacancy")}
                  </a>
                  <a href="/contact" className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50">
                    {t("nav.contact")}
                  </a>
                  <a href="/cart" className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50">
                    {t("footer.cart")}
                  </a>
                  <a href="/Programs" className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50">
                    {t("nav.Programs")}
                  </a>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50">
                        <span className="flex items-center gap-3">
                          <img
                            src={currentLanguage.flag}
                            alt={`${currentLanguage.label} flag`}
                            className="h-5 w-5 rounded-full object-cover"
                          />
                          <span className="text-sm font-semibold text-slate-900">
                            {currentLanguage.label}
                          </span>
                        </span>
                        <IoIosArrowDown className="h-4 w-4 text-slate-400" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="bottom"
                      align="start"
                      className="z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
                    >
                      <div className="space-y-1">
                        {languages.map((item) => (
                          <button
                            key={item.code}
                            onClick={() => {
                              setLang(item.code as "ka" | "en" | "ru");
                              localStorage.setItem("lang", item.code);
                            }}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                              lang === item.code
                                ? "bg-emerald-50 font-semibold text-emerald-700"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <img
                              src={item.flag}
                              alt={`${item.label} flag`}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </nav>

                <hr className="my-5 border-slate-200" />

                {auth.user ? (
                  <div className="space-y-3 font-medium text-slate-700">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 font-semibold text-slate-900">
                      {auth.user.name}
                    </div>
                    {auth.user.admin && (
                      <a
                        href="/dashboard"
                        className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50"
                      >
                        {t("body.nav.adminPanel")}
                      </a>
                    )}
                    <a
                      href="/currentorders"
                      className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50"
                    >
                      {t("body.nav.currentOrders")}
                    </a>
                    <a href="/complatedorders" className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50">
                      {t("body.nav.completedOrders")}
                    </a>
                    <a
                      href="/warranty"
                      className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50"
                    >
                      {t("body.nav.warranty")}
                    </a>
                    <a href="/personalinformation" className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50">
                      {t("body.nav.profile")}
                    </a>
                    <a
                      href="/changepassword"
                      className="block rounded-2xl px-4 py-3 transition hover:bg-slate-50"
                    >
                      {t("body.nav.changePassword")}
                    </a>
                    {user?.total_credit > 0 && (
                      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
                        დაგროვილი კრედიტი:{" "}
                        <span className="ml-1 rounded-full bg-amber-200 px-2 py-1 text-amber-900">
                          {user.total_credit} ₾
                        </span>
                      </div>
                    )}

                    <Link
                      method="post"
                      href={route("logout")}
                      as="button"
                      className="block w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-left text-red-600 transition hover:bg-red-100"
                    >
                      {t("body.nav.logout")}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <a href="/login">
                      <Button className="mb-5 h-12 w-full rounded-2xl bg-emerald-600 text-white shadow-[0_12px_30px_rgba(16,185,129,0.22)] transition hover:bg-emerald-700">
                        {t("body.nav.login")}
                      </Button>
                    </a>
                    <a href="/register">
                      <Button
                        variant="outline"
                        className="h-12 w-full rounded-2xl border-slate-200 text-slate-900 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        {t("body.nav.register")}
                      </Button>
                    </a>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
          <nav className="hidden xl:flex items-center gap-2 text-sm font-semibold text-slate-700">
            <a
              href="/"
              className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950"
            >
              {t("body.energy.backToProducts")}
            </a>

            <a
              onClick={() => setShowProducts(!showProducts)}
              className="cursor-pointer rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950"
            >
              {t("footer.products")}
            </a>

            {showProducts && (
              <div className="absolute left-0 top-full z-40 w-full bg-transparent pointer-events-none">
                <div className="pointer-events-auto">
                  <ProductsDropdown />
                </div>
              </div>

            )}

            <div
              className="relative"
              onMouseEnter={handleTermsMouseEnterInfo}
              onMouseLeave={handleTermsMouseLeaveInfo}
            >
              <Popover open={openInformation} onOpenChange={setopenInformation}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-0">
                    {t("nav.aboutUs")} <IoIosArrowDown className="w-4 h-4" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  sideOffset={4}
                  align="start"
                  className="z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
                >
                  <nav className="flex flex-col space-y-1">
                    <a
                      href="/company"
                      className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      {t("nav.company")}
                    </a>
                    <a
                      href="/vacansy"
                      className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      {t("nav.vacancy")}
                    </a>
                    <a
                      href="/contact"
                      className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      {t("nav.contact")}
                    </a>
                  </nav>
                </PopoverContent>
              </Popover>
            </div>
            <div
              className="relative"
              onMouseEnter={handleTermsMouseEnter}
              onMouseLeave={handleTermsMouseLeave}
            >
              <Popover open={openTerms} onOpenChange={setOpenTerms}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 rounded-full px-4 py-2 text-sm transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-0">
                    {t("nav.terms")} <IoIosArrowDown className="w-4 h-4" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  sideOffset={4}
                  align="start"
                  className="z-50 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
                >
                  <nav className="flex flex-col space-y-1">
                    <a
                      href="/payment"
                      className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      {t("nav.paymantTerm")}
                    </a>
                    <a
                      href="/warranty"
                      className="block rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      {t("nav.warrantyTerm")}
                    </a>
                  </nav>
                </PopoverContent>
              </Popover>
            </div>

            <a
              href="/Programs"
              className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-950"
            >
              {t("nav.Programs")}
            </a>
          </nav>

          <div className="hidden items-center gap-4 xl:flex">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex h-11 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50">
                  <img
                    src={currentLanguage.flag}
                    alt={`${currentLanguage.label} flag`}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline">{currentLanguage.label}</span>
                  <span className="sm:hidden">{lang.toUpperCase()}</span>
                  <IoIosArrowDown className="h-4 w-4 text-slate-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="bottom"
                align="end"
                className="z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
              >
                <div className="space-y-1">
                  {languages.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLang(item.code as "ka" | "en" | "ru");
                        localStorage.setItem("lang", item.code);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                        lang === item.code
                          ? "bg-emerald-50 font-semibold text-emerald-700"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <img
                        src={item.flag}
                        alt={`${item.label} flag`}
                        className="h-5 w-5 rounded-full object-cover"
                      />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <div className="relative group ">
              <div className="rounded-full border border-slate-200 bg-white p-2.5 shadow-sm transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:border-emerald-200 group-hover:shadow-md">
                <a href="/cart">
                  {" "}
                  <FaShoppingCart className="h-7 w-7 cursor-pointer text-slate-600 transition-colors duration-300 group-hover:text-emerald-600" />
                </a>
              </div>
              {cartItemCount > 0 && (
                <div className="absolute -right-1 -top-1 animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white shadow-md">
                  {cartItemCount}
                </div>
              )}
            </div>

            <div className="relative">
              {auth.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="cursor-pointer rounded-full bg-emerald-600 px-4 py-2 text-white shadow-[0_12px_30px_rgba(16,185,129,0.22)] transition hover:bg-emerald-700">
                      {t("body.nav.account")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="space-y-1 rounded-2xl border border-slate-200 bg-white p-2 text-sm shadow-[0_18px_45px_rgba(15,23,42,0.12)]">
                    {auth.user.admin && (
                      <div className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-800">
                        {auth.user.name}: {t("body.nav.admin")}
                        <div className="mt-2">
                          <a href="/dashboard">
                            <Button>{t("body.nav.adminPanel")}</Button>
                          </a>
                        </div>
                      </div>
                    )}
                    {!auth.user.admin && (
                      <div className="rounded-xl px-4 py-2 text-sm text-slate-700">
                        {auth.user.name}
                      </div>
                    )}
                    <DropdownMenuSeparator />

                    <a href="/currentorders">
                      <DropdownMenuItem>
                        {t("body.nav.currentOrders")}
                      </DropdownMenuItem>
                    </a>

                    <a href="/complatedorders">
                      <DropdownMenuItem>
                        {t("body.nav.completedOrders")}
                      </DropdownMenuItem>
                    </a>

                    <DropdownMenuSeparator />
                    <a href="/warranty">
                      <DropdownMenuItem>
                        {t("body.nav.warranty")}
                      </DropdownMenuItem>
                    </a>
                    <DropdownMenuSeparator />
                    <a href="/personalinformation">
                      {" "}
                      <DropdownMenuItem>
                        {t("body.nav.profile")}
                      </DropdownMenuItem>
                    </a>
                    {user?.total_credit > 0 && (
                      <DropdownMenuItem>
                        <div className="text-yellow-600 font-semibold text-sm">
                          დაგროვილი კრედიტი:{" "}
                          <span className="bg-yellow-200 px-2 py-1 rounded">
                            {user.total_credit} ₾
                          </span>
                        </div>
                      </DropdownMenuItem>
                    )}

                    <a href="/changepassword">
                      <DropdownMenuItem>
                        {t("body.nav.changePassword")}
                      </DropdownMenuItem>
                    </a>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Link
                        className="block w-full"
                        method="post"
                        href={route("logout")}
                        as="button"
                        onClick={cleanup}
                      >
                        {t("body.nav.logout")}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <a href="/login">
                    <Button className="rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white shadow-[0_12px_30px_rgba(16,185,129,0.22)] transition hover:scale-105 hover:bg-emerald-700">
                      {t("body.nav.login")}
                    </Button>
                  </a>

                  <a href="/register">
                    <Button className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-900 shadow-sm transition hover:scale-105 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                      {t("body.nav.register")}
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
