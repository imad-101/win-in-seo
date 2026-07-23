-- CreateEnum
CREATE TYPE "OpportunityType" AS ENUM ('LOW_CTR', 'STRIKING_DISTANCE', 'DECLINING_PAGE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('OPEN', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" INTEGER,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GscConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleAccountId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "scopes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GscConnection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gscConnectionId" TEXT,
    "url" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "gscPermission" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "importPeriodStart" TIMESTAMP(3),
    "importPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GscMetric" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL,
    "previousClicks" INTEGER NOT NULL,
    "impressions" INTEGER NOT NULL,
    "ctr" DOUBLE PRECISION NOT NULL,
    "position" DOUBLE PRECISION NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GscMetric_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GscDailyMetric" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "clicks" INTEGER NOT NULL,
    "impressions" INTEGER NOT NULL,
    "ctr" DOUBLE PRECISION NOT NULL,
    "position" DOUBLE PRECISION NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GscDailyMetric_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "type" "OpportunityType" NOT NULL,
    "priority" "Priority" NOT NULL,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'OPEN',
    "pageUrl" TEXT NOT NULL,
    "targetKeyword" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL,
    "previousClicks" INTEGER NOT NULL,
    "impressions" INTEGER NOT NULL,
    "ctr" DOUBLE PRECISION NOT NULL,
    "position" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "actions" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "GscConnection_userId_key" ON "GscConnection"("userId");
CREATE INDEX "GscConnection_googleAccountId_idx" ON "GscConnection"("googleAccountId");
CREATE INDEX "Site_gscConnectionId_idx" ON "Site"("gscConnectionId");
CREATE UNIQUE INDEX "Site_userId_url_key" ON "Site"("userId", "url");
CREATE INDEX "GscMetric_siteId_periodEnd_idx" ON "GscMetric"("siteId", "periodEnd");
CREATE INDEX "GscMetric_siteId_pageUrl_idx" ON "GscMetric"("siteId", "pageUrl");
CREATE UNIQUE INDEX "GscDailyMetric_siteId_date_key" ON "GscDailyMetric"("siteId", "date");
CREATE INDEX "GscDailyMetric_siteId_date_idx" ON "GscDailyMetric"("siteId", "date");
CREATE INDEX "Opportunity_siteId_status_priority_idx" ON "Opportunity"("siteId", "status", "priority");
CREATE UNIQUE INDEX "Opportunity_siteId_sourceKey_key" ON "Opportunity"("siteId", "sourceKey");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GscConnection" ADD CONSTRAINT "GscConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Site" ADD CONSTRAINT "Site_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Site" ADD CONSTRAINT "Site_gscConnectionId_fkey" FOREIGN KEY ("gscConnectionId") REFERENCES "GscConnection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GscMetric" ADD CONSTRAINT "GscMetric_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GscDailyMetric" ADD CONSTRAINT "GscDailyMetric_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
