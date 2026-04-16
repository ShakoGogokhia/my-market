import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { useTranslation } from "@/translation";
import {
  FaLaptopCode,
  FaMobileAlt,
  FaDatabase,
  FaCloud,
  FaStar,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const categories = {
  web: {
    title: "ვებ დეველოპმენტი",
    icon: <FaLaptopCode size={28} />,
    description: "ბიზნესის საჭიროებებზე მორგებული კასტომ ვებსაიტები.",
    prices: [
      { feature: "ლენდინგ გვერდი", price: "500₾" },
      { feature: "ელექტრონული კომერციის საიტი", price: "1500₾" },
      { feature: "კასტომ CMS", price: "2000₾" },
    ],
  },
  backend: {
    title: "ბექენდ და API-ები",
    icon: <FaDatabase size={28} />,
    description: "უსაფრთხო ბექენდ სისტემები API-ებით და მონაცემთა მართვით.",
    prices: [
      { feature: "API დეველოპმენტი", price: "1000₾" },
      { feature: "მონაცემთა ბაზის დაყენება", price: "1200₾" },
      { feature: "სრული ბექენდ სისტემა", price: "2500₾" },
    ],
  },
  cloud: {
    title: "კლაუდ სერვისები",
    icon: <FaCloud size={28} />,
    description: "აპლიკაციების განთავსება და მართვა cloud ში.",
    prices: [
      { feature: "საბაზისო განთავსება", price: "800₾" },
      { feature: "მასშტაბირება და მონიტორინგი", price: "1500₾" },
      { feature: "სრული კლაუდ მართვა", price: "3000₾" },
    ],
  },
  custom: {
    title: "კუსტომ პროგრამები",
    icon: <FaStar size={28} />,
    description: "ვერ ნახეთ საჭირო კატეგორია? ჩვენ ვქმნით ყველაფერს!",
    prices: [],
  },
};

export default function ProgramsPage() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    file: null,
    budget: "",
    category: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      toast.error("გთხოვთ შეავსოთ ყველა აუცილებელი ველი.");
      return;
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("message", form.message);
    formData.append("budget", form.budget || "");
    formData.append("category", form.category || "");
    formData.append("program", selectedProgram?.feature || "");
    formData.append("price", selectedProgram?.price || "");

    if (form.file) {
      formData.append("file", form.file);
    }

    try {
      const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

      if (!token) {
        throw new Error(
          "CSRF token not found. Make sure <meta name='csrf-token' content='...'> is present."
        );
      }

      const response = await fetch("/send-program-order", {
        method: "POST",
        headers: {
          "X-CSRF-TOKEN": token,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      toast.success("თქვენი მოთხოვნა წარმატებით გაიგზავნა!");
      setForm({
        name: "",
        email: "",
        message: "",
        file: null,
        budget: "",
        category: "",
      });
      setSelectedProgram(null);
      setSelectedCategory(null);
      setShowForm(false);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("დაფიქსირდა შეცდომა გაგზავნისას.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <Toaster />

      <motion.div className="flex w-screen min-h-screen mt-0 p-0 overflow-x-hidden">
        <div className="flex flex-col md:flex-row w-full bg-white rounded-2xl shadow-lg overflow-hidden">
          {!selectedCategory && !showForm && (
            <nav
              className={`w-full md:w-[700px] h-full text-[#00994D] p-10 md:p-20 flex flex-col justify-between ${
                !selectedCategory && !showForm ? "block" : "hidden md:flex"
              }`}
              style={{
                backgroundImage: `url('/images/proggramIMGS/Group177.png')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <div>
                <h1 className="text-4xl text-gray-700 font-semibold text-black  text-[#3F3F3F]">
                  {t("programs.title")}
                </h1>

                <p className="text-1xl text-black mt-5">
                  {t("programs.subtitle")}
                </p>
                <Button
                  onClick={() => setShowOrderDropdown((prev) => !prev)}
                  className="mt-6 mr-10 ml-5 text-[#00994D] font-semibold py-2 rounded-none bg-transparent border-none shadow-none hover:bg-transparent"
                >
                  {t("programs.seePrograms")}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Button>

                <AnimatePresence>
                  {showOrderDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="mt-5 w-60 rounded  origin-top"
                    >
                      {Object.entries(categories).map(([key, cat]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setSelectedCategory(key);
                            setShowForm(false);
                            setForm((f) => ({ ...f, category: key }));
                            setShowOrderDropdown(false);
                          }}
                          className="flex items-center justify-between w-full px-4 py-5 text-left text-[#222] hover:bg-[#E6F7F0]"
                        >
                          <span>{t(`programs.categories.${key}.title`)}</span>
                          <span className="text-[#00994D] text-xl">
                            {cat.icon}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  onClick={() => setShowForm(true)}
                  className="mt-6 ml-5  bg-[#00994D] text-white font-semibold py-2 rounded hover:bg-[#00B259]"
                >
                  {t("programs.orderProgram")}
                </Button>
              </div>

              <div className="opacity-10 mt-10">
                <svg
                  width="40"
                  height="40"
                  fill="none"
                  stroke="#00994D"
                  strokeWidth="1.5"
                >
                  <circle cx="20" cy="20" r="18" strokeDasharray="4 4" />
                </svg>
              </div>
            </nav>
          )}

          <main
            className={`flex-1 p-10 overflow-y-auto ${
              selectedCategory && !showForm
                ? "flex flex-col items-center justify-start"
                : ""
            }`}
            style={{
              backgroundImage: "url('/images/proggramIMGS/Group175.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <AnimatePresence mode="wait">
              {!selectedCategory && !showForm && (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center mt-20"
                >
                  <img
                    src="/images/proggramIMGS/Group176.png"
                    alt="Default Programs"
                    className="rounded-xl w-full max-w-3xl"
                  />
                </motion.div>
              )}

              {selectedCategory && !showForm && (
                <motion.div
                  key="category"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full max-w-5xl"
                >
                  <Button
                    variant="ghost"
                    className="mb-6 text-green-600 font-medium"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedProgram(null);
                    }}
                  >
                    {t("programs.back")}
                  </Button>
                  <div className="text-center relative mb-10">
                    <h3 className="text-green-600 text-2xl font-bold flex items-center justify-center gap-3 mb-3">
                      <span className="text-3xl">
                        {categories[selectedCategory].icon}
                      </span>
                      {t(`programs.categories.${selectedCategory}.title`)}
                    </h3>
                    <p className="text-gray-700 text-base font-medium leading-relaxed max-w-xl mx-auto">
                      {t(`programs.categories.${selectedCategory}.description`)}
                    </p>
                  </div>

                  {categories[selectedCategory].prices.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-4xl mx-auto justify-items-center">
                      {categories[selectedCategory].prices.map(
                        ({ feature, price }) => (
                          <div className="relative w-70" key={feature}>
                            <div className="h-80 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col items-center mb-10">
                              <div
                                className="w-full h-50 bg-green-700 rounded-b-full flex items-center justify-center relative"
                                style={{ backgroundColor: "#0D933F" }}
                              >
                                <div
                                  className="w-60 h-56 bg-green-600 rounded-b-full flex items-center justify-center shadow-md text-white text-6xl font-bold absolute bottom-5 pt-11 left-[15%]"
                                  style={{ backgroundColor: "#00A63E" }}
                                >
                                  {price}
                                </div>
                              </div>

                              <div className="h-14" />

                              <p className="text-gray-600 text-sm font-medium text-center px-4">
                                {feature}
                              </p>
                            </div>

                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                              <button
                                className="bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-2 px-6 rounded-lg shadow-md"
                                onClick={() => {
                                  setShowForm(true);
                                  setSelectedProgram({ feature, price });
                                  setForm((prevForm) => ({
                                    ...prevForm,
                                    category: selectedCategory,
                                  }));
                                }}
                              >
                                {t("programs.orderProgram")}
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="italic text-center">
                        ფასები ინდივიდუალურად განისაზღვრება. <br /> გთხოვთ,
                        მოგვწერეთ თქვენი მოთხოვნა. <br />
                        <br />
                        <Button>პროგრამის შეკვეთა</Button>
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {showForm && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-3xl w-full bg-white rounded-3xl p-8 shadow-2xl text-green-900 mx-auto"
                >
                  {selectedProgram && (
                    <div className="text-center mb-4 text-lg font-medium text-green-800">
                      არჩეული პროგრამა:{" "}
                      <span className="font-bold">
                        {selectedProgram.feature}
                      </span>{" "}
                      – {selectedProgram.price}
                    </div>
                  )}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5 text-[#0D933F]"
                  >
                    <Input
                      placeholder="თქვენი სახელი"
                      className="border-[#0D933F] focus:ring-2 focus:ring-[#00A63E]"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      required
                    />

                    <Input
                      type="email"
                      placeholder="თქვენი ელ. ფოსტა"
                      className="border-[#0D933F] focus:ring-2 focus:ring-[#00A63E]"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                    />

                    <Textarea
                      placeholder="გთხოვთ აღწერეთ თქვენი იდეა..."
                      className="border-[#0D933F] focus:ring-2 focus:ring-[#00A63E]"
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      rows={5}
                      required
                    />

                    <select
                      value={form.category}
                      onChange={(e) => {
                        const selectedKey = e.target.value;
                        setForm({ ...form, category: selectedKey });
                        setSelectedCategory(selectedKey);
                        setSelectedProgram(null);
                      }}
                      className="w-full p-3 rounded-md border border-[#0D933F] bg-white text-[#0D933F] font-semibold"
                    >
                      <option value="">აირჩიეთ კატეგორია</option>
                      {Object.entries(categories).map(([key, cat]) => (
                        <option key={key} value={key}>
                          {cat.title}
                        </option>
                      ))}
                    </select>

                    {form.category &&
                      categories[form.category].prices.length > 0 && (
                        <select
                          value={selectedProgram?.feature || ""}
                          onChange={(e) => {
                            const program = categories[
                              form.category
                            ].prices.find((p) => p.feature === e.target.value);
                            setSelectedProgram(program);
                          }}
                          className="w-full p-3 rounded-md border border-[#00A63E] bg-white text-[#0D933F] font-semibold"
                        >
                          <option value="">აირჩიეთ პროგრამა</option>
                          {categories[form.category].prices.map((p) => (
                            <option key={p.feature} value={p.feature}>
                              {p.feature} – {p.price}
                            </option>
                          ))}
                        </select>
                      )}

                    <Input
                      placeholder="თქვენი ბიუჯეტი"
                      className="border-[#0D933F] focus:ring-2 focus:ring-[#00A63E]"
                      value={form.budget}
                      onChange={(e) =>
                        setForm({ ...form, budget: e.target.value })
                      }
                    />

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#00A63E] hover:bg-[#0D933F] text-white font-bold text-lg"
                    >
                      {submitting ? "გზავნილია..." : "გაგზავნა"}
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowForm(false);
                        setSelectedProgram(null);
                      }}
                      className="w-full mt-3 text-[#0D933F]"
                    >
                      უკან დაბრუნება
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </motion.div>

      <Footer />
    </>
  );
}
