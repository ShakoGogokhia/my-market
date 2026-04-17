import React, { useEffect, useMemo, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaMinus, FaPlus } from "react-icons/fa";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ShieldCheck,
  Truck,
  BadgePercent,
  PackageCheck,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import axios from "axios";

import { useTranslation } from "@/translation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type ProductImage = string | { url?: string };

type ProductSpecification = {
  key: string;
  value: string;
};

type ProductType = {
  id: number;
  name: string;
  code?: string;
  brand?: string;
  warranty?: string;
  category?: string;
  description?: string;
  image?: string | { url?: string } | null;
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  in_stock: number | string;
  price: number | string;
  new_price?: number | string | null;
  discounted_price?: number | string | null;
  applied_promocode?: boolean;
  pre_order_discount_applied?: boolean;
  already_preordered?: boolean;
};

type SharedData = {
  auth?: {
    user?: {
      id?: number;
      name?: string;
      email?: string;
      mobile_number?: string;
    };
  };
};

type ProductDetailsProps = {
  product: ProductType;
};

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { t } = useTranslation();
  const { auth } = usePage().props as unknown as SharedData;

  const user = auth?.user;
  const isLoggedIn = Boolean(user);

  const [localProduct, setLocalProduct] = useState<ProductType>(product);
  const [imgIdx, setImgIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "details">("description");
  const [loadingProductId, setLoadingProductId] = useState<number | null>(null);
  const [loadingPreOrderId, setLoadingPreOrderId] = useState<number | null>(null);

  useEffect(() => {
    setLocalProduct(product);
  }, [product]);

  const images = useMemo(() => {
    if (Array.isArray(localProduct.images) && localProduct.images.length > 0) {
      return localProduct.images;
    }

    return [{ url: "/images/placeholder.png" }];
  }, [localProduct]);

  const getImageUrl = (img: ProductImage | null | undefined): string => {
    if (typeof img === "object" && img?.url) {
      return img.url;
    }

    if (typeof img === "string" && img.trim() !== "") {
      return img;
    }

    return "/images/placeholder.png";
  };

  const getProductImageUrl = (productItem: ProductType): string => {
    if (Array.isArray(productItem.images) && productItem.images.length > 0) {
      const firstImage = productItem.images[0];

      if (typeof firstImage === "object" && firstImage?.url) {
        return firstImage.url;
      }

      if (typeof firstImage === "string" && firstImage.trim() !== "") {
        return firstImage;
      }
    }

    return "/images/placeholder.png";
  };

  const displayPrice = useMemo(() => {
    const original = Number(localProduct.price || 0);
    const newPrice = Number(localProduct.new_price || 0);
    const discounted = Number(localProduct.discounted_price || 0);

    if (newPrice > 0) {
      return {
        current: newPrice,
        old: original,
        hasDiscount: true,
      };
    }

    if (localProduct.applied_promocode || localProduct.pre_order_discount_applied) {
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
  }, [localProduct]);

  const discountPercent = useMemo(() => {
    const original = Number(displayPrice.old || 0);
    const current = Number(displayPrice.current || 0);

    if (!original || current >= original) return 0;

    return Math.round(((original - current) / original) * 100);
  }, [displayPrice.current, displayPrice.old]);

  const inStock = Number(localProduct.in_stock) > 0;

  const prevImg = () => {
    setImgIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImg = () => {
    setImgIdx((prev) => (prev + 1) % images.length);
  };

  const addToCart = (productItem: ProductType, qty = 1) => {
    setLoadingProductId(productItem.id);

    const existing = localStorage.getItem("cartItems");
    const cart: any[] = existing ? JSON.parse(existing) : [];

    const original = Number(productItem.price || 0);
    const newPrice = Number(productItem.new_price || 0);
    const discounted = Number(productItem.discounted_price || 0);

    let unitPrice = original;
    if (newPrice > 0) {
      unitPrice = newPrice;
    } else if (productItem.pre_order_discount_applied || productItem.applied_promocode) {
      unitPrice = discounted || original;
    }

    const index = cart.findIndex((item) => item.id === productItem.id);

    if (index > -1) {
      cart[index].quantity = (cart[index].quantity || 1) + qty;
    } else {
      cart.push({
        ...productItem,
        quantity: qty,
        price: unitPrice,
        image: getProductImageUrl(productItem),
        oldPrice: unitPrice < original ? original : null,
      });
    }

    localStorage.setItem("cartItems", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));

    setLoadingProductId(null);
    toast.success(`${productItem.name} დაემატა კალათაში`);
  };

  const handlePreOrder = async (productItem: ProductType) => {
    if (!user?.email) {
      toast.error("მომხმარებლის იმეილი ვერ მოიძებნა");
      return;
    }

    try {
      setLoadingPreOrderId(productItem.id);

      await axios.post("/pre-orders", {
        product_id: productItem.id,
        customer_name: user?.name || "",
        customer_email: user?.email || "",
        customer_phone: user?.mobile_number || "",
        quantity,
        note: "",
      });

      toast.success("წინასწარი შეკვეთა მიღებულია");

      setLocalProduct((prev) => ({
        ...prev,
        already_preordered: true,
      }));
    } catch (error: any) {
      console.error("Pre-order error:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "შეცდომა წინასწარი შეკვეთისას");
    } finally {
      setLoadingPreOrderId(null);
    }
  };

  return (
    <>
      <Head title={localProduct.name} />
      <Toaster richColors />
      <Header />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.10),_transparent_24%),linear-gradient(to_bottom,_#f8fafc,_#ffffff,_#f8fafc)]">
        <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/product"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
            >
              <FaArrowLeft className="text-sm" />
              {t("nav.products", "Back to catalog")}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-[34px] border border-white/60 bg-white/90 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur">
              <div className="grid grid-cols-1 gap-0 lg:grid-cols-[120px_minmax(0,1fr)]">
                <div className="order-2 flex gap-3 overflow-x-auto border-t border-gray-100 p-4 lg:order-1 lg:flex-col lg:border-r lg:border-t-0">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setImgIdx(index)}
                      className={`flex h-24 min-w-[90px] items-center justify-center overflow-hidden rounded-2xl border bg-white p-2 transition ${index === imgIdx
                        ? "border-emerald-500 ring-4 ring-emerald-100"
                        : "border-gray-200 hover:border-emerald-300"
                        }`}
                    >
                      <img
                        src={getImageUrl(img)}
                        alt={`${localProduct.name}-${index + 1}`}
                        className="h-full w-full object-contain"
                      />
                    </button>
                  ))}
                </div>

                <div className="order-1 p-5 lg:order-2">
                  <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),_transparent_28%),linear-gradient(to_bottom_right,_#f8fafc,_#eef2f7)] p-6 sm:min-h-[520px]">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={imgIdx}
                        src={getImageUrl(images[imgIdx])}
                        alt={`${localProduct.name}-${imgIdx + 1}`}
                        className="max-h-[460px] w-full object-contain"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        transition={{ duration: 0.25 }}
                      />
                    </AnimatePresence>

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImg}
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/90 p-3 text-gray-700 shadow-lg transition hover:bg-white"
                        >
                          <ChevronLeft size={18} />
                        </button>

                        <button
                          onClick={nextImg}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-white/90 p-3 text-gray-700 shadow-lg transition hover:bg-white"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="xl:sticky xl:top-6 xl:self-start">
              <div className="overflow-hidden rounded-[34px] border border-white/60 bg-white/90 shadow-[0_25px_80px_rgba(15,23,42,0.10)] backdrop-blur">
                <div className="border-b border-gray-100 p-6 sm:p-8">


                  <h1 className="text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-4xl">
                    {localProduct.name}
                  </h1>

                  {localProduct.code && (
                    <p className="mt-3 text-sm font-medium text-gray-500">
                      კოდი: {localProduct.code}
                    </p>
                  )}

                  {localProduct.brand && (
                    <p className="mt-2 text-sm font-medium text-gray-500">
                      ბრენდი: {localProduct.brand}
                    </p>
                  )}

                  {localProduct.warranty && (
                    <p className="mt-2 text-sm font-medium text-gray-500">
                      გარანტია: {localProduct.warranty}
                    </p>
                  )}

                  <div className="mt-6">
                    {displayPrice.hasDiscount && displayPrice.old ? (
                      <div className="flex flex-wrap items-end gap-3">
                        <span className="text-lg font-medium text-gray-400 line-through">
                          {displayPrice.old.toFixed(2)} ₾
                        </span>
                        <span className="text-4xl font-black tracking-tight text-emerald-700">
                          {displayPrice.current.toFixed(2)} ₾
                        </span>
                      </div>
                    ) : (
                      <span className="text-4xl font-black tracking-tight text-gray-900">
                        {displayPrice.current.toFixed(2)} ₾
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    {inStock ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                        {t("body.energy.inStock", "In Stock")}
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
                        {t("body.energy.outOfStock", "Out of Stock")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-6 p-6 sm:p-8">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800">
                        <ShieldCheck size={16} />
                        ხარისხი
                      </div>

                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800">
                        <Truck size={16} />
                        შეკვეთა
                      </div>

                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800">
                        <BadgePercent size={16} />
                        ფასდაკლება
                      </div>

                    </div>
                  </div>

                  <div className="rounded-[28px] border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800">რაოდენობა</span>
                      <span className="text-sm font-semibold text-gray-500">{quantity}</span>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="rounded-full bg-white p-3 text-gray-700 shadow-sm transition hover:bg-gray-100"
                      >
                        <FaMinus size={12} />
                      </button>

                      <div className="min-w-[70px] rounded-2xl bg-white px-5 py-3 text-center text-lg font-black text-gray-900 shadow-sm">
                        {quantity}
                      </div>

                      <button
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="rounded-full bg-white p-3 text-gray-700 shadow-sm transition hover:bg-gray-100"
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                  </div>

                  {inStock ? (
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(localProduct, quantity);
                      }}
                      disabled={loadingProductId === localProduct.id}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:from-emerald-700 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-70"
                      whileTap={{ scale: 0.98 }}
                    >
                      {loadingProductId === localProduct.id ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          იტვირთება...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" />
                          {t("body.energy.addToCart")}
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (!isLoggedIn) {
                          toast.error("გთხოვთ, გაიაროთ ავტორიზაცია წინასწარი შეკვეთისთვის");
                          return;
                        }

                        handlePreOrder(localProduct);
                      }}
                      disabled={loadingPreOrderId === localProduct.id}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4 text-base font-bold text-white shadow-lg transition hover:from-amber-600 hover:to-yellow-600 disabled:cursor-not-allowed disabled:opacity-70"
                      whileTap={{ scale: 0.98 }}
                    >
                      {loadingPreOrderId === localProduct.id ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          იტვირთება...
                        </>
                      ) : localProduct.already_preordered ? (
                        t("body.energy.alreadyPreOrdered")
                      ) : (
                        t("body.energy.preOrderButton")
                      )}
                    </motion.button>
                  )}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800">
                        <PackageCheck size={16} />
                        სტატუსი
                      </div>
                      <p className="text-sm text-gray-600">
                        {inStock ? "პროდუქტი ხელმისაწვდომია" : "ხელმისაწვდომი არ არის"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-800">
                        <ShoppingCart size={16} />
                        რაოდენობა
                      </div>
                      <p className="text-sm text-gray-600">
                        არჩეულია {quantity} ერთეული
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-[34px] border border-white/60 bg-white/90 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeTab === "description"
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {t("body.product.description", "Description")}
                </button>

                <button
                  onClick={() => setActiveTab("details")}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeTab === "details"
                    ? "bg-emerald-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {t("body.product.showDetails", "Details")}
                </button>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8 sm:py-8">
              {activeTab === "description" && (
                <div className="max-w-4xl">
                  <p className="whitespace-pre-line text-sm leading-8 text-gray-600 sm:text-base">
                    {localProduct.description ||
                      t("body.product.noDescription", "No description available.")}
                  </p>
                </div>
              )}

              {activeTab === "details" && (
                <div className="rounded-[28px] border border-gray-200 bg-gray-50 p-5">
                  <h3 className="mb-4 text-lg font-black text-gray-900">
                    {t("body.product.extraDetailsTitle", "Specifications")}
                  </h3>

                  {localProduct.specifications && localProduct.specifications.length > 0 ? (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                      <ul className="divide-y divide-gray-200">
                        {localProduct.specifications.map((spec, index) => (
                          <li
                            key={index}
                            className="flex flex-col justify-between gap-2 px-4 py-4 text-sm sm:flex-row"
                          >
                            <span className="font-bold text-gray-800">{spec.key}</span>
                            <span className="text-gray-600">{spec.value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {t(
                        "body.product.noSpecifications",
                        "No specifications available."
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
