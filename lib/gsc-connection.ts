import "server-only";

import { decryptToken, encryptToken } from "@/lib/token-crypto";
import { getPrisma } from "@/lib/prisma";
import { googleOAuthConfig } from "@/lib/gsc-config";
import { refreshGoogleToken } from "@/lib/google-oauth";

export class GscReconnectRequiredError extends Error {}

export async function getValidGscAccessToken(userId: string, origin: string) {
  const prisma = getPrisma();
  const connection = await prisma.gscConnection.findUnique({ where: { userId } });
  if (!connection) throw new GscReconnectRequiredError("Google Search Console is not connected.");

  if (connection.expiresAt.getTime() > Date.now() + 60_000) {
    return { accessToken: decryptToken(connection.accessToken), connection };
  }

  if (!connection.refreshToken) {
    throw new GscReconnectRequiredError("Google access expired. Reconnect Search Console.");
  }

  try {
    const config = googleOAuthConfig(origin);
    const tokens = await refreshGoogleToken({
      refreshToken: decryptToken(connection.refreshToken),
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    });
    const updated = await prisma.gscConnection.update({
      where: { id: connection.id },
      data: {
        accessToken: encryptToken(tokens.access_token),
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        scopes: tokens.scope || connection.scopes,
      },
    });
    return { accessToken: tokens.access_token, connection: updated };
  } catch {
    throw new GscReconnectRequiredError("Google access could not be refreshed. Reconnect Search Console.");
  }
}
