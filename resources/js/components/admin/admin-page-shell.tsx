import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type AdminPageShellProps = {
  badge?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AdminPageShell({
  badge,
  title,
  description,
  actions,
  children,
}: AdminPageShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#f8fafc_100%)]">
      <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <Card className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(135deg,#0f172a_0%,#111827_50%,#1e293b_100%)] shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="relative overflow-hidden px-6 py-8 text-white md:px-8 md:py-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-4">
                {badge ? (
                  <Badge className={cn("w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-slate-100 hover:bg-white/10")}>
                    {badge}
                  </Badge>
                ) : null}
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
                    {title}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                    {description}
                  </p>
                </div>
              </div>
              {actions ? (
                <div className="flex flex-col gap-3 sm:flex-row">{actions}</div>
              ) : null}
            </div>
          </div>
        </Card>

        {children}
      </div>
    </div>
  );
}
