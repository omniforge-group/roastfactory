-- Admin gebruikers
CREATE TABLE IF NOT EXISTS admin_users (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL UNIQUE,
  password_hash TEXT       NOT NULL,
  role         TEXT        NOT NULL DEFAULT 'medewerker'
                           CHECK (role IN ('admin', 'medewerker', 'tier2')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login   TIMESTAMPTZ,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE
);

-- Activiteitenlog
CREATE TABLE IF NOT EXISTS activity_log (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT,
  user_name  TEXT        NOT NULL,
  action     TEXT        NOT NULL,
  details    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_log_created_at_idx ON activity_log (created_at DESC);
CREATE INDEX IF NOT EXISTS activity_log_action_idx     ON activity_log (action);
