CREATE TABLE IF NOT EXISTS pageviews (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  path          TEXT        NOT NULL,
  referrer      TEXT,
  country       TEXT,
  visitor_hash  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pageviews_created_at_idx ON pageviews (created_at DESC);
CREATE INDEX IF NOT EXISTS pageviews_path_idx       ON pageviews (path);
CREATE INDEX IF NOT EXISTS pageviews_visitor_idx    ON pageviews (visitor_hash, created_at);
