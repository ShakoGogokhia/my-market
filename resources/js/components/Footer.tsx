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
  discount_percent: number;
  discounted_price: number;
  created_at: string;
  in_stock: number;
  brand: string;
  image: string;
  description: string;
  category: string;
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
    user: { id: number; name: string; email: string; admin: string } | null;
  };
};
const SkeletonCard = () => (
  <div className="animate-pulse bg-white rounded-2xl shadow p-4">
    <div className="h-32 bg-gray-300 rounded mb-4"></div>
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
);

export default function Footer() {
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
  const handleSelectProduct = (p: ProductType) => {
    setSelectedProduct(p);
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
      setLang(saved as "ka" | "en");
    }
  }, []);

  return (
    <>
      <footer className="bg-gray-500 text-white py-10 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold mb-4">
                {t("footer.about")}
              </h3>
              <ul className="space-y-1">
                <li>
                  <a className="cursor-pointer hover:underline" href="/company">
                    {t("nav.company")}
                  </a>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold mb-4">
                {t("footer.products")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/product" className="hover:underline">
                    {t("nav.products")}
                  </a>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold mb-4">
                {t("footer.rules")}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="/payment" className="hover:underline">
                    {t("nav.paymantTerm")}
                  </a>
                </li>
                <li>
                  <a
                    href="/warranty"
                    className="cursor-pointer hover:underline"
                  >
                    {t("nav.warrantyTerm")}
                  </a>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold mb-4">
                {t("footer.contactInfo")}
              </h3>
              <ul className="space-y-2">
                <li>+995 322185128</li>
                <li>+995 577322148</li>
                <li>
                  <a
                    href="mailto:sale@intellcom.net"
                    className="hover:underline"
                  >
                    info@airlink.ge
                  </a>
                </li>
                <li>დიდი დიღომი, ბარონ დე ბაის #44</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-400 mt-10 pt-4 text-center text-sm">
            © 2025 General Technology. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}
