import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { missingGscConfiguration } from "@/lib/gsc-config";
import { GscReconnectRequiredError, getValidGscAccessToken } from "@/lib/gsc-connection";
import { listGscProperties } from "@/lib/gsc";
import { mockProperty } from "@/lib/mock-data";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ message: "Authentication required." }, { status: 401 });

  const missing = missingGscConfiguration();
  if (missing.length) {
    return Response.json({
      mode: "mock",
      connected: false,
      missing,
      properties: [{ siteUrl: mockProperty.url, displayName: mockProperty.label, permissionLevel: mockProperty.permission }],
    });
  }

  try {
    const user = await getCurrentUser();
    const { accessToken, connection } = await getValidGscAccessToken(user.id, request.nextUrl.origin);
    const properties = await listGscProperties(accessToken);
    const importedSites = await getPrisma().site.findMany({
      where: { userId: user.id },
      select: { id: true, url: true, lastSyncedAt: true },
    });
    const importedByUrl = new Map(importedSites.map((site) => [site.url, site]));
    return Response.json({
      mode: "gsc",
      connected: true,
      accountEmail: connection.email,
      properties: properties.map((property) => {
        const imported = importedByUrl.get(property.siteUrl);
        return {
          ...property,
          imported: Boolean(imported),
          siteId: imported?.id,
          lastSyncedAt: imported?.lastSyncedAt?.toISOString(),
        };
      }),
    });
  } catch (error) {
    if (error instanceof GscReconnectRequiredError) {
      return Response.json({ mode: "gsc", connected: false, properties: [], message: error.message });
    }
    console.error("Unable to load GSC properties:", error);
    return Response.json({ mode: "gsc", connected: false, properties: [], message: "Could not load Search Console properties." }, { status: 500 });
  }
}
