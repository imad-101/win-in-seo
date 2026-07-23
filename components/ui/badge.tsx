import * as React from "react";
import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";

const styles: Record<Priority, string> = {
  HIGH: "bg-[#fff0eb] text-[#9a4328] ring-[#ffd7c8]",
  MEDIUM: "bg-[#dff5ff] text-[#176889] ring-[#bceaff]",
  LOW: "bg-[#f0f2ef] text-[#68716d] ring-[#e0e4df]",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.04em] ring-1 ring-inset", styles[priority], className)}>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center rounded-full bg-[#dff5ff] px-2.5 py-1 text-xs font-semibold text-[#176889]", className)} {...props} />;
}
