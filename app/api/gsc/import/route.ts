import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ACTIVE_SITE_COOKIE, activeSiteCookieOptions } from "@/lib/active-site";
import { missingGscConfiguration } from "@/lib/gsc-config";
import { importGscSite } from "@/lib/import-gsc";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ message: "Authentication required." }, { status: 401 });

  if (missingGscConfiguration().length) {
    return Response.json({ mode: "mock", importedRows: 9, opportunities: 9 });
  }

  try {
    const body = (await request.json()) as { siteUrl?: unknown };
    if (typeof body.siteUrl !== "string" || !body.siteUrl || body.siteUrl.length > 500) {
      return Response.json({ message: "Choose a valid Search Console property." }, { status: 400 });
    }
    const result = await importGscSite({ siteUrl: body.siteUrl, origin: request.nextUrl.origin });
    const response = NextResponse.json({ mode: "gsc", ...result });
    response.cookies.set(ACTIVE_SITE_COOKIE, result.site.id, activeSiteCookieOptions);
    return response;
  } catch (error) {
    console.error("Search Console import failed:", error);
    return Response.json({ message: error instanceof Error ? error.message : "Search Console import failed." }, { status: 500 });
  }
}
