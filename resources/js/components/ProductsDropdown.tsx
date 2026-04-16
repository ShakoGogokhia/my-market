"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";

/* ⭐ React Icons */
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

/* ⭐ Sidebar animation + custom scrollbar */
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

/* ⭐ Icons for each category */
const ICONS: Record<string, JSX.Element> = {
  "all": <FaList size={20} />,

  "alarm host": <FaBell size={20} />,
  "cables": <FaNetworkWired size={20} />,
  "camera": <FaVideo size={20} />,
  "car accessories": <FaCarSide size={20} />,

  "contact sensor": <MdSensors size={20} />,
  "sensor": <MdSensors size={20} />,
  "detector": <MdSensors size={20} />,
  "pir sensor": <MdMotionPhotosOn size={20} />,

  "door sensor": <FaDoorClosed size={20} />,
  "dvr": <FaServer size={20} />,
  "nvr": <FaServer size={20} />,
  "xvr": <FaServer size={20} />,

  "keypad": <FaKeyboard size={20} />,
  "poe switch": <FaToggleOn size={20} />,
  "switch": <FaToggleOn size={20} />,

  "repeater": <FaWifi size={20} />,
  "security systems": <FaHome size={20} />,

  "smoke detector": <MdSmokeFree size={20} />,
  "smoke sensor": <MdSmokeFree size={20} />,

  "socket": <FaPlug size={20} />,
  "time attendance": <FaClock size={20} />,

  "_default": <FaList size={20} />,
};

export default function ProductsSidebar() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string>("all");

  useEffect(() => {
    // Inject animation CSS once
    if (!document.getElementById("sidebar-animation-style")) {
      const style = document.createElement("style");
      style.id = "sidebar-animation-style";
      style.innerHTML = slideAnimation;
      document.head.appendChild(style);
    }

    // Fetch categories with product count
    axios
      .get("/categories-with-count")
      .then((res) => {
        console.log("📌 Loaded counts:", res.data.categories);
        setCategories(res.data.categories); // [{ name: "Camera", total: 42 }, ...]
      })
      .catch(() => setError("კატეგორიების ჩატვირთვა ვერ მოხერხდა"))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryClick = (cat?: string) => {
    const selected = cat || "all";
    setActive(selected);

    router.visit(
      cat ? `/product?category=${encodeURIComponent(cat)}` : "/product"
    );
  };

  const getIcon = (cat: string) => {
    const key = cat.toLowerCase();
    return ICONS[key] || ICONS["_default"];
  };

  if (loading)
    return <div className="p-6 text-gray-500 text-center">იტვირთება...</div>;

  if (error)
    return <div className="p-6 text-red-600 text-center">{error}</div>;

  return (
    <div className="w-64 bg-transparent">
      <div className="bg-white shadow-lg rounded-xl p-4 animate-slideLeft h-[80vh] flex flex-col">

        <h2 className="text-xl font-bold mb-4">კატეგორიები</h2>

        {/* ⭐ ALL PRODUCTS */}
        <button
          onClick={() => handleCategoryClick()}
          className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg cursor-pointer transition-all
            ${
              active === "all"
                ? "bg-green-600 text-white shadow-md scale-[1.02]"
                : "bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white"
            }`}
        >
          {ICONS["all"]}
          ყველა პროდუქტი
        </button>


        <div className="mt-3 flex flex-col gap-2 overflow-y-auto sidebar-scroll pr-1 h-full">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg cursor-pointer transition-all
                ${
                  active === cat.name
                    ? "bg-green-600 text-white shadow-md scale-[1.02]"
                    : "bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white"
                }`}
            >
              {getIcon(cat.name)}
              {cat.name} ({cat.total})
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
