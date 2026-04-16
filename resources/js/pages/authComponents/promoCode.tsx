import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslation } from "@/translation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PromocodeInput({ onApply }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedCode, setAppliedCode] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [discount, setDiscount] = useState(0);
  const { t } = useTranslation();

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
    console.log("shevida es dedadzagli")
    try {
      const res = await axios.post("/apply-promocode", { code: code.trim() });
      setErrorMessage("");
      if (!res || !res.data || !res.data.discounted_amount) {
        throw new Error("დამუშავების შეცდომა");
      }

      const { discounted_amount } = res.data;

      setDiscount(discounted_amount);
      setAppliedCode(code.trim());
      toast.success(
        `წარმატებით გამოყენებულია კოდი: ${code.trim()} (${discounted_amount} %)`
      );
      window.location.reload();
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

  return (
    <>
      <div className="bg-white  p-4 rounded-lg shadow-md mt-6 mb-105">
        <h3 className="text-lg font-semibold mb-2">
          {t("body.promoCode.titleP")}
        </h3>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="შეიყვანე კოდი"
            className="border px-4 py-2 rounded-md w-full"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setAppliedCode(null);
            }}
            disabled={false}
          />
          <button
            onClick={handleApply}
            disabled={loading || !!appliedCode}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition w-full"
          >
            {loading
              ? "იტვირთება..."
              : appliedCode
              ? "გამოყენებულია"
              : "გამოყენება"}
          </button>
        </div>

        {errorMessage && (
          <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
        )}
        {appliedCode && (
          <p className="text-green-600 mt-3">
            პრომოკოდი <strong>{appliedCode}</strong> გამოყენებულია. ფასდაკლება:{" "}
            <strong>{discount} %</strong>
          </p>
        )}
      </div>
    </>
  );
}
