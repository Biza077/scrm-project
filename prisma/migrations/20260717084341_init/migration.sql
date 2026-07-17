-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "division" TEXT NOT NULL DEFAULT 'Divisi Produksi',
    "role" TEXT NOT NULL DEFAULT 'Operator',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RiskAgent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code_ra" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "s_score" INTEGER NOT NULL,
    "o_score" INTEGER NOT NULL,
    "d_score" INTEGER NOT NULL,
    "arp_score" INTEGER NOT NULL,
    "scor_phase" TEXT NOT NULL,
    "preventive_action" TEXT NOT NULL,
    "code_pr" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductionMetric" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "month" TEXT NOT NULL,
    "short_month" TEXT NOT NULL DEFAULT '',
    "year" INTEGER NOT NULL,
    "rainfall_mm" REAL NOT NULL,
    "raw_tea_ton" REAL NOT NULL,
    "dry_tea_ton" REAL NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "RiskAgent_code_ra_key" ON "RiskAgent"("code_ra");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionMetric_month_year_key" ON "ProductionMetric"("month", "year");
