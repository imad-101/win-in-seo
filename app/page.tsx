import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, Check, MousePointer2, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-[#70d6ff] px-12 py-10 lg:flex lg:flex-col xl:px-20">
        <Logo href="/" />
        <div className="relative z-10 my-auto max-w-xl py-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-black">
            <Sparkles className="size-3.5" /> Your SEO work, prioritized
          </div>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-[-0.055em] text-black xl:text-[58px]">
            Know exactly what to improve next.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-black/65">
            Winin turns your Google Search Console data into a focused list of high-impact SEO tasks—without the reporting clutter.
          </p>

          <div className="relative mt-12 max-w-[480px]">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
              <div className="flex items-center gap-3 border-b border-[#ededeb] pb-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#dff5ff] text-black"><Search className="size-5" /></span>
                <div>
                  <p className="text-xs font-medium text-[#858585]">Top opportunity</p>
                  <p className="mt-0.5 text-sm font-semibold text-black">Improve /best-csv-editors/</p>
                </div>
                <span className="ml-auto rounded-full bg-[#ff9770] px-2.5 py-1 text-[10px] font-bold text-black">High</span>
              </div>
              <p className="mt-4 text-xs leading-5 text-[#666666]">“best CSV editor” ranks #8 with 4,500 impressions and a low 1.9% CTR.</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {["Improve title", "Update intro", "Add FAQ"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 rounded-lg bg-[#f4f4f1] px-2 py-2 text-[10px] font-medium text-[#555555]"><Check className="size-3 text-black" />{item}</div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-8 flex items-center gap-2 rounded-xl bg-black px-3 py-2.5 text-xs font-semibold text-[#70d6ff] shadow-xl">
              <MousePointer2 className="size-4" /> One clear next step
            </div>
          </div>
        </div>
        <p className="text-xs text-black/55">Built for focused teams who want action, not another dashboard.</p>
        <div className="absolute -bottom-28 -right-16 size-80 rounded-full border-[55px] border-white/25" />
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[420px]">
          <Logo href="/" className="mb-16 lg:hidden" />
          <div className="mb-9">
            <p className="mb-3 text-sm font-semibold text-[#1689b8]">Welcome to Winin</p>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-black">Turn search data into action</h2>
            <p className="mt-3 text-sm leading-6 text-[#747474]">Sign in securely with Clerk, then connect the Google account that has access to your Search Console property.</p>
          </div>

          <Link href="/sign-in" prefetch={false} className={cn(buttonVariants({ size: "lg" }), "w-full bg-black text-white ring-1 ring-black hover:bg-[#242424]")}> 
            <ShieldCheck className="size-5 text-[#70d6ff]" /> Continue securely <ArrowRight className="ml-auto size-4 text-[#70d6ff]" />
          </Link>

          <div className="my-8 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.14em] text-[#a2aca7]">
            <span className="h-px flex-1 bg-[#e6e6e3]" /> Secure, read-only access <span className="h-px flex-1 bg-[#e6e6e3]" />
          </div>

          <div className="space-y-4">
            {["We never change anything in Search Console", "Your data is used only to find opportunities", "Disconnect your property at any time"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-[#666666]">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#dff5ff] text-black"><Check className="size-3" strokeWidth={3} /></span>{item}
              </div>
            ))}
          </div>

          <p className="mt-12 text-center text-xs leading-5 text-[#999999]">By continuing, you agree to our <a href="#" className="text-black underline underline-offset-2">Terms</a> and <a href="#" className="text-black underline underline-offset-2">Privacy Policy</a>.</p>
        </div>
      </section>
    </main>
  );
}
