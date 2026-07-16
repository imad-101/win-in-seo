import { auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/current-user";
import { mockProperty } from "@/lib/mock-data";
import { listWorkspaceProperties } from "@/lib/workspace-properties";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ message: "Authentication required." }, { status: 401 });
  if (!process.env.DATABASE_URL) return Response.json({ mode: "mock", properties: [mockProperty] });

  try {
    const user = await getCurrentUser();
    const properties = await listWorkspaceProperties(user.id);
    return Response.json({ mode: "gsc", properties });
  } catch (error) {
    console.error("Unable to load workspace properties:", error);
    return Response.json({ message: "Could not load connected properties." }, { status: 500 });
  }
}
