import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({ label, value, change, positive = true, icon: Icon, note }: { label: string; value: string; change?: string; positive?: boolean; icon: LucideIcon; note?: string }) {
  return (
    <Card className="min-h-[148px] p-4 sm:min-h-[164px] sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[#686868]">{label}</p>
          <p className="mt-3 text-[25px] font-semibold tracking-[-0.045em] text-black sm:text-[30px]">{value}</p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#dff5ff] text-black sm:size-10"><Icon className="size-[17px] sm:size-[18px]" /></span>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs">
        {change && (
          <span className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold text-black", positive ? "bg-[#80ed99]" : "bg-[#ff9770]")}>{positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{change}</span>
        )}
        <span className="hidden text-[#8d8d8d] sm:inline">{note ?? "vs previous period"}</span>
      </div>
    </Card>
  );
}
