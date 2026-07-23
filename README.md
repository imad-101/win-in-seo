# Winin SEO

Winin is a focused SEO task manager that turns Google Search Console performance data into a prioritized list of improvements.

## MVP flow

- Clerk authentication with custom sign-in and sign-up screens
- Separate Google Search Console property connection flow
- Live Search Console import for page/query and daily performance data
- Dashboard with clicks, impressions, CTR, average position, and opportunity count
- Opportunity detection for low CTR, positions 4–20, and pages losing clicks
- Detailed reasons, priority, impact estimate, and recommended actions
- Completion state persisted to PostgreSQL for each authenticated user
- Responsive desktop and mobile layouts

Clerk authentication is required for every workspace page and data API. Google and PostgreSQL configuration is mandatory for the workspace: missing configuration is shown on `/connect` and the app never substitutes demo metrics for a live import.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

The PostgreSQL data model is in `prisma/schema.prisma` and covers users, Google accounts, connected sites, imported GSC metrics, and generated opportunities.

```bash
copy .env.example .env
npm run db:validate
npm run db:generate
```

Set `DATABASE_URL` to a PostgreSQL connection string before generating or migrating the database.

## Authentication with Clerk

1. Create a Clerk application in the [Clerk Dashboard](https://dashboard.clerk.com/).
2. Open **API Keys** and copy the publishable and secret keys.
3. Add these values to `.env`:

   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/dashboard"
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/dashboard"
   ```

4. Enable the sign-in methods you want in Clerk. To retain a Google-first login, enable Google under **SSO connections**.

Winin uses Clerk sessions to protect the dashboard, setup flow, opportunity data, and every internal API route. The authenticated Clerk user is synchronized lazily into PostgreSQL through `clerkUserId`; no Clerk webhook is required for the MVP.

## Connect Google Search Console

1. Create or select a project in Google Cloud Console.
2. Enable the **Google Search Console API**.
3. Configure the OAuth consent screen. While the app is in testing, add the Google accounts that will connect properties as test users.
4. Create an OAuth 2.0 Client ID with application type **Web application**.
5. Add this authorized redirect URI for local development:

   ```text
   http://localhost:3000/api/gsc/oauth/callback
   ```

6. Copy `.env.example` to `.env` and set:

   ```env
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="..."
   GOOGLE_GSC_REDIRECT_URI="http://localhost:3000/api/gsc/oauth/callback"
   GSC_TOKEN_ENCRYPTION_KEY="use-a-random-secret-with-at-least-32-characters"
   ```

7. Create the database tables and start the app:

   ```bash
   npm run db:migrate
   npm run dev
   ```

8. Open `/connect`, authorize Google, choose a Search Console property, and import its data. Additional properties can be added later from the workspace property switcher.

Winin requests `webmasters.readonly`, uses OAuth state plus PKCE, binds each Google callback to the Clerk user who started it, encrypts access and refresh tokens with AES-256-GCM, and automatically refreshes expired access tokens.

The importer requests page/query rows for the latest complete 28-day period and the preceding 28 days. It also imports daily totals for both periods so dashboard totals, sparklines, and the comparison chart come from Search Console rather than capped page/query rows. It retrieves up to 50,000 page/query rows per period, persists them through Prisma, and then runs the three MVP opportunity rules.

The property switcher lists every imported site for the signed-in user, including permission level, last sync, and open-opportunity count. Selecting a property updates a secure active-site cookie, refreshes the server-rendered workspace, and scopes all metrics and opportunities to that site. Its **Refresh data** action reruns the live Search Console import for the active property.

## Verification

```bash
npm run lint
npm run build
npm run db:validate
```
