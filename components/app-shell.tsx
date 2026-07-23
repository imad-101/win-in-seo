"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  Bell,
  CircleHelp,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { PropertySwitcher } from "@/components/property-switcher";
import { cn } from "@/lib/utils";
import type { WorkspaceProperty } from "@/lib/workspace-data";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Opportunities", href: "/opportunities", icon: Sparkles },
  { name: "Performance", href: "/dashboard#performance", icon: BarChart3 },
];

export function AppShell({ children, property, properties, opportunityCount = 0 }: { children: React.ReactNode; property: WorkspaceProperty; properties: WorkspaceProperty[]; opportunityCount?: number }) {
  const pathname = usePathname();
  const isOpportunityRoute = pathname.startsWith("/opportunities");
  const HeaderIcon = isOpportunityRoute ? Sparkles : LayoutDashboard;
  const headerLabel = isOpportunityRoute ? "Opportunities" : "Overview";

  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#14201c]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-[#e3e7e2] bg-[#fbfcfa] p-5 lg:flex">
        <div className="px-1 pb-7 pt-1">
          <Logo />
        </div>

        <PropertySwitcher property={property} initialProperties={properties} />

        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#98a19c]">Main</p>
        <nav className="space-y-1" aria-label="Main navigation">
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
                  "relative flex h-11 items-center gap-3 rounded-xl px-3.5 text-[13px] font-semibold transition-all duration-200",
                  isActive ? "bg-[#dff5ff] text-[#176889] shadow-[inset_0_0_0_1px_rgba(112,214,255,0.18)]" : "text-[#68736e] hover:bg-[#eff2ee] hover:text-[#14201c]",
                )}
              >
                <item.icon className="size-[19px]" strokeWidth={isActive ? 2.4 : 1.9} />
                {item.name}
                {item.name === "Opportunities" && (
                  <span className="ml-auto min-w-6 rounded-full bg-[#effaff] px-2 py-0.5 text-center text-[10px] font-bold text-[#1689b8] ring-1 ring-inset ring-[#c9edfc]">{opportunityCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-7 border-t border-[#e7eae6] pt-6">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#98a19c]">Workspace</p>
          <Link href="/connect" className="flex h-11 items-center gap-3 rounded-xl px-3.5 text-[13px] font-semibold text-[#68736e] hover:bg-[#eff2ee] hover:text-[#14201c]">
            <Settings className="size-[18px]" /> Settings
          </Link>
          <button className="flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-[13px] font-semibold text-[#68736e] hover:bg-[#eff2ee] hover:text-[#14201c]">
            <CircleHelp className="size-[18px]" /> Help center
          </button>
        </div>

        <SignOutButton redirectUrl="/">
          <button className="mt-auto flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-[#747e79] hover:bg-[#eff2ee] hover:text-[#14201c]">
            <LogOut className="size-4" /> Sign out
          </button>
        </SignOutButton>
      </aside>

      <header className="sticky top-0 z-20 flex h-[68px] items-center border-b border-[#e3e7e2] bg-[#f8faf7]/90 px-4 backdrop-blur-xl lg:ml-[260px] lg:px-8">
        <Logo compact className="lg:hidden" />
        <div className="ml-2 lg:hidden"><PropertySwitcher property={property} initialProperties={properties} compact /></div>
        <div className="hidden items-center gap-2 text-[13px] font-semibold text-[#4f5b56] lg:flex"><HeaderIcon className="size-4 text-[#249fd0]" /> {headerLabel}</div>
        <div className="ml-auto flex items-center gap-2">
          <a href={property.url.startsWith("http") ? property.url : `https://${property.label}`} target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[#68736e] hover:bg-[#edf2ee] hover:text-[#14201c] lg:flex">
            {property.label}<ExternalLink className="size-3" />
          </a>
          <button className="relative flex size-9 items-center justify-center rounded-full text-[#42504a] hover:bg-[#eaf8ff]" aria-label="Notifications">
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

      <main className="pb-24 lg:ml-[260px] lg:pb-10">{children}</main>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex h-[68px] items-center justify-around rounded-2xl border border-[#e0e5e0] bg-white/95 px-2 shadow-[0_12px_34px_rgba(16,32,26,0.13)] backdrop-blur-xl lg:hidden">
        {navigation.slice(0, 2).map((item) => {
          const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-w-24 flex-col items-center gap-1.5 rounded-xl py-2 text-[11px] font-semibold", active ? "bg-[#dff5ff] text-[#176889]" : "text-[#737e79]")}>
              <item.icon className="size-5" strokeWidth={active ? 2.4 : 2} />{item.name}
            </Link>
          );
        })}
        <Link href="/connect" className="flex min-w-24 flex-col items-center gap-1.5 rounded-xl py-2 text-[11px] font-semibold text-[#737373]"><Settings className="size-5" />Settings</Link>
      </nav>
    </div>
  );
}
