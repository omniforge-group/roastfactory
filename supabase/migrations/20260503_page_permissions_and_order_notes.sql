CREATE TABLE IF NOT EXISTS page_permissions (
  page_key   TEXT    PRIMARY KEY,
  medewerker BOOLEAN NOT NULL DEFAULT true,
  tier2      BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO page_permissions (page_key, medewerker, tier2) VALUES
  ('dashboard',     true,  true),
  ('orders',        true,  true),
  ('surveys',       true,  true),
  ('stats',         true,  true),
  ('analytics',     true,  true),
  ('werkprocessen', false, true),
  ('kortingscodes', false, false),
  ('gebruikers',    false, false),
  ('activiteiten',  false, true),
  ('toegang',       false, false)
ON CONFLICT (page_key) DO NOTHING;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes TEXT;
