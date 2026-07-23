import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, href = "/dashboard", className }: { compact?: boolean; href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="Winin home">
      <span className="flex size-9 items-center justify-center rounded-xl bg-[#14201c] text-[#70d6ff] shadow-[0_5px_14px_rgba(20,32,28,0.18)]">
        <TrendingUp className="size-[19px]" strokeWidth={2.5} />
      </span>
      {!compact && (
        <span className="text-[19px] font-bold tracking-[-0.04em] text-[#14201c]">
          winin<span className="text-[#249fd0]">seo</span>
        </span>
      )}
    </Link>
  );
}
