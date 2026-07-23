"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, ChevronDown, Database, ExternalLink, Globe2, LoaderCircle, LockKeyhole, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GscProperty {
  siteUrl: string;
  displayName: string;
  permissionLevel: string;
  imported?: boolean;
  siteId?: string;
  lastSyncedAt?: string;
}

interface PropertiesResponse {
  mode: "setup" | "gsc";
  connected: boolean;
  accountEmail?: string;
  missing?: string[];
  message?: string;
  properties: GscProperty[];
}

const errorMessages: Record<string, string> = {
  access_denied: "Google access was cancelled. You can try again when you’re ready.",
  invalid_state: "The Google connection expired before it completed. Please try again.",
  oauth_failed: "Google Search Console could not be connected. Check the OAuth settings and try again.",
  missing_configuration: "Complete the server configuration below before connecting Google Search Console.",
};

export function ConnectFlow({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [data, setData] = useState<PropertiesResponse | null>(null);
  const [selectedSite, setSelectedSite] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(initialError ? errorMessages[initialError] ?? "The connection could not be completed." : "");

  useEffect(() => {
    let active = true;
    fetch("/api/gsc/properties", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as PropertiesResponse;
        if (!response.ok) throw new Error(payload.message ?? "Could not load Search Console properties.");
        if (!active) return;
        setData(payload);
        const preferredProperty = payload.properties.find((property) => !property.imported) ?? payload.properties[0];
        setSelectedSite(preferredProperty?.siteUrl ?? "");
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load Search Console properties.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function importProperty() {
    if (!selectedSite) return;
    setImporting(true);
    setError("");
    try {
      const response = await fetch("/api/gsc/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteUrl: selectedSite }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(payload.message ?? "Search Console import failed.");
      router.push("/dashboard");
      router.refresh();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Search Console import failed.");
      setImporting(false);
    }
  }

  const needsSetup = data?.mode === "setup";
  const needsGoogleConnection = data?.mode === "gsc" && !data.connected;
  const selectedProperty = data?.properties.find((property) => property.siteUrl === selectedSite);

  return (
    <Card className="w-full max-w-[640px] overflow-hidden">
      <div className="border-b border-[#e7e7e3] px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#70d6ff] text-black"><Globe2 className="size-5" /></span>
          <div>
            <h1 className="text-lg font-semibold tracking-[-0.02em] text-black">Connect a Search Console property</h1>
            <p className="mt-0.5 text-xs text-[#727272]">Authorize Google, choose one website, and import its performance.</p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[#ff9770] bg-[#fff0eb] px-4 py-3 text-xs font-medium leading-5 text-black">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center">
            <LoaderCircle className="size-6 animate-spin text-black" />
            <p className="mt-3 text-sm font-semibold text-black">Checking your connection</p>
            <p className="mt-1 text-xs text-[#777777]">This only takes a moment.</p>
          </div>
        ) : needsSetup ? (
          <div>
            <div className="rounded-xl border border-[#ffcf70] bg-[#fff8e6] p-5">
              <p className="text-sm font-semibold text-black">Live Search Console setup required</p>
              <p className="mt-2 text-xs leading-5 text-[#666666]">Add the following server environment values, create the database tables, and restart the app:</p>
              <ul className="mt-3 space-y-1.5 font-mono text-[11px] text-black">
                {data.missing?.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#777777]">The app will not substitute demo metrics for a live import. Once setup is complete, this page will show the Google authorization button.</p>
          </div>
        ) : needsGoogleConnection ? (
          <div>
            <div className="rounded-xl border border-[#bceaff] bg-[#effaff] p-5">
              <p className="text-sm font-semibold text-black">Google authorization required</p>
              <p className="mt-2 text-xs leading-5 text-[#666666]">Winin requests read-only Search Console access and offline access so scheduled imports can refresh without asking you to reconnect.</p>
            </div>
            <a href="/api/gsc/oauth/start" className={cn(buttonVariants({ size: "lg" }), "mt-5 w-full")}>Authorize with Google <ExternalLink className="size-4" /></a>
          </div>
        ) : (
          <div>
            {data?.accountEmail && (
              <div className="mb-5 flex items-center justify-between rounded-xl bg-[#eaffef] px-4 py-3">
                <div className="flex items-center gap-2.5"><span className="flex size-7 items-center justify-center rounded-full bg-[#80ed99] text-black"><Check className="size-3.5" /></span><div><p className="text-xs font-semibold text-black">Google connected</p><p className="text-[11px] text-[#666666]">{data.accountEmail}</p></div></div>
                <a href="/api/gsc/oauth/start" className="inline-flex items-center gap-1.5 text-xs font-semibold text-black"><RefreshCw className="size-3.5" /> Reconnect</a>
              </div>
            )}

            <label htmlFor="gsc-property" className="mb-2 block text-xs font-semibold text-black">Website property</label>
            <div className="relative">
              <select
                id="gsc-property"
                value={selectedSite}
                onChange={(event) => setSelectedSite(event.target.value)}
                disabled={!data?.properties.length || importing}
                className="h-[66px] w-full appearance-none rounded-xl border border-[#ddddda] bg-white px-4 pr-11 text-sm font-semibold text-black shadow-sm outline-none focus:ring-2 focus:ring-[#70d6ff] disabled:bg-[#f5f5f2]"
              >
                {!data?.properties.length && <option value="">No Search Console properties found</option>}
                {data?.properties.map((property) => <option key={property.siteUrl} value={property.siteUrl}>{property.displayName} · {property.permissionLevel}{property.imported ? " · Imported" : ""}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-black" />
            </div>

            {selectedProperty && (
              <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl border border-[#dededb] bg-white p-4 sm:grid-cols-3">
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#999999]">Access</p><p className="mt-1 text-xs font-semibold text-black">{selectedProperty.permissionLevel}</p></div>
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#999999]">Status</p><p className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-black"><span className={cn("size-2 rounded-full", selectedProperty.imported ? "bg-[#80ed99]" : "bg-[#70d6ff]")} />{selectedProperty.imported ? "Imported" : "Ready to add"}</p></div>
                <div className="col-span-2 sm:col-span-1"><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#999999]">Last sync</p><p className="mt-1 text-xs font-semibold text-black">{selectedProperty.lastSyncedAt ? new Date(selectedProperty.lastSyncedAt).toLocaleString() : "Not imported yet"}</p></div>
              </div>
            )}

            <div className="mt-6 rounded-xl bg-[#f5f5f2] p-4">
              <p className="mb-3 text-xs font-semibold text-black">What Winin will import</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-2.5 text-xs leading-5 text-[#666666]"><Database className="mt-0.5 size-4 shrink-0 text-black" /><span>Page and query performance for two 28-day periods</span></div>
                <div className="flex items-start gap-2.5 text-xs leading-5 text-[#666666]"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-black" /><span>Read-only access; Winin cannot edit Google data</span></div>
              </div>
            </div>

            {importing ? (
              <div className="mt-6 rounded-xl border border-[#ddddda] p-4">
                <div className="flex items-center gap-3">
                  <LoaderCircle className="size-5 animate-spin text-black" />
                  <div className="flex-1"><p className="text-xs font-semibold text-black">Importing Search Console data</p><p className="mt-1 text-[11px] text-[#777777]">Comparing the latest 28 days with the previous period…</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8e8e5]"><div className="h-full w-2/3 animate-pulse rounded-full bg-[#70d6ff]" /></div></div>
                </div>
              </div>
            ) : (
              <Button size="lg" className="mt-6 w-full" onClick={importProperty} disabled={!selectedSite}>{selectedProperty?.imported ? "Refresh Search Console data" : "Add property and import data"} <Check className="size-4" /></Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
