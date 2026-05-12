CREATE TABLE IF NOT EXISTS abandoned_carts (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT        NOT NULL UNIQUE,
  naam       TEXT,
  status     TEXT        NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT abandoned_carts_status_check CHECK (status IN ('pending', 'completed', 'reminded'))
);

CREATE INDEX IF NOT EXISTS idx_abandoned_carts_status_created
  ON abandoned_carts (status, created_at);
