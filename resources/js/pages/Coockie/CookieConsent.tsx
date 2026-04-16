import { useState } from "react";
import { useCookies } from "react-cookie";
import { useTranslation } from "@/translation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CookieConsent = () => {
  const [cookies, setCookie] = useCookies(["cookieConsent"]);
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const acceptAll = () => {
    setCookie("cookieConsent", "all", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    setOpen(false);
  };

  const acceptNecessary = () => {
    setCookie("cookieConsent", "necessary", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    setOpen(false);
  };

  if (cookies.cookieConsent === "all" || cookies.cookieConsent === "necessary") return null;

  return (
    <>
      <div className="fixed bottom-0 w-full bg-gray-900 text-white p-4 text-sm flex flex-col md:flex-row items-center justify-between z-50">
        <span className="mb-2 md:mb-0">{t("cookie.message")}</span>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setOpen(true)}>
            {t("cookie.more_info")}
          </Button>
          <Button variant="secondary" onClick={acceptNecessary}>
            {t("cookie.only_necessary")}
          </Button>
          <Button onClick={acceptAll}>{t("cookie.accept_all")}</Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("cookie.policy_title")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 text-sm text-muted-foreground">
            <p>{t("cookie.policy_intro")}</p>
            <ul className="list-disc pl-5">
              <li>{t("cookie.policy_point1")}</li>
              <li>{t("cookie.policy_point2")}</li>
              <li>{t("cookie.policy_point3")}</li>
            </ul>
          </div>

          <DialogFooter className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("cookie.close")}
            </Button>
            <Button variant="secondary" onClick={acceptNecessary}>
              {t("cookie.only_necessary")}
            </Button>
            <Button onClick={acceptAll}>{t("cookie.accept_all")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
