import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { type ReactNode } from "react";
import { X } from "lucide-react";

type AdminDialogFrameProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
  className?: string;
};

export function AdminDialogFrame({
  title,
  description,
  children,
  footer,
  className = "sm:max-w-lg",
}: AdminDialogFrameProps) {
  return (
    <DialogContent className={`max-h-[92vh] w-[96vw] overflow-hidden p-0 ${className}`}>
      <div className="max-h-[92vh] overflow-y-auto">
        <div className="relative bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e293b_100%)] px-6 py-6 text-white">
          <DialogClose className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg shadow-slate-950/20 transition-all hover:bg-slate-50 hover:text-slate-950 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl">{title}</DialogTitle>
            <DialogDescription className="max-w-2xl text-slate-300">
              {description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 py-6">{children}</div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">{footer}</DialogFooter>
      </div>
    </DialogContent>
  );
}
