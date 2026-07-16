import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { googleOAuthConfig } from "@/lib/gsc-config";
import { exchangeGoogleCode, fetchGoogleProfile } from "@/lib/google-oauth";
import { getPrisma } from "@/lib/prisma";
import { encryptToken } from "@/lib/token-crypto";

export const runtime = "nodejs";

function redirectWithError(request: NextRequest, code: string) {
  const url = new URL("/connect", request.url);
  url.searchParams.set("error", code);
  const response = NextResponse.redirect(url);
  response.cookies.delete("gsc_oauth_state");
  response.cookies.delete("gsc_oauth_verifier");
  response.cookies.delete("gsc_oauth_user_id");
  return response;
}

export async function GET(request: NextRequest) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: new URL("/connect", request.url).toString() });

  const error = request.nextUrl.searchParams.get("error");
  if (error) return redirectWithError(request, error === "access_denied" ? "access_denied" : "oauth_failed");

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("gsc_oauth_state")?.value;
  const codeVerifier = request.cookies.get("gsc_oauth_verifier")?.value;
  const oauthUserId = request.cookies.get("gsc_oauth_user_id")?.value;
  if (!code || !state || !storedState || !codeVerifier || state !== storedState || oauthUserId !== userId) {
    return redirectWithError(request, "invalid_state");
  }

  try {
    const config = googleOAuthConfig(request.nextUrl.origin);
    const tokens = await exchangeGoogleCode({
      code,
      codeVerifier,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
    });
    const profile = await fetchGoogleProfile(tokens.access_token);
    const prisma = getPrisma();
    const user = await getCurrentUser();
    const existing = await prisma.gscConnection.findUnique({ where: { userId: user.id } });
    if (!tokens.refresh_token && !existing?.refreshToken) {
      throw new Error("Google did not return an offline refresh token.");
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { name: user.name ?? profile.name, image: user.image ?? profile.picture },
      }),
      prisma.gscConnection.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          googleAccountId: profile.sub,
          email: profile.email,
          accessToken: encryptToken(tokens.access_token),
          refreshToken: tokens.refresh_token ? encryptToken(tokens.refresh_token) : null,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          scopes: tokens.scope,
        },
        update: {
          googleAccountId: profile.sub,
          email: profile.email,
          accessToken: encryptToken(tokens.access_token),
          ...(tokens.refresh_token ? { refreshToken: encryptToken(tokens.refresh_token) } : {}),
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          scopes: tokens.scope,
        },
      }),
    ]);

    const url = new URL("/connect", request.url);
    url.searchParams.set("connected", "true");
    const response = NextResponse.redirect(url);
    response.cookies.delete("gsc_oauth_state");
    response.cookies.delete("gsc_oauth_verifier");
    response.cookies.delete("gsc_oauth_user_id");
    return response;
  } catch (oauthError) {
    console.error("Google Search Console OAuth callback failed:", oauthError);
    return redirectWithError(request, "oauth_failed");
  }
}
