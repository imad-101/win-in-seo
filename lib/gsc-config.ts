import "server-only";

export function missingGscConfiguration() {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (!process.env.GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
  if (!process.env.GOOGLE_CLIENT_SECRET) missing.push("GOOGLE_CLIENT_SECRET");
  if (!process.env.GSC_TOKEN_ENCRYPTION_KEY) missing.push("GSC_TOKEN_ENCRYPTION_KEY");
  return missing;
}

export function isGscConfigured() {
  return missingGscConfiguration().length === 0;
}

export function googleOAuthConfig(origin: string) {
  const missing = missingGscConfiguration();
  if (missing.length) throw new Error(`Missing configuration: ${missing.join(", ")}`);
  return {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_GSC_REDIRECT_URI ?? `${origin}/api/gsc/oauth/callback`,
  };
}
