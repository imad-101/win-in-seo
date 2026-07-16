import { auth } from "@clerk/nextjs/server";
import { AppShell } from "@/components/app-shell";
import { getWorkspaceData } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  await auth.protect();
  const workspace = await getWorkspaceData();
  return <AppShell property={workspace.property} opportunityCount={workspace.metrics.opportunityCount}>{children}</AppShell>;
}
