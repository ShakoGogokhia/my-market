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
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 shadow-md">
      <Head title="General Technology"></Head>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-20 flex justify-between items-center px-4 py-4 ">
          <Link
            href={route("home")}
            className="flex items-center gap-2 whitespace-nowrap "
          >
            <div className="h-16 flex items-center">
              <img
                src={logo}
                alt="Logo"
                className="w-50 h-50 object-contain"
              />
            </div>
          </Link>

          <div className="xl:hidden">
            <Sheet modal={false}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="p-2 rounded-full">
                  <FaBars className="text-xl text-gray-700" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="top"
                className="
      w-full mt-20
      max-h-[calc(100vh-5rem)] overflow-y-auto
      rounded-b-3xl p-6 space-y-6 bg-white shadow-xl
    "
              >
                <nav className="space-y-4 text-green-800 font-semibold text-base">
                  <div>
                    <button
                      onClick={() => setShowProducts(!showProducts)}
                      className="block w-full text-left hover:underline font-semibold text-green-800"
                    >
                      {t("footer.products")}
                    </button>

                    {showProducts && (
                      <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg p-3">
                        <ProductsDropdown />
                      </div>
                    )}
                  </div>
                  <a href="/company" className="block hover:underline">
                    {t("nav.company")}
                  </a>
                  <a href="/payment" className="block hover:underline">
                    {t("nav.paymantTerm")}
                  </a>
                  <a href="/warranty" className="block hover:underline">
                    {t("nav.warrantyTerm")}
                  </a>
                  <a href="/vacansy" className="block hover:underline">
                    {t("nav.vacancy")}
                  </a>
                  <a href="/contact" className="block hover:underline">
                    {t("nav.contact")}
                  </a>
                  <a href="/cart" className="block hover:underline">
                    {t("footer.cart")}
                  </a>
                  <a href="/Programs" className="block hover:underline">
                    {t("nav.Programs")}
                  </a>
                  <div className="relative inline-block">
                    <div className="absolute top-2 left-2 flex items-center pointer-events-none">
                      <img
                        src={languages.find((l) => l.code === lang)?.flag || ""}
                        alt="Flag"
                        className="w-5 h-5 mr-2"
                      />
                    </div>
                    <select
                      value={lang}
                      onChange={handleLanguageChange}
                      className="border px-1 py-1 rounded text-lg"
                    >
                      <option value="ka">🇬🇪 ქართული</option>
                      <option value="en">🇬🇧 English</option>
                      <option value="ru">🇷🇺 Русский</option>
                    </select>
                  </div>
                </nav>

                <hr />

                {auth.user ? (
                  <div className="space-y-2 text-green-700 font-medium">
                    <div>{auth.user.name}</div>
                    {auth.user.admin && (
                      <a href="/dashboard" className="block hover:underline">
                        {t("body.nav.adminPanel")}
                      </a>
                    )}
                    <a href="/currentorders" className="block hover:underline">
                      {t("body.nav.currentOrders")}
                    </a>
                    <a
                      href="/complatedorders"
                      className="block hover:underline"
                    >
                      {t("body.nav.completedOrders")}
                    </a>
                    <a href="/warranty" className="block hover:underline">
                      {t("body.nav.warranty")}
                    </a>
                    <a
                      href="/personalinformation"
                      className="block hover:underline"
                    >
                      {t("body.nav.profile")}
                    </a>
                    <a href="/changepassword" className="block hover:underline">
                      {t("body.nav.changePassword")}
                    </a>
                    {user?.total_credit > 0 && (
                      <div className="text-yellow-600 font-semibold text-sm">
                        დაგროვილი კრედიტი:{" "}
                        <span className="bg-yellow-200 px-2 py-1 rounded">
                          {user.total_credit} ₾
                        </span>
                      </div>
                    )}

                    <Link
                      method="post"
                      href={route("logout")}
                      as="button"
                      className="block text-red-600 hover:underline"
                    >
                      {t("body.nav.logout")}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <a href="/login">
                      <Button className="w-full bg-green-600 text-white mb-5">
                        {t("body.nav.login")}
                      </Button>
                    </a>
                    <a href="/register">
                      <Button
                        variant="outline"
                        className="w-full border-green-600 text-green-700 hover:bg-green-50"
                      >
                        {t("body.nav.register")}
                      </Button>
                    </a>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
          <nav className="hidden xl:flex items-center gap-6 text-sm text-gray-800 font-bold">
            <a href="/" className="mr-5">
              {t("body.energy.backToProducts")}
            </a>

            <a
              onClick={() => setShowProducts(!showProducts)}
              className="mr-5 cursor-pointer"
            >
              {t("footer.products")}
            </a>

            {showProducts && (
              <div className="absolute left-0 top-full w-full bg-transparent z-40 pointer-events-none">
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
                  <button className="flex items-center gap-1 text-sm focus:outline-none focus:ring-0  transition">
                    {t("nav.aboutUs")} <IoIosArrowDown className="w-4 h-4" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  sideOffset={4}
                  align="start"
                  className="w-48 rounded-md border border-gray-200  bg-white  p-2 z-50 shadow-lg"
                >
                  <nav className="flex flex-col space-y-1">
                    <a
                      href="/company"
                      className="block px-3 py-2 rounded-md text-sm text-gray-700  hover:bg-gray-100  transition"
                    >
                      {t("nav.company")}
                    </a>
                    <a
                      href="/vacansy"
                      className="block px-3 py-2 rounded-md text-sm text-gray-700  hover:bg-gray-100  transition"
                    >
                      {t("nav.vacancy")}
                    </a>
                    <a
                      href="/contact"
                      className="block px-3 py-2 rounded-md text-sm text-gray-700  hover:bg-gray-100  transition"
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
                  <button className="flex items-center gap-1 text-sm focus:outline-none focus:ring-0   transition">
                    {t("nav.terms")} <IoIosArrowDown className="w-4 h-4" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  sideOffset={4}
                  align="start"
                  className="w-48 rounded-md border border-gray-200  bg-white  p-2 z-50 shadow-lg"
                >
                  <nav className="flex flex-col space-y-1">
                    <a
                      href="/payment"
                      className="block px-3 py-2 rounded-md text-sm text-gray-700  hover:bg-gray-100  transition"
                    >
                      {t("nav.paymantTerm")}
                    </a>
                    <a
                      href="/warranty"
                      className="block px-3 py-2 rounded-md text-sm text-gray-700  hover:bg-gray-100  transition"
                    >
                      {t("nav.warrantyTerm")}
                    </a>
                  </nav>
                </PopoverContent>
              </Popover>
            </div>

            <a href="/Programs" className="block ">
              {t("nav.Programs")}
            </a>
          </nav>

          <div className="hidden xl:flex items-center gap-4">
            <div className="relative inline-block">
              <div className="absolute top-2 left-2 flex items-center pointer-events-none">
                <img
                  src={languages.find((l) => l.code === lang)?.flag || ""}
                  alt="Flag"
                  className="w-5 h-5 mr-2"
                />
              </div>
              <select
                value={lang}
                onChange={handleLanguageChange}
                className="border px-1 py-1 rounded text-lg"
              >
                <option value="ka">🇬🇪</option>
                <option value="en">ᴇɴ</option>
                <option value="ru">🇷🇺</option>
              </select>
            </div>
            <div className="relative group ">
              <div className="border border-gray-300  rounded-full p-2 transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-lg group-hover:border-gray-400">
                <a href="/cart">
                  {" "}
                  <FaShoppingCart className="text-gray-600  cursor-pointer w-7 h-7 transition-colors duration-300 group-hover:text-green-600" />
                </a>
              </div>
              {cartItemCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 shadow-md font-semibold animate-pulse">
                  {cartItemCount}
                </div>
              )}
            </div>

            <div className="relative">
              {auth.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-green-600 text-white rounded-full px-4 py-2 cursor-pointer">
                      {t("body.nav.account")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white shadow-xl rounded-lg p-2 text-sm space-y-1">
                    {auth.user.admin && (
                      <div className="px-4 py-2 text-sm font-semibold text-gray-800">
                        {auth.user.name}: {t("body.nav.admin")}
                        <div className="mt-2">
                          <a href="/dashboard">
                            <Button>{t("body.nav.adminPanel")}</Button>
                          </a>
                        </div>
                      </div>
                    )}
                    {!auth.user.admin && (
                      <div className="px-4 py-2 text-sm text-gray-700">
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
                    <Button className="bg-green-600 hover:bg-green-700 transition transform hover:scale-105 text-white font-semibold px-4 py-2 rounded-xl shadow">
                      {t("body.nav.login")}
                    </Button>
                  </a>

                  <a href="/register">
                    <Button className="bg-white cursor-pointer text-black-500 transition transform hover:scale-105 text-black font-semibold px-4 py-2 rounded-xl shadow">
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
