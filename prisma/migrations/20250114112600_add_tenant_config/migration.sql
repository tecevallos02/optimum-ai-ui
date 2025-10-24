-- CreateEnum
CREATE TYPE "AppointmentSource_new" AS ENUM ('WEB', 'PHONE', 'AGENT', 'IMPORTED');
ALTER TABLE "Appointment" ALTER COLUMN "source" DROP DEFAULT;
ALTER TABLE "Appointment" ALTER COLUMN "source" TYPE "AppointmentSource_new" USING ("source"::text::"AppointmentSource_new");
ALTER TABLE "Appointment" ALTER COLUMN "source" SET DEFAULT 'AGENT';
ALTER TYPE "AppointmentSource" RENAME TO "AppointmentSource_old";
ALTER TYPE "AppointmentSource_new" RENAME TO "AppointmentSource";
DROP TYPE "AppointmentSource_old";

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySheet" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "spreadsheetId" TEXT NOT NULL,
    "dataRange" TEXT NOT NULL DEFAULT 'Calls!A:H',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPhone" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "e164" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyPhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SheetCache" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "lastSynced" TIMESTAMP(3) NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SheetCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CompanySheet_companyId_key" ON "CompanySheet"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPhone_companyId_e164_key" ON "CompanyPhone"("companyId", "e164");

-- CreateIndex
CREATE UNIQUE INDEX "SheetCache_companyId_key" ON "SheetCache"("companyId");

-- AddForeignKey
ALTER TABLE "CompanySheet" ADD CONSTRAINT "CompanySheet_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPhone" ADD CONSTRAINT "CompanyPhone_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SheetCache" ADD CONSTRAINT "SheetCache_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
