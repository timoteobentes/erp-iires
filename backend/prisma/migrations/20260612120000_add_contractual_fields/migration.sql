-- Add contractual / payment fields to users
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "pis" TEXT,
  ADD COLUMN IF NOT EXISTS "voterRegistration" TEXT,
  ADD COLUMN IF NOT EXISTS "hasCnpj" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "cnpjNumber" TEXT,
  ADD COLUMN IF NOT EXISTS "issuesInvoice" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "bankName" TEXT,
  ADD COLUMN IF NOT EXISTS "bankAccount" TEXT,
  ADD COLUMN IF NOT EXISTS "bankAgency" TEXT,
  ADD COLUMN IF NOT EXISTS "pixKey" TEXT,
  ADD COLUMN IF NOT EXISTS "salary" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "workDays" TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "workHours" TEXT,
  ADD COLUMN IF NOT EXISTS "documents" JSONB;

-- Add organisational + schedule + documents fields to volunteers
ALTER TABLE "volunteers"
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "level" TEXT,
  ADD COLUMN IF NOT EXISTS "group" TEXT,
  ADD COLUMN IF NOT EXISTS "workDays" TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "workHours" TEXT,
  ADD COLUMN IF NOT EXISTS "documents" JSONB;
