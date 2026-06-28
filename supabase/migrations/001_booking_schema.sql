-- =============================================================
-- RestaurantSite – Booking & Calendar Schema (MVP)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. Helper trigger: auto-update updated_at on every mutation
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─────────────────────────────────────────────────────────────
-- 1. Restaurants
--    Slug maps 1-to-1 with the existing data.json files.
--    Restaurant config still lives in data.json;
--    this row is the anchor for all operational data.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.restaurants (
  id               uuid        primary key default gen_random_uuid(),
  slug             text        unique not null,
  name             text        not null,
  phone            text,
  email            text,
  address          text,
  timezone         text        not null default 'Asia/Tokyo',
  booking_enabled  boolean     not null default true,
  chat_enabled     boolean     not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger restaurants_updated_at
  before update on public.restaurants
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 2. Restaurant Users
--    Links Supabase Auth users to restaurants with a role.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.restaurant_users (
  id             uuid        primary key default gen_random_uuid(),
  restaurant_id  uuid        not null references public.restaurants(id) on delete cascade,
  user_id        uuid        not null references auth.users(id)          on delete cascade,
  role           text        not null check (role in ('owner', 'manager', 'staff')),
  created_at     timestamptz not null default now(),
  unique (restaurant_id, user_id)
);

-- ─────────────────────────────────────────────────────────────
-- 3. Booking Settings  (1 row per restaurant)
--    Slot rules: duration, party size, advance days, hours.
--    Falls back to these defaults if no row exists.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.booking_settings (
  restaurant_id           uuid     primary key references public.restaurants(id) on delete cascade,
  booking_enabled         boolean  not null default true,
  slot_duration_minutes   integer  not null default 30,
  max_party_size          integer  not null default 8,
  max_days_in_advance     integer  not null default 30,
  opening_time            time     not null default '11:00',
  closing_time            time     not null default '22:00',
  buffer_between_bookings integer  not null default 0,   -- minutes between slots
  auto_confirm            boolean  not null default true,
  timezone                text     not null default 'Asia/Tokyo',
  updated_at              timestamptz not null default now()
);

create trigger booking_settings_updated_at
  before update on public.booking_settings
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 4. Reservations
--    Core operational table — replaces Prisma SQLite Booking.
--    calendar_provider / calendar_event_id added for sync.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.reservations (
  id                 uuid        primary key default gen_random_uuid(),
  restaurant_id      uuid        not null references public.restaurants(id) on delete cascade,
  restaurant_slug    text        not null,   -- denormalized for fast slug-based queries
  customer_name      text        not null,
  customer_email     text,
  customer_phone     text,
  party_size         integer     not null check (party_size > 0),
  reservation_date   date        not null,
  reservation_time   time        not null,
  status             text        not null default 'pending'
                                 check (status in (
                                   'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
                                 )),
  notes              text,
  -- Calendar integration fields
  calendar_provider  text,       -- 'google' | 'outlook' | 'apple'
  calendar_event_id  text,       -- external event ID after sync
  -- Audit
  created_by         uuid        references auth.users(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger reservations_updated_at
  before update on public.reservations
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 5. OAuth Connections
--    One row per restaurant per provider.
--    Stores encrypted refresh/access tokens.
--    Supports: Google Calendar, Outlook, Apple, Todoist, Slack
-- ─────────────────────────────────────────────────────────────
create table if not exists public.oauth_connections (
  id             uuid        primary key default gen_random_uuid(),
  restaurant_id  uuid        not null references public.restaurants(id) on delete cascade,
  user_id        uuid        not null references auth.users(id)          on delete cascade,
  provider       text        not null,  -- 'google' | 'outlook' | 'apple' | 'todoist' | 'slack'
  account_email  text,
  refresh_token  text,
  access_token   text,
  expires_at     timestamptz,
  scopes         text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (restaurant_id, provider)
);

create trigger oauth_connections_updated_at
  before update on public.oauth_connections
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 6. Chatbot Settings  (1 row per restaurant)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.chatbot_settings (
  restaurant_id   uuid    primary key references public.restaurants(id) on delete cascade,
  assistant_name  text    not null default 'Restaurant AI',
  welcome_message text,
  system_prompt   text,
  language        text    not null default 'en',
  booking_prompt  text,
  updated_at      timestamptz not null default now()
);

create trigger chatbot_settings_updated_at
  before update on public.chatbot_settings
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 7. Knowledge Base
--    Structured content chunks for the AI chatbot.
--    category: 'menu' | 'faq' | 'about' | 'policy' | 'hours'
-- ─────────────────────────────────────────────────────────────
create table if not exists public.knowledge_base (
  id             uuid        primary key default gen_random_uuid(),
  restaurant_id  uuid        not null references public.restaurants(id) on delete cascade,
  category       text,
  title          text,
  content        text        not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger knowledge_base_updated_at
  before update on public.knowledge_base
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 8. Conversation Sessions
--    Persistent chatbot sessions — lets AI resume booking flows.
--    "You were trying to book a table for Saturday at 7 PM..."
-- ─────────────────────────────────────────────────────────────
create table if not exists public.conversation_sessions (
  id              uuid        primary key default gen_random_uuid(),
  restaurant_id   uuid        not null references public.restaurants(id) on delete cascade,
  restaurant_slug text        not null,
  session_id      text        not null,  -- client-generated UUID from browser
  customer_name   text,
  last_message_at timestamptz not null default now(),
  status          text        not null default 'active'
                              check (status in ('active', 'completed', 'abandoned')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (restaurant_slug, session_id)
);

create trigger conversation_sessions_updated_at
  before update on public.conversation_sessions
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Indexes — keep queries fast
-- ─────────────────────────────────────────────────────────────
create index if not exists idx_reservations_restaurant_id
  on public.reservations(restaurant_id);

create index if not exists idx_reservations_slug
  on public.reservations(restaurant_slug);

create index if not exists idx_reservations_date
  on public.reservations(reservation_date);

create index if not exists idx_reservations_status
  on public.reservations(status);

create index if not exists idx_reservations_slug_date
  on public.reservations(restaurant_slug, reservation_date);

create index if not exists idx_knowledge_restaurant
  on public.knowledge_base(restaurant_id);

create index if not exists idx_knowledge_category
  on public.knowledge_base(restaurant_id, category);

create index if not exists idx_oauth_restaurant
  on public.oauth_connections(restaurant_id);

create index if not exists idx_sessions_slug
  on public.conversation_sessions(restaurant_slug, session_id);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
--    Service role key (used by API routes & MCP server)
--    bypasses RLS automatically in Supabase.
--    These policies cover the anon/public access surface.
-- ─────────────────────────────────────────────────────────────
alter table public.restaurants           enable row level security;
alter table public.restaurant_users      enable row level security;
alter table public.booking_settings      enable row level security;
alter table public.reservations          enable row level security;
alter table public.oauth_connections     enable row level security;
alter table public.chatbot_settings      enable row level security;
alter table public.knowledge_base        enable row level security;
alter table public.conversation_sessions enable row level security;

-- Allow anonymous customers to create reservations (the booking form is public)
create policy "Public can insert reservations"
  on public.reservations for insert
  with check (true);

-- Allow anonymous customers to read booking_settings (for the booking widget)
create policy "Public can read booking_settings"
  on public.booking_settings for select
  using (true);

-- Allow anon to upsert conversation sessions (chatbot sessions are client-scoped)
create policy "Public can manage own sessions"
  on public.conversation_sessions for all
  using (true)
  with check (true);
