-- =============================================================
-- Migration 002: Rename Restaurants to Stores & Add Profiles
-- =============================================================

-- 1. Rename Tables
ALTER TABLE public.restaurants RENAME TO stores;
ALTER TABLE public.restaurant_users RENAME TO store_users;

-- 2. Rename Column References in store_users
ALTER TABLE public.store_users RENAME COLUMN restaurant_id TO store_id;

-- 3. Rename Column References in booking_settings
ALTER TABLE public.booking_settings RENAME COLUMN restaurant_id TO store_id;

-- 4. Rename Column References in reservations
ALTER TABLE public.reservations RENAME COLUMN restaurant_id TO store_id;
ALTER TABLE public.reservations RENAME COLUMN restaurant_slug TO store_slug;

-- 5. Rename Column References in oauth_connections
ALTER TABLE public.oauth_connections RENAME COLUMN restaurant_id TO store_id;

-- 6. Rename Column References in chatbot_settings
ALTER TABLE public.chatbot_settings RENAME COLUMN restaurant_id TO store_id;

-- 7. Rename Column References in knowledge_base
ALTER TABLE public.knowledge_base RENAME COLUMN restaurant_id TO store_id;

-- 8. Rename Column References in conversation_sessions
ALTER TABLE public.conversation_sessions RENAME COLUMN restaurant_id TO store_id;
ALTER TABLE public.conversation_sessions RENAME COLUMN restaurant_slug TO store_slug;

-- 9. Rename Indexes for Consistency
ALTER INDEX idx_reservations_restaurant_id RENAME TO idx_reservations_store_id;
ALTER INDEX idx_reservations_slug RENAME TO idx_reservations_store_slug;
ALTER INDEX idx_reservations_slug_date RENAME TO idx_reservations_store_slug_date;
ALTER INDEX idx_knowledge_restaurant RENAME TO idx_knowledge_store_id;
ALTER INDEX idx_knowledge_category RENAME TO idx_knowledge_store_category;
ALTER INDEX idx_oauth_restaurant RENAME TO idx_oauth_store_id;
ALTER INDEX idx_sessions_slug RENAME TO idx_sessions_store_slug;

-- 10. Create Profiles Table (Linked 1-to-1 with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  email       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Trigger handle_updated_at on profiles table
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles (public user profiles)
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 11. Profile Auto-Sync Trigger from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
