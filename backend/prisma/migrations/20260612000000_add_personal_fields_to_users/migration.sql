-- AlterTable users: campos pessoais para todos os vínculos
ALTER TABLE "users"
  ADD COLUMN "birthDate"     TIMESTAMP(3),
  ADD COLUMN "rg"            TEXT,
  ADD COLUMN "nationality"   TEXT,
  ADD COLUMN "maritalStatus" TEXT;
