import { createHash, randomBytes } from "node:crypto";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createGoogleAuthorizationUrl } from "@/lib/google-oauth";
import { googleOAuthConfig, missingGscConfiguration } from "@/lib/gsc-config";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: new URL("/connect", request.url).toString() });

  const missing = missingGscConfiguration();
  if (missing.length) {
    const url = new URL("/connect", request.url);
    url.searchParams.set("error", "missing_configuration");
    url.searchParams.set("missing", missing.join(","));
    return NextResponse.redirect(url);
  }

  const state = randomBytes(32).toString("base64url");
  const codeVerifier = randomBytes(48).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  const config = googleOAuthConfig(request.nextUrl.origin);
  const authorizationUrl = createGoogleAuthorizationUrl({
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    state,
    codeChallenge,
  });
  const response = NextResponse.redirect(authorizationUrl);
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
  };
  response.cookies.set("gsc_oauth_state", state, cookieOptions);
  response.cookies.set("gsc_oauth_verifier", codeVerifier, cookieOptions);
  response.cookies.set("gsc_oauth_user_id", userId, cookieOptions);
  return response;
}
