import { Check, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";

export function AuthFrame({ children, mode }: { children: React.ReactNode; mode: "sign-in" | "sign-up" }) {
  const isSignUp = mode === "sign-up";
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#70d6ff] px-12 py-10 lg:flex lg:flex-col xl:px-20">
        <Logo href="/" />
        <div className="relative z-10 my-auto max-w-xl py-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-black">
            <Sparkles className="size-3.5" /> Your SEO work, prioritized
          </div>
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.08] tracking-[-0.055em] text-black xl:text-[58px]">
            {isSignUp ? "Start with your highest-impact SEO wins." : "Welcome back to clearer SEO priorities."}
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-black/65">
            Secure authentication is handled by Clerk. Search Console access remains separate, read-only, and under your control.
          </p>
          <div className="mt-10 space-y-3">
            {["Your workspace stays private", "Google access can be revoked anytime", "Only actionable SEO tasks, no reporting clutter"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-medium text-black/70">
                <span className="flex size-6 items-center justify-center rounded-full bg-black text-[#70d6ff] shadow-sm"><Check className="size-3.5" strokeWidth={3} /></span>
                {item}
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-black/55">Built for focused teams who want action, not another dashboard.</p>
        <div className="absolute -bottom-28 -right-16 size-80 rounded-full border-[55px] border-white/25" />
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-10">
        <div className="flex w-full max-w-md flex-col items-center">
          <Logo href="/" className="mb-10 lg:hidden" />
          {children}
        </div>
      </section>
    </main>
  );
}
