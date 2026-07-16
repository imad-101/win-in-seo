"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  Bell,
  CheckSquare2,
  CircleHelp,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { PropertySwitcher } from "@/components/property-switcher";
import { mockProperty } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { WorkspaceProperty } from "@/lib/workspace-data";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Opportunities", href: "/opportunities", icon: Sparkles },
  { name: "Performance", href: "/dashboard#performance", icon: BarChart3 },
];

export function AppShell({ children, property = mockProperty, properties = [property], opportunityCount = 0 }: { children: React.ReactNode; property?: WorkspaceProperty; properties?: WorkspaceProperty[]; opportunityCount?: number }) {
  const pathname = usePathname();
  const isOpportunityRoute = pathname.startsWith("/opportunities");
  const HeaderIcon = isOpportunityRoute ? Sparkles : LayoutDashboard;
  const headerLabel = isOpportunityRoute ? "Opportunities" : "Overview";

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#171717]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col border-r border-[#e4e4e0] bg-white p-5 lg:flex">
        <div className="px-1 pb-8 pt-1">
          <Logo />
        </div>

        <PropertySwitcher property={property} initialProperties={properties} />

        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#929292]">Main</p>
        <nav className="space-y-1.5" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = item.href === "/dashboard"
              ? pathname === "/dashboard"
              : item.href === "/opportunities"
                ? pathname.startsWith("/opportunities")
                : false;
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-11 items-center gap-3 rounded-xl px-3.5 text-[14px] font-semibold transition-all",
                  isActive ? "bg-[#dff5ff] text-black shadow-[inset_0_0_0_1px_rgba(112,214,255,0.35)]" : "text-[#666666] hover:bg-[#f2f2ef] hover:text-black",
                )}
              >
                <item.icon className="size-[19px]" strokeWidth={isActive ? 2.4 : 1.9} />
                {item.name}
                {item.name === "Opportunities" && (
                  <span className="ml-auto rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-[#70d6ff]">{opportunityCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-7 border-t border-[#ededeb] pt-6">
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#929292]">Workspace</p>
          <Link href="/connect" className="flex h-11 items-center gap-3 rounded-xl px-3.5 text-[14px] font-semibold text-[#666666] hover:bg-[#f2f2ef] hover:text-black">
            <Settings className="size-[18px]" /> Settings
          </Link>
          <button className="flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-[14px] font-semibold text-[#666666] hover:bg-[#f2f2ef] hover:text-black">
            <CircleHelp className="size-[18px]" /> Help center
          </button>
        </div>

        <div className="mt-auto rounded-2xl border border-[#bceaff] bg-[#eaf8ff] p-4 text-black">
          <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-[#80ed99] text-black shadow-sm">
            <CheckSquare2 className="size-4" />
          </div>
          <p className="text-sm font-semibold">Keep the momentum</p>
          <p className="mt-1 text-xs leading-5 text-[#666666]">Complete 3 tasks this week to improve your highest-potential pages.</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full w-1/3 rounded-full bg-[#80ed99]" /></div>
        </div>

        <SignOutButton redirectUrl="/">
          <button className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-[#747474] hover:bg-[#f2f2ef] hover:text-black">
            <LogOut className="size-4" /> Sign out
          </button>
        </SignOutButton>
      </aside>

      <header className="sticky top-0 z-20 flex h-[72px] items-center border-b border-[#e4e4e0] bg-white/95 px-4 backdrop-blur lg:ml-[272px] lg:px-8">
        <Logo compact className="lg:hidden" />
        <div className="ml-2 lg:hidden"><PropertySwitcher property={property} initialProperties={properties} compact /></div>
        <div className="hidden items-center gap-2 text-sm font-semibold text-black lg:flex"><HeaderIcon className="size-4 text-black" /> {headerLabel}</div>
        <div className="ml-auto flex items-center gap-2">
          <a href={property.url.startsWith("http") ? property.url : `https://${property.label}`} target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[#666666] hover:bg-[#f2f2ef] hover:text-black lg:flex">
            {property.label}<ExternalLink className="size-3" />
          </a>
          <button className="relative flex size-9 items-center justify-center rounded-full text-black hover:bg-[#eaf8ff]" aria-label="Notifications">
            <Bell className="size-[18px]" />
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-[#ff9770] ring-2 ring-white" />
          </button>
          <div className="ml-1 flex size-9 items-center justify-center">
            <UserButton
              appearance={{ elements: { avatarBox: "size-9 ring-2 ring-white" } }}
            />
          </div>
        </div>
      </header>

      <main className="pb-24 lg:ml-[272px] lg:pb-10">{children}</main>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex h-[70px] items-center justify-around rounded-2xl border border-[#e2e2df] bg-white/95 px-2 shadow-[0_10px_35px_rgba(0,0,0,0.12)] backdrop-blur lg:hidden">
        {navigation.slice(0, 2).map((item) => {
          const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-w-24 flex-col items-center gap-1.5 rounded-xl py-2 text-[11px] font-semibold", active ? "bg-[#dff5ff] text-black" : "text-[#737373]")}>
              <item.icon className="size-5" strokeWidth={active ? 2.4 : 2} />{item.name}
            </Link>
          );
        })}
        <Link href="/connect" className="flex min-w-24 flex-col items-center gap-1.5 rounded-xl py-2 text-[11px] font-semibold text-[#737373]"><Settings className="size-5" />Settings</Link>
      </nav>
    </div>
  );
}
