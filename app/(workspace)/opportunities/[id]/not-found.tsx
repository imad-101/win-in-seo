import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 text-center"><p className="text-sm font-semibold text-[#1689b8]">Opportunity not found</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">This task is no longer available.</h1><p className="mt-3 text-sm leading-6 text-[#777777]">It may have been removed after the latest Search Console import.</p><Link href="/opportunities" className={`${buttonVariants()} mt-6`}><ArrowLeft className="size-4" />Back to opportunities</Link></div>;
}
