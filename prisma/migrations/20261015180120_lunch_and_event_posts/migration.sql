-- CreateTable
CREATE TABLE "BusinessLunch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'Бизнес-ланч',
    "description" TEXT,
    "price" INTEGER,
    "priceNote" TEXT,
    "imagePath" TEXT,
    "validFrom" DATETIME,
    "validTo" DATETIME,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT,
    "title" TEXT,
    "description" TEXT,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "price" INTEGER,
    "priceNote" TEXT,
    "imagePath" TEXT,
    "bookingPhone" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("bookingPhone", "createdAt", "description", "endsAt", "id", "imagePath", "isFeatured", "isPublished", "price", "priceNote", "slug", "startsAt", "title", "updatedAt") SELECT "bookingPhone", "createdAt", "description", "endsAt", "id", "imagePath", "isFeatured", "isPublished", "price", "priceNote", "slug", "startsAt", "title", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
CREATE INDEX "Event_startsAt_idx" ON "Event"("startsAt");
CREATE TABLE "new_SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT 'ЕЛИ',
    "tagline" TEXT,
    "aboutShort" TEXT,
    "aboutLong" TEXT,
    "addressFull" TEXT,
    "city" TEXT,
    "mapLat" REAL,
    "mapLng" REAL,
    "routeUrl" TEXT,
    "phoneDisplay" TEXT,
    "phoneHref" TEXT,
    "email" TEXT,
    "socials" TEXT NOT NULL DEFAULT '[]',
    "legalInfo" TEXT,
    "currency" TEXT NOT NULL DEFAULT '₽',
    "bookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "deliveryEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lunchNote" TEXT,
    "lunchEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSettings" ("aboutLong", "aboutShort", "addressFull", "bookingEnabled", "city", "currency", "deliveryEnabled", "email", "id", "legalInfo", "mapLat", "mapLng", "name", "phoneDisplay", "phoneHref", "routeUrl", "socials", "tagline", "updatedAt") SELECT "aboutLong", "aboutShort", "addressFull", "bookingEnabled", "city", "currency", "deliveryEnabled", "email", "id", "legalInfo", "mapLat", "mapLng", "name", "phoneDisplay", "phoneHref", "routeUrl", "socials", "tagline", "updatedAt" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "BusinessLunch_sortOrder_idx" ON "BusinessLunch"("sortOrder");
