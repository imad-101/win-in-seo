import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/current-user";
import { missingGscConfiguration } from "@/lib/gsc-config";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return Response.json({ message: "Authentication required." }, { status: 401 });

  if (missingGscConfiguration().length) return Response.json({ disconnected: true, mode: "mock" });
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
    return Response.json({ disconnected: true });
  } catch (error) {
    console.error("Search Console disconnect failed:", error);
    return Response.json({ message: "Could not disconnect Search Console." }, { status: 500 });
  }
}
