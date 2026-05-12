-- Voeg lokale song URLs en vervaldatum toe aan orders tabel
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS song_url_1   TEXT,
  ADD COLUMN IF NOT EXISTS song_url_2   TEXT,
  ADD COLUMN IF NOT EXISTS expires_at   TIMESTAMPTZ;
