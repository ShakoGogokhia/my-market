import React, { useEffect, useState } from "react";
import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { router } from "@inertiajs/react";
import { usePage, useForm } from "@inertiajs/react";
import { useTranslation } from "@/translation";
import { Input } from "@/components/ui/input";
import InputError from "@/components/input-error";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { LoaderCircle } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginPage from "../auth/login.tsx";
import RegisterPage from "../auth/register.tsx";
import PromocodeInput from "../authComponents/promoCode.tsx";
import { Button } from "@/components/ui/button";
type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}
type RegisterForm = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  registration_type: "personal" | "organization";
  mobile_number: string;
  organization_identification_code?: string;
  contact_person?: string;
  address?: string;
  organization_location?: string;
};

export default function Cart({ status, canResetPassword }: LoginProps) {
  const { t } = useTranslation();

  const {
    data: loginData,
    setData: setLoginData,
    post: loginPost,
    processing: loginProcessing,
    errors: loginErrors,
    reset: loginReset,
  } = useForm<LoginForm>({
    email: "",
    password: "",
    remember: false,
  });

  const {
    data: registerData,
    setData: setRegisterData,
    post: registerPost,
    processing: registerProcessing,
    errors: registerErrors,
    reset: registerReset,
  } = useForm<RegisterForm>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    registration_type: "personal",
    mobile_number: "",
    organization_identification_code: "",
    contact_person: "",
    address: "",
    organization_location: "",
  });

  const submitLogin: FormEventHandler = (e) => {
    e.preventDefault();
    loginPost(route("login"), {
      onSuccess: () => {
        window.location.href = "/";
      },
      onFinish: () => loginReset("password"),
    });
  };

  const submitRegister: FormEventHandler = (e) => {
    e.preventDefault();
    registerPost(route("register"), {
      onFinish: () => registerReset("password", "password_confirmation"),
    });
  };
  const [cartItems, setCartItems] = useState([]);
  const [appliedCode, setAppliedCode] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [showTabs, setShowTabs] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [code, setCode] = useState("");
  const handleApply = async () => {
    if (!code.trim()) {
      toast.warning("გთხოვთ, შეიყვანეთ პრომოკოდი");
      return;
    }
    if (appliedCode && appliedCode !== code.trim()) {
      setAppliedCode(null);
      setDiscount(0);
    }
    setLoading(true);

    try {
      const res = await axios.post("/apply-promocode", { code: code.trim() });
      setErrorMessage("");
      if (!res || !res.data || !res.data.discounted_amount) {
        throw new Error("დამუშავების შეცდომა");
      }

      const { discounted_amount } = res.data;

      setDiscount(discounted_amount);
      localStorage.setItem(
        "promoDiscount",
        JSON.stringify({
          code: code.trim(),
          discountAmount: discounted_amount,
        })
      );
      setAppliedCode(code.trim());
      const savedCart = localStorage.getItem("cartItems");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        const totalAmount = parsedCart.reduce(
          (acc, item) => acc + parseFloat(item.price) * item.quantity,
          0
        );

        const updatedCart = parsedCart.map((item) => {
          const itemTotal = parseFloat(item.price) * item.quantity;
          const itemDiscount = (itemTotal / totalAmount) * discounted_amount;
          const discountedPricePerUnit =
            (itemTotal - itemDiscount) / item.quantity;

          return {
            ...item,
            applied_promocode: code.trim(),
            price: Number(discountedPricePerUnit.toFixed(2)),
            oldPrice: Number(item.oldPrice || parseFloat(item.price)),
            quantity: Number(item.quantity),
          };
        });

        localStorage.setItem("cartItems", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
      }
      toast.success(
        `წარმატებით გამოყენებულია კოდი: ${code.trim()}(-${discounted_amount} ₾)`
      );
      setTimeout(() => {
        console.log("🌀 about to hard‑reload cart page");
        window.location.href =
          window.location.pathname + window.location.search;
      }, 300);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "პრომოკოდი არასწორია ან ვადაგასულია";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (index, delta) => {
    const updated = [...cartItems];
    const newQty = updated[index].quantity + delta;
    if (newQty >= 1) {
      updated[index].quantity = newQty;
      setCartItems(updated);
      localStorage.setItem("cartItems", JSON.stringify(updated));
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const removeItem = (index) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);
    localStorage.setItem("cartItems", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const discountedTotal = Math.max(totalAmount - discount, 0);
  const cartItemsWithDiscount = React.useMemo(() => {
    if (discount <= 0 || totalAmount === 0) {
      return cartItems.map((item) => ({
        ...item,
        discountedPricePerUnit: item.price,
        discountedTotal: item.price * item.quantity,
      }));
    }

    return cartItems.map((item) => {
      const hasPromo = appliedCode || item.applied_promocode;
      const unitBasePrice =
        hasPromo && item.discounted_price ? item.discounted_price : item.price;
      const itemTotal = unitBasePrice * item.quantity;
      const itemDiscount = (itemTotal / totalAmount) * discount;
      const discountedPricePerUnit = (itemTotal - itemDiscount) / item.quantity;

      return {
        ...item,
        discountedPricePerUnit,
        discountedTotal: discountedPricePerUnit * item.quantity,
      };
    });
  }, [cartItems, discount, totalAmount, appliedCode]);

  const { auth } = usePage().props;
  const isAuthenticated = !!auth?.user;
  const userPromo = auth.user?.applied_promocode;

  const handleOrder = () => {
    if (!auth?.user) {
      toast.error(t("body.cart.loginToOrder"));
      return;
    }
    if (cartItems.length === 0) {
      toast.error(t("body.cart.emptyOrderError") || "კალათი ცარიელია");
      return;
    }
    setIsPlacingOrder(true);
    const orderData = {
      cartItems: cartItemsWithDiscount,
      totalAmount: discountedTotal,
      promocode: appliedCode,
    };
    axios
      .post("/place-order", orderData)
      .then((response) => {
        localStorage.removeItem("cartItems");
        localStorage.removeItem("promoDiscount");
        setAppliedCode("");
        setDiscount(0);
        setCartItems([]);
        toast.success(t("body.cart.orderSuccess"));
      })
      .catch((error) => {
        console.error("Error placing order:", error);
        toast.error(t("body.cart.orderError"));
      })
      .finally(() => {
        setIsPlacingOrder(false);
        window.dispatchEvent(new Event("cartUpdated"));
      });
  };
  const handlePromoApply = (code, discountAmount) => {
    setAppliedCode(code);
    setDiscount(discountAmount);
  };
  useEffect(() => {
    const raw = localStorage.getItem("cartItems");
    const baseCart = raw ? JSON.parse(raw) : [];
    console.log("Raw cart from localStorage:", baseCart);
    const hydrated = baseCart.map((item) => {
      const basePrice = Number(
        item.price ?? item.oldPrice ?? item.discounted_price ?? 0
      );
      const discounted = Number(item.discounted_price ?? 0);
      const qty = Number(item.quantity ?? 1);
      const startPrice =
        item.applied_promocode && discounted > 0 ? discounted : basePrice;

      return {
        ...item,
        price: Number(startPrice.toFixed(2)),
        oldPrice: Number((item.oldPrice ?? basePrice).toFixed(2)),
        quantity: qty,
      };
    });

    const userPromo = auth.user?.applied_promocode;
    let percent = null;

    if (userPromo) {
      percent = parseFloat(userPromo.discount_percent);
    } else {
      console.log("User promo from auth: null - no discount will be applied");
    }

    let finalCart = hydrated;
    if (userPromo && percent !== null && !isNaN(percent)) {
      const totalBefore = hydrated.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      const discountAmt = Number((totalBefore * (percent / 100)).toFixed(2));
      console.log("Total before discount:", totalBefore);
      console.log("Calculated discount amount:", discountAmt);

      setDiscountAmount(discountAmt);
      setDiscountPercent(percent);
      localStorage.setItem(
        "promoDiscount",
        JSON.stringify({
          code: appliedCode || userPromo?.code,
          percent,
          discountAmount: discountAmt,
        })
      );
      finalCart = hydrated.map((item) => {
        const base = item.oldPrice >= 20 ? item.oldPrice : item.price;
        const discountedPrice = Number((base * (1 - percent / 100)).toFixed(2));
        return {
          ...item,
          price: discountedPrice,
          oldPrice: base,
        };
      });

    } else {
      setDiscountAmount(0);
      setDiscountPercent(0);
      setAppliedCode(null);
      localStorage.removeItem("promoDiscount");
    }
    localStorage.setItem("cartItems", JSON.stringify(finalCart));
    setCartItems(finalCart);
    console.log("Cart saved to localStorage and React state updated");
  }, [auth.user?.applied_promocode, appliedCode]);

  return (
    <>
      <Header />
      <div className="max-w-screen-lg mx-auto mt-10 p-4 bg-white shadow rounded-lg flex flex-col lg:flex-row gap-8 mb-10">
        <Toaster />
        <div className="flex-1  max-h-[700px] overflow-y-auto pr-2">
          <Breadcrumb className="mb-10">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  {t("body.energy.backToProducts")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("body.cart.title")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h2 className="text-2xl font-bold mb-4">{t("body.cart.title")}</h2>
          {cartItems.length === 0 ? (
            <p>{t("body.cart.empty")}</p>
          ) : (
            <ul className="space-y-6">
              {cartItemsWithDiscount.map((item, index) => (
                <li key={index} className="flex gap-4 border-b pb-4">
                  <img
                    src={
                      Array.isArray(item.images) && item.images.length > 0
                        ? typeof item.images[0] === "string"
                          ? item.images[0]
                          : item.images[0]?.url ?? ""
                        : typeof item.image === "string"
                        ? item.image
                        : item.image?.url ?? ""
                    }
                    alt={`${item.name}-${index + 1}`}
                    className="w-20 h-20 object-contain border rounded bg-gray-50"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.model}</p>
                    <div className="flex items-center mt-2 space-x-3">
                      <button
                        onClick={() => updateQuantity(index, -1)}
                        className="p-1 bg-gray-200 rounded"
                      >
                        <FaMinus size={12} />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(index, 1)}
                        className="p-1 bg-gray-200 rounded"
                      >
                        <FaPlus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      {discount > 0
                        ? item.discountedTotal.toFixed(2)
                        : (item.price * item.quantity).toFixed(2)}{" "}
                      ₾
                    </p>
                    {item.oldPrice > item.price && (
                      <p className="text-sm text-gray-400 line-through">
                        {(item.oldPrice * item.quantity).toFixed(2)} ₾
                      </p>
                    )}

                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-500 mt-2 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="w-full lg:w-80 bg-gray-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">{t("body.cart.summary")}</h3>
          <div className="flex justify-between">
            <span>{t("body.cart.savings")}</span>
            <span className="text-green-600 font-semibold">
              {cartItems
                .reduce(
                  (acc, item) =>
                    acc +
                    ((item.oldPrice || item.price) - item.price) *
                      item.quantity,
                  0
                )
                .toFixed(2)}{" "}
              ₾
            </span>
          </div>

          <div className="flex justify-between mb-2">
            <span>{t("body.cart.items")}</span>
            <span>
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span>{t("body.cart.total")}</span>
            <span className="text-lg font-bold">
              {discountedTotal.toFixed(2)} ₾
            </span>
          </div>

          <button
            onClick={handleOrder}
            disabled={isPlacingOrder}
            className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-700 transition flex justify-center items-center"
          >
            {isPlacingOrder ? (
              <svg
                className="w-4 h-4 animate-spin cursor-pointer"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25 cursor-pointer"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75 cursor-pointer"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                ></path>
              </svg>
            ) : (
              t("body.cart.orderButton")
            )}
          </button>
          <PromocodeInput onApply={handlePromoApply} />
        </div>
      </div>
      {!isAuthenticated && (
        <div className="flex justify-center items-center mb-10 mt-5">
          <div className="w-full max-w-md">
            {!showTabs ? (
              <div className="text-center">
                <Button
                  onClick={() => setShowTabs(true)}
                  className="px-6 py-3 text-lg rounded-xl shadow-lg bg-green-600 hover:bg-green-700 transition"
                >
                  {t("fastregister.fastrg")}
                </Button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mt-6">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 mb-4">
                    <TabsTrigger value="login">
                      {t("body.nav.login")}
                    </TabsTrigger>
                    <TabsTrigger value="register">
                      {t("body.nav.register")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form
                      className="flex flex-col gap-6 mb-20"
                      onSubmit={submitLogin}
                    >
                      <div className="grid gap-2">
                        <label
                          htmlFor="loginEmail"
                          className="block text-sm font-medium"
                        >
                          {t("body.loginForm.emailLabel")}
                        </label>
                        <input
                          id="loginEmail"
                          type="email"
                          required
                          autoFocus
                          autoComplete="email"
                          value={loginData.email}
                          onChange={(e) =>
                            setLoginData("email", e.target.value)
                          }
                          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
                        />
                        {loginErrors.email && (
                          <p className="text-red-600 text-sm">
                            {loginErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <label
                            htmlFor="loginPassword"
                            className="block text-sm font-medium"
                          >
                            {t("body.loginForm.passwordLabel")}
                          </label>
                          {canResetPassword && (
                            <a
                              href="/password/request"
                              className="text-sm text-blue-600 hover:underline"
                              tabIndex={5}
                            >
                              Forgot password?
                            </a>
                          )}
                        </div>
                        <input
                          id="loginPassword"
                          type="password"
                          required
                          autoComplete="current-password"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData("password", e.target.value)
                          }
                          className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500"
                        />
                        {loginErrors.password && (
                          <p className="text-red-600 text-sm">
                            {loginErrors.password}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          id="remember"
                          type="checkbox"
                          checked={loginData.remember}
                          onChange={(e) =>
                            setLoginData("remember", e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="remember"
                          className="text-sm font-medium"
                        >
                          {t("body.loginForm.remember")}
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loginProcessing}
                        className="mt-4 w-full bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 transition"
                      >
                        {loginProcessing ? (
                          <svg
                            className="inline h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                        ) : null}
                        {!loginProcessing && t("body.loginForm.submit")}
                      </button>
                    </form>
                  </TabsContent>

                  <TabsContent value="register">
                    <form
                      className="flex flex-col gap-6"
                      onSubmit={submitRegister}
                    >
                      <div className="grid gap-6">
                        <div className="grid gap-2">
                          <Label>{t("body.registerForm.type")}</Label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                value="personal"
                                checked={
                                  registerData.registration_type === "personal"
                                }
                                onChange={() =>
                                  setRegisterData(
                                    "registration_type",
                                    "personal"
                                  )
                                }
                                disabled={registerProcessing}
                              />
                              {t("body.registerForm.personal")}
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                value="organization"
                                checked={
                                  registerData.registration_type ===
                                  "organization"
                                }
                                onChange={() =>
                                  setRegisterData(
                                    "registration_type",
                                    "organization"
                                  )
                                }
                                disabled={registerProcessing}
                              />
                              {t("body.registerForm.organization")}
                            </label>
                          </div>
                          <InputError
                            message={registerErrors.registration_type}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="name">{t("body.profile.name")}</Label>
                          <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            value={registerData.name}
                            onChange={(e) =>
                              setRegisterData("name", e.target.value)
                            }
                            disabled={registerProcessing}
                          />
                          <InputError message={registerErrors.name} />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="mobile_number">
                            {t("body.registerForm.mobile")}
                          </Label>
                          <Input
                            id="mobile_number"
                            type="text"
                            required
                            tabIndex={2}
                            value={registerData.mobile_number}
                            onChange={(e) =>
                              setRegisterData("mobile_number", e.target.value)
                            }
                            disabled={registerProcessing}
                          />
                          <InputError message={registerErrors.mobile_number} />
                        </div>

                        {registerData.registration_type === "organization" && (
                          <>
                            <div className="grid gap-2">
                              <Label htmlFor="organization_identification_code">
                                {t("body.registerForm.code")}
                              </Label>
                              <Input
                                id="organization_identification_code"
                                type="text"
                                tabIndex={3}
                                value={
                                  registerData.organization_identification_code ||
                                  ""
                                }
                                onChange={(e) =>
                                  setRegisterData(
                                    "organization_identification_code",
                                    e.target.value
                                  )
                                }
                                disabled={registerProcessing}
                              />
                              <InputError
                                message={
                                  registerErrors.organization_identification_code
                                }
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="contact_person">
                                {t("body.registerForm.contact")}
                              </Label>
                              <Input
                                id="contact_person"
                                type="text"
                                tabIndex={4}
                                value={registerData.contact_person || ""}
                                onChange={(e) =>
                                  setRegisterData(
                                    "contact_person",
                                    e.target.value
                                  )
                                }
                                disabled={registerProcessing}
                              />
                              <InputError
                                message={registerErrors.contact_person}
                              />
                            </div>

                            <div className="grid gap-2">
                              <Label htmlFor="organization_location">
                                {t("body.registerForm.orgLocation")}
                              </Label>
                              <Input
                                id="organization_location"
                                type="text"
                                tabIndex={5}
                                value={registerData.organization_location || ""}
                                onChange={(e) =>
                                  setRegisterData(
                                    "organization_location",
                                    e.target.value
                                  )
                                }
                                disabled={registerProcessing}
                              />
                              <InputError
                                message={registerErrors.organization_location}
                              />
                            </div>
                          </>
                        )}

                        {registerData.registration_type === "personal" && (
                          <div className="grid gap-2">
                            <Label htmlFor="address">
                              {t("body.registerForm.address")}
                            </Label>
                            <Input
                              id="address"
                              type="text"
                              tabIndex={3}
                              value={registerData.address || ""}
                              onChange={(e) =>
                                setRegisterData("address", e.target.value)
                              }
                              disabled={registerProcessing}
                            />
                            <InputError message={registerErrors.address} />
                          </div>
                        )}

                        <div className="grid gap-2">
                          <Label htmlFor="email">
                            {t("body.profile.email")}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={6}
                            value={registerData.email}
                            onChange={(e) =>
                              setRegisterData("email", e.target.value)
                            }
                            disabled={registerProcessing}
                          />
                          <InputError message={registerErrors.email} />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="password">
                            {t("body.loginForm.passwordLabel")}
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={7}
                            value={registerData.password}
                            onChange={(e) =>
                              setRegisterData("password", e.target.value)
                            }
                            disabled={registerProcessing}
                          />
                          <InputError message={registerErrors.password} />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="password_confirmation">
                            {t("body.confirmPassword")}
                          </Label>
                          <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={8}
                            value={registerData.password_confirmation}
                            onChange={(e) =>
                              setRegisterData(
                                "password_confirmation",
                                e.target.value
                              )
                            }
                            disabled={registerProcessing}
                          />
                          <InputError
                            message={registerErrors.password_confirmation}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="mt-2 w-full bg-gray-700"
                          tabIndex={9}
                          disabled={registerProcessing}
                        >
                          {registerProcessing && (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          )}
                          {t("nav.register")}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
