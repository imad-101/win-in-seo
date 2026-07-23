import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const trendColors = {
  blue: "#249fd0",
  green: "#43b95f",
  orange: "#e87d56",
};

function MiniTrend({ values, tone }: { values: number[]; tone: keyof typeof trendColors }) {
  const plottedValues = values.length > 1 ? values : [0, 0];
  const min = Math.min(...plottedValues);
  const max = Math.max(...plottedValues);
  const range = Math.max(1, max - min);
  const points = plottedValues.map((value, index) => `${(index / (plottedValues.length - 1)) * 70},${22 - ((value - min) / range) * 18}`).join(" ");
  const last = plottedValues[plottedValues.length - 1];
  const lastY = 22 - ((last - min) / range) * 18;

  return (
    <svg viewBox="0 0 70 26" className="h-7 w-[70px]" aria-hidden="true">
      <polyline points={points} fill="none" stroke={trendColors[tone]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="70" cy={lastY} r="2.5" fill="white" stroke={trendColors[tone]} strokeWidth="2" />
    </svg>
  );
}

export function MetricCard({ label, value, change, positive = true, icon: Icon, note, trend, tone = "blue" }: { label: string; value: string; change?: string; positive?: boolean; icon: LucideIcon; note?: string; trend: number[]; tone?: keyof typeof trendColors }) {
  return (
    <Card className="group min-h-[158px] p-4 transition-[border-color,box-shadow] duration-200 hover:border-[#d1d8d3] hover:shadow-[0_12px_32px_rgba(16,32,26,0.06)] sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-semibold text-[#74807a]">{label}</p>
          <p className="mt-3 text-[26px] font-semibold tracking-[-0.05em] text-[#14201c] sm:text-[30px]">{value}</p>
        </div>
        <span className="flex size-9 items-center justify-center rounded-full border border-[#dcecf3] bg-white text-[#249fd0] shadow-[0_3px_10px_rgba(36,159,208,0.08)] sm:size-10"><Icon className="size-[17px] sm:size-[18px]" strokeWidth={1.9} /></span>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3 text-[11px]">
        <div className="min-w-0">
          {change ? (
            <div className="flex items-center gap-1.5">
              <span className={cn("inline-flex items-center gap-0.5 font-bold", positive ? "text-[#2d8f45]" : "text-[#c45c39]")}>{positive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{change}</span>
              <span className="hidden truncate text-[#929a96] sm:inline">vs previous</span>
            </div>
          ) : <span className="hidden truncate text-[#8a938f] sm:block">{note}</span>}
        </div>
        <MiniTrend values={trend} tone={tone} />
      </div>
    </Card>
  );
}
