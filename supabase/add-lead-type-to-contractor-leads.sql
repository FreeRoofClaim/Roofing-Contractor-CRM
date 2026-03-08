-- Add lead_type column to Contractor_Leads
ALTER TABLE "Contractor_Leads" ADD COLUMN IF NOT EXISTS lead_type TEXT DEFAULT 'complete';
-- Add lead_price column to Contractor_Leads
ALTER TABLE "Contractor_Leads" ADD COLUMN IF NOT EXISTS lead_price INTEGER DEFAULT 150;
-- Backfill existing records
UPDATE "Contractor_Leads" SET lead_type = 'complete', lead_price = 150 WHERE lead_type IS NULL;
