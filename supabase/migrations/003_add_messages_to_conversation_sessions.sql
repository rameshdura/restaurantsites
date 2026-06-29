-- =============================================================
-- Migration 003: Add Messages JSONB Column to Conversation Sessions
-- =============================================================

ALTER TABLE public.conversation_sessions
ADD COLUMN IF NOT EXISTS messages jsonb DEFAULT '[]'::jsonb;
