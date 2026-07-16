import "server-only";

import { auth, currentUser as getClerkUser } from "@clerk/nextjs/server";
import { cache } from "react";
import { getPrisma } from "@/lib/prisma";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("You must be signed in to continue.");
  }
}

export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) throw new AuthenticationRequiredError();

  const clerkUser = await getClerkUser();
  if (!clerkUser) throw new AuthenticationRequiredError();

  const primaryEmail = clerkUser.emailAddresses.find(
    (address) => address.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
  const email = primaryEmail ?? `${userId}@users.wininseo.local`;
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || null;
  const prisma = getPrisma();
  const existing = await prisma.user.findFirst({
    where: { OR: [{ clerkUserId: userId }, { email }] },
  });

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { clerkUserId: userId, email, name, image: clerkUser.imageUrl },
    });
  }

  return prisma.user.create({
    data: { clerkUserId: userId, email, name, image: clerkUser.imageUrl },
  });
});
