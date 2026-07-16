import * as React from "react";
import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/types";

const styles: Record<Priority, string> = {
  HIGH: "bg-[#ff9770] text-black ring-[#e87e58]",
  MEDIUM: "bg-[#dff5ff] text-black ring-[#bceaff]",
  LOW: "bg-[#f2f2ef] text-black ring-[#dededb]",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ring-1 ring-inset", styles[priority], className)}>
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center rounded-full bg-[#dff5ff] px-2.5 py-1 text-xs font-semibold text-black", className)} {...props} />;
}
