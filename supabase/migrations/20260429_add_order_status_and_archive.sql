-- Status dropdown per order
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_status TEXT DEFAULT 'Nieuw';

-- Archivering
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS archive_folder TEXT DEFAULT NULL;
