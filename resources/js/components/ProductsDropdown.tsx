"use client";

import { useEffect, useState, type ReactElement } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { useTranslation } from "@/translation";

import {
  FaList,
  FaBell,
  FaNetworkWired,
  FaVideo,
  FaCarSide,
  FaDoorClosed,
  FaKeyboard,
  FaServer,
  FaWifi,
  FaHome,
  FaClock,
  FaPlug,
  FaToggleOn,
} from "react-icons/fa";
import { MdSensors, MdMotionPhotosOn, MdSmokeFree } from "react-icons/md";

const slideAnimation = `
@keyframes slideLeft {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slideLeft {
  animation: slideLeft 0.4s ease-out;
}

.sidebar-scroll::-webkit-scrollbar {
  width: 8px;
}
.sidebar-scroll::-webkit-scrollbar-thumb {
  background-color: #cfcfcf;
  border-radius: 10px;
}
.sidebar-scroll::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}
.sidebar-scroll::-webkit-scrollbar-track {
  background: transparent;
}
`;

const ICONS: Record<string, ReactElement> = {
  all: <FaList size={20} />,
  "alarm host": <FaBell size={20} />,
  cables: <FaNetworkWired size={20} />,
  camera: <FaVideo size={20} />,
  "car accessories": <FaCarSide size={20} />,
  "contact sensor": <MdSensors size={20} />,
  sensor: <MdSensors size={20} />,
  detector: <MdSensors size={20} />,
  "pir sensor": <MdMotionPhotosOn size={20} />,
  "door sensor": <FaDoorClosed size={20} />,
  dvr: <FaServer size={20} />,
  nvr: <FaServer size={20} />,
  xvr: <FaServer size={20} />,
  keypad: <FaKeyboard size={20} />,
  "poe switch": <FaToggleOn size={20} />,
  switch: <FaToggleOn size={20} />,
  repeater: <FaWifi size={20} />,
  "security systems": <FaHome size={20} />,
  "smoke detector": <MdSmokeFree size={20} />,
  "smoke sensor": <MdSmokeFree size={20} />,
  socket: <FaPlug size={20} />,
  "time attendance": <FaClock size={20} />,
  _default: <FaList size={20} />,
};

type CategoryItem = {
  name: string;
  total?: number;
  icon_url?: string | null;
};

export default function ProductsSidebar() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string>("all");

  useEffect(() => {
    if (!document.getElementById("sidebar-animation-style")) {
      const style = document.createElement("style");
      style.id = "sidebar-animation-style";
      style.innerHTML = slideAnimation;
      document.head.appendChild(style);
    }

    axios
      .get("/categories-with-count")
      .then((res) => {
        setCategories(Array.isArray(res.data?.categories) ? res.data.categories : []);
      })
      .catch(() => setError("კატეგორიების ჩატვირთვა ვერ მოხერხდა"))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryClick = (cat?: string) => {
    const selected = cat || "all";
    setActive(selected);
    router.visit(cat ? `/product?category=${encodeURIComponent(cat)}` : "/product");
  };

  const getIcon = (cat: string) => {
    const key = cat.toLowerCase();
    return ICONS[key] || ICONS._default;
  };

  const CategoryVisual = ({ category }: { category: CategoryItem }) => {
    if (category.icon_url) {
      return (
        <img
          src={category.icon_url}
          alt={category.name}
          className="h-5 w-5 rounded-md object-cover"
        />
      );
    }

    return <span className="text-slate-500">{getIcon(category.name)}</span>;
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">იტვირთება...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="w-64 bg-transparent">
      <div className="flex h-[80vh] flex-col rounded-xl bg-white p-4 shadow-lg animate-slideLeft">
        <h2 className="mb-4 text-xl font-bold">{t("body.energy.filterByCategory")}</h2>

        <button
          onClick={() => handleCategoryClick()}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
            active === "all"
              ? "scale-[1.02] bg-green-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white"
          }`}
        >
          {ICONS.all}
          {t("body.energy.allProducts")}
        </button>

        <div className="sidebar-scroll mt-3 h-full overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                  active === cat.name
                    ? "scale-[1.02] bg-green-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white"
                }`}
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white/90 text-slate-700 shadow-sm">
                  <CategoryVisual category={cat} />
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {cat.name}
                </span>
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-500 shadow-sm">
                  {cat.total}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
