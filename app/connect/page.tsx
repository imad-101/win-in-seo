import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { ConnectFlow } from "@/components/connect-flow";
import { Logo } from "@/components/logo";

export default async function ConnectPage({ searchParams }: PageProps<"/connect">) {
  await auth.protect();
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-6 sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo href="/" />
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-[#666666] hover:text-black"><ArrowLeft className="size-3.5" /> Back to dashboard</Link>
      </div>
      <div className="mx-auto flex min-h-[calc(100vh-100px)] max-w-6xl flex-col items-center justify-center py-12">
        <div className="mb-7 flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-black text-[10px] font-bold text-[#70d6ff]">1</span>
          <span className="h-px w-12 bg-[#bceaff]" />
          <span className="flex size-6 items-center justify-center rounded-full bg-[#dff5ff] text-[10px] font-bold text-black">2</span>
        </div>
        <ConnectFlow initialError={error} />
      </div>
    </main>
  );
}
