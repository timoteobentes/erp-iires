-- AlterTable users: tipo de vínculo
ALTER TABLE "users" ADD COLUMN "bondType" TEXT NOT NULL DEFAULT 'CLT';

-- AlterTable volunteers: campos para o Termo de Adesão e supervisor
ALTER TABLE "volunteers"
  ADD COLUMN "rg" TEXT,
  ADD COLUMN "nationality" TEXT,
  ADD COLUMN "maritalStatus" TEXT,
  ADD COLUMN "services" TEXT,
  ADD COLUMN "schedule" TEXT,
  ADD COLUMN "supervisorId" TEXT;

-- AddForeignKey: voluntário → supervisor (usuário)
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_supervisorId_fkey"
  FOREIGN KEY ("supervisorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
