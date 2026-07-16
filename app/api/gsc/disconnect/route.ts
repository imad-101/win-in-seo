import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ACTIVE_SITE_COOKIE } from "@/lib/active-site";
import { getCurrentUser } from "@/lib/current-user";
import { missingGscConfiguration } from "@/lib/gsc-config";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return Response.json({ message: "Authentication required." }, { status: 401 });

  if (missingGscConfiguration().length) {
    const response = NextResponse.json({ disconnected: true, mode: "mock" });
    response.cookies.delete(ACTIVE_SITE_COOKIE);
    return response;
  }
  try {
    const prisma = getPrisma();
    const user = await getCurrentUser();
    const connection = await prisma.gscConnection.findUnique({ where: { userId: user.id } });
    if (connection) {
      await prisma.$transaction([
        prisma.site.deleteMany({ where: { gscConnectionId: connection.id } }),
        prisma.gscConnection.delete({ where: { id: connection.id } }),
      ]);
    }
    const response = NextResponse.json({ disconnected: true });
    response.cookies.delete(ACTIVE_SITE_COOKIE);
    return response;
  } catch (error) {
    console.error("Search Console disconnect failed:", error);
    return Response.json({ message: "Could not disconnect Search Console." }, { status: 500 });
  }
}
