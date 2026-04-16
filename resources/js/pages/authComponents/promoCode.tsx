import React, { useState } from "react";
import axios from "axios";
import { BadgePercent, CheckCircle2, LoaderCircle, Tag } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/translation";

type PromoProps = {
  onApply?: (code: string, discountAmount: number) => void;
};

export default function PromocodeInput({ onApply }: PromoProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [discount, setDiscount] = useState(0);
  const { t } = useTranslation();

  const handleApply = async () => {
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      toast.warning(t("body.promoCode.emptyWarning"));
      return;
    }

    if (appliedCode && appliedCode !== trimmedCode) {
      setAppliedCode(null);
      setDiscount(0);
    }

    setLoading(true);

    try {
      const res = await axios.post("/apply-promocode", { code: trimmedCode });
      setErrorMessage("");

      if (!res?.data?.discounted_amount) {
        throw new Error(t("body.promoCode.invalidResponse"));
      }

      const { discounted_amount } = res.data;
      setDiscount(discounted_amount);
      setAppliedCode(trimmedCode);
      onApply?.(trimmedCode, discounted_amount);

      toast.success(
        `${t("body.promoCode.successPrefix")} ${trimmedCode} ${t(
          "body.promoCode.successSuffix"
        )} (${discounted_amount}%).`
      );
      window.location.reload();
    } catch (err: unknown) {
      const fallback = t("body.promoCode.errorFallback");
      const message =
        typeof err === "object" && err !== null
          ? "response" in err &&
            typeof (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message === "string"
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : "message" in err &&
              typeof (err as { message?: string }).message === "string"
            ? (err as { message?: string }).message
            : fallback
          : fallback;
      const msg = message || fallback;
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[28px] border border-slate-100 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <BadgePercent size={20} />
        </div>
        <div>
          <h3 className="text-base font-black tracking-tight text-slate-900">
            {t("body.promoCode.title")}
          </h3>
         
        </div>
      </div>

      <div className="space-y-3">
      

        <div className="relative">
          <Tag
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder={t("body.promoCode.inputPlaceholder")}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setAppliedCode(null);
              setErrorMessage("");
            }}
            disabled={loading}
          />
        </div>

        <button
          onClick={handleApply}
          disabled={loading || !!appliedCode}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(16,185,129,0.25)] transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : appliedCode ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : null}
          {loading
            ? t("body.promoCode.applying")
            : appliedCode
            ? t("body.promoCode.applied")
            : t("body.promoCode.button")}
        </button>
      </div>

      {errorMessage && (
        <p className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}

      {appliedCode && (
        <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
          <p className="font-semibold">
            {t("body.promoCode.successPrefix")} <span className="font-black">{appliedCode}</span> {t("body.promoCode.successSuffix")}
          </p>
          <p className="mt-1">
            {t("body.promoCode.discountLabel")}: <span className="font-black">{discount} %</span>
          </p>
        </div>
      )}
    </div>
  );
}
