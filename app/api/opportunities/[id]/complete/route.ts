import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, context: RouteContext<"/api/opportunities/[id]/complete">) {
  const { userId } = await auth();
  if (!userId) return Response.json({ message: "Authentication required." }, { status: 401 });

  if (!process.env.DATABASE_URL) return Response.json({ mode: "mock", updated: true });
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { completed?: unknown };
    if (typeof body.completed !== "boolean") {
      return Response.json({ message: "completed must be a boolean." }, { status: 400 });
    }
    const user = await getCurrentUser();
    const result = await getPrisma().opportunity.updateMany({
      where: { id, site: { userId: user.id } },
      data: {
        status: body.completed ? "COMPLETED" : "OPEN",
        completedAt: body.completed ? new Date() : null,
      },
    });
    if (!result.count) return Response.json({ message: "Opportunity not found." }, { status: 404 });
    return Response.json({ updated: true, completed: body.completed });
  } catch (error) {
    console.error("Opportunity completion update failed:", error);
    return Response.json({ message: "Could not update the opportunity." }, { status: 500 });
  }
}
