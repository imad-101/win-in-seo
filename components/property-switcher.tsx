"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ExternalLink, LoaderCircle, Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkspaceProperty } from "@/lib/workspace-properties";

interface PropertyResponse {
  message?: string;
  properties?: WorkspaceProperty[];
}

function propertyInitial(label: string) {
  return label.trim().charAt(0).toUpperCase() || "S";
}

export function PropertySwitcher({
  property,
  initialProperties,
  compact = false,
}: {
  property: WorkspaceProperty;
  initialProperties: WorkspaceProperty[];
  compact?: boolean;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [properties, setProperties] = useState(initialProperties);
  const [loading, setLoading] = useState(false);
  const [switchingId, setSwitchingId] = useState<string>();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    function closeOnOutsideClick(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  async function loadProperties() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/sites", { cache: "no-store" });
      const payload = (await response.json()) as PropertyResponse;
      if (!response.ok) throw new Error(payload.message ?? "Could not load properties.");
      if (payload.properties?.length) setProperties(payload.properties);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load properties.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleMenu() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) await loadProperties();
  }

  async function selectProperty(siteId: string) {
    if (siteId === property.id) {
      setOpen(false);
      return;
    }
    setSwitchingId(siteId);
    setError("");
    try {
      const response = await fetch("/api/sites/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Could not switch properties.");
      setOpen(false);
      router.refresh();
    } catch (switchError) {
      setError(switchError instanceof Error ? switchError.message : "Could not switch properties.");
    } finally {
      setSwitchingId(undefined);
    }
  }

  async function refreshProperty() {
    setRefreshing(true);
    setError("");
    try {
      const response = await fetch("/api/gsc/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl: property.url }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Could not refresh Search Console data.");
      await loadProperties();
      setOpen(false);
      router.refresh();
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Could not refresh Search Console data.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", !compact && "mb-7")}>
      <button
        type="button"
        onClick={toggleMenu}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-[14px] border border-[#c9edfc] bg-[#effaff] text-left transition-colors hover:border-[#70d6ff]",
          compact ? "h-11 max-w-[178px] px-2.5" : "p-3.5",
        )}
      >
        <span className={cn("flex shrink-0 items-center justify-center rounded-lg bg-[#70d6ff] font-bold text-black", compact ? "size-8 text-[11px]" : "size-9 text-xs")}>
          {propertyInitial(property.label)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-semibold text-black">{property.label}</span>
          {!compact && <span className="mt-0.5 block text-[11px] text-[#727272]">{property.permission}</span>}
        </span>
        <ChevronDown className={cn("size-3.5 shrink-0 text-black transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className={cn(
          "z-50 overflow-hidden rounded-2xl border border-[#dededb] bg-white shadow-[0_20px_55px_rgba(0,0,0,0.16)]",
          compact ? "fixed left-3 right-3 top-[64px]" : "absolute left-0 top-[calc(100%+8px)] w-[310px]",
        )}>
          <div className="flex items-center justify-between border-b border-[#ededeb] px-4 py-3.5">
            <div>
              <p className="text-xs font-bold text-black">Search Console properties</p>
              <p className="mt-0.5 text-[10px] text-[#777777]">Choose which site powers the workspace</p>
            </div>
            {loading && <LoaderCircle className="size-4 animate-spin text-black" />}
          </div>

          <div className="max-h-64 overflow-y-auto p-2" role="listbox" aria-label="Connected Search Console properties">
            {properties.map((item) => {
              const active = item.id === property.id;
              const switching = item.id === switchingId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => selectProperty(item.id)}
                  disabled={Boolean(switchingId) || refreshing}
                  className={cn("flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors", active ? "bg-[#effaff]" : "hover:bg-[#f7f7f5]")}
                >
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-black", active ? "bg-[#70d6ff]" : "bg-[#f2f2ef]")}>
                    {propertyInitial(item.label)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold text-black">{item.label}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-[#777777]">{item.permission} · {item.opportunityCount} opportunities</span>
                    <span className="mt-0.5 block truncate text-[10px] text-[#999999]">Synced {item.lastSync}</span>
                  </span>
                  {switching ? <LoaderCircle className="size-4 animate-spin" /> : active ? <Check className="size-4 text-black" /> : null}
                </button>
              );
            })}
          </div>

          {error && <p className="mx-3 mb-2 rounded-lg bg-[#fff0eb] px-3 py-2 text-[10px] font-medium text-black">{error}</p>}

          <div className="grid grid-cols-2 gap-2 border-t border-[#ededeb] p-3">
            <button type="button" onClick={refreshProperty} disabled={refreshing || property.id.startsWith("mock-")} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#dededb] text-[11px] font-semibold text-black hover:border-black disabled:cursor-not-allowed disabled:opacity-45">
              {refreshing ? <LoaderCircle className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} Refresh data
            </button>
            <Link href="/connect" onClick={() => setOpen(false)} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-black text-[11px] font-semibold text-white hover:bg-[#242424]">
              <Plus className="size-3.5 text-[#70d6ff]" /> Add property
            </Link>
          </div>
          <a href={property.url.startsWith("http") ? property.url : `https://${property.label}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 border-t border-[#ededeb] px-3 py-2.5 text-[10px] font-medium text-[#666666] hover:bg-[#f7f7f5] hover:text-black">
            Open {property.label} <ExternalLink className="size-3" />
          </a>
        </div>
      )}
    </div>
  );
}
