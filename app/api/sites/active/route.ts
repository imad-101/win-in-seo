import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ACTIVE_SITE_COOKIE, activeSiteCookieOptions } from "@/lib/active-site";
import { getCurrentUser } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return Response.json({ message: "Authentication required." }, { status: 401 });
  if (!process.env.DATABASE_URL) {
    return Response.json({ message: "DATABASE_URL is not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as { siteId?: unknown };
    if (typeof body.siteId !== "string" || !body.siteId || body.siteId.length > 100) {
      return Response.json({ message: "Choose a valid property." }, { status: 400 });
    }

    const user = await getCurrentUser();
    const site = await getPrisma().site.findFirst({
      where: { id: body.siteId, userId: user.id, lastSyncedAt: { not: null } },
      select: { id: true },
    });
    if (!site) return Response.json({ message: "Property not found." }, { status: 404 });

    const response = NextResponse.json({ selected: true, siteId: site.id });
    response.cookies.set(ACTIVE_SITE_COOKIE, site.id, activeSiteCookieOptions);
    return response;
  } catch (error) {
    console.error("Unable to select workspace property:", error);
    return Response.json({ message: "Could not switch properties." }, { status: 500 });
  }
}
