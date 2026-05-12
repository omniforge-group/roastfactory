create table if not exists orders (
  -- Primaire sleutel
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Status: pending → paid → in_progress → delivered
  status text not null default 'pending',

  -- Pakket en prijs
  package text not null,
  price numeric not null,

  -- Klantgegevens
  customer_name text not null,
  customer_email text not null,

  -- Roast details
  roast_target text not null,
  occasion text,
  roast_level text,
  inside_jokes text,
  extra_info text,

  -- Levering (ingevuld door admin)
  lyrics text,
  audio_url text,
  delivered_at timestamptz,

  -- Stripe
  stripe_session_id text unique,
  stripe_payment_intent text unique
);

-- Beperk geldige statussen
alter table orders
  add constraint orders_status_check
  check (status in ('pending', 'paid', 'in_progress', 'delivered'));

-- Beperk geldige pakketten
alter table orders
  add constraint orders_package_check
  check (package in ('quick_roast', 'savage_pack', 'nuclear_pack', 'battle_mode'));

-- Index voor admin-overzicht (nieuwste eerst)
create index if not exists orders_created_at_idx on orders (created_at desc);

-- Index voor snelle lookup via Stripe webhook
create index if not exists orders_stripe_session_idx on orders (stripe_session_id);
create index if not exists orders_status_idx on orders (status);

-- Row Level Security: alleen service role heeft toegang (admin + webhooks)
alter table orders enable row level security;
