// =============================================================
// Supabase Database Types — RestaurantSite
// Auto-maintained to match supabase/migrations/001_booking_schema.sql
// =============================================================

// ─── Enums ────────────────────────────────────────────────────

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show"

export type RestaurantUserRole = "owner" | "manager" | "staff"

export type OAuthProvider = "google" | "outlook" | "apple" | "todoist" | "slack"

export type CalendarProvider = "google" | "outlook" | "apple"

export type SessionStatus = "active" | "completed" | "abandoned"

// ─── Table Types ──────────────────────────────────────────────

export interface Restaurant {
  id: string
  slug: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  timezone: string
  booking_enabled: boolean
  chat_enabled: boolean
  created_at: string
  updated_at: string
}

export interface RestaurantUser {
  id: string
  restaurant_id: string
  user_id: string
  role: RestaurantUserRole
  created_at: string
}

export interface BookingSettings {
  restaurant_id: string
  booking_enabled: boolean
  slot_duration_minutes: number
  max_party_size: number
  max_days_in_advance: number
  opening_time: string // "HH:MM:SS"
  closing_time: string // "HH:MM:SS"
  buffer_between_bookings: number
  auto_confirm: boolean
  timezone: string
  updated_at: string
}

export interface Reservation {
  id: string
  restaurant_id: string
  restaurant_slug: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  party_size: number
  reservation_date: string // "YYYY-MM-DD"
  reservation_time: string // "HH:MM:SS"
  status: ReservationStatus
  notes: string | null
  calendar_provider: CalendarProvider | null
  calendar_event_id: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface OAuthConnection {
  id: string
  restaurant_id: string
  user_id: string
  provider: OAuthProvider
  account_email: string | null
  refresh_token: string | null
  access_token: string | null
  expires_at: string | null
  scopes: string | null
  created_at: string
  updated_at: string
}

export interface ChatbotSettings {
  restaurant_id: string
  assistant_name: string
  welcome_message: string | null
  system_prompt: string | null
  language: string
  booking_prompt: string | null
  updated_at: string
}

export interface KnowledgeBaseEntry {
  id: string
  restaurant_id: string
  category: string | null // 'menu' | 'faq' | 'about' | 'policy' | 'hours'
  title: string | null
  content: string
  created_at: string
  updated_at: string
}

export interface ConversationSession {
  id: string
  restaurant_id: string
  restaurant_slug: string
  session_id: string
  customer_name: string | null
  last_message_at: string
  status: SessionStatus
  created_at: string
  updated_at: string
}

// ─── Insert / Update Helpers ──────────────────────────────────

export type InsertReservation = Omit<
  Reservation,
  | "id"
  | "created_at"
  | "updated_at"
  | "calendar_event_id"
  | "calendar_provider"
  | "created_by"
> &
  Partial<
    Pick<
      Reservation,
      | "calendar_event_id"
      | "calendar_provider"
      | "notes"
      | "status"
      | "created_by"
    >
  >

export type UpdateReservation = Partial<
  Pick<
    Reservation,
    | "status"
    | "notes"
    | "calendar_provider"
    | "calendar_event_id"
    | "reservation_date"
    | "reservation_time"
    | "party_size"
    | "customer_name"
    | "customer_email"
    | "customer_phone"
  >
>

export type UpsertBookingSettings = Omit<BookingSettings, "updated_at">

export type InsertRestaurant = Omit<
  Restaurant,
  "id" | "created_at" | "updated_at"
> &
  Partial<Pick<Restaurant, "id">>

// ─── Default Booking Settings Fallback ───────────────────────
// Used when no booking_settings row exists for a restaurant.

export const DEFAULT_BOOKING_SETTINGS: Omit<
  BookingSettings,
  "restaurant_id" | "updated_at"
> = {
  booking_enabled: true,
  slot_duration_minutes: 30,
  max_party_size: 8,
  max_days_in_advance: 30,
  opening_time: "11:00:00",
  closing_time: "22:00:00",
  buffer_between_bookings: 0,
  auto_confirm: true,
  timezone: "Asia/Tokyo",
}

// ─── Supabase Database Schema Type (for createClient generic) ─

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant
        Insert: InsertRestaurant
        Update: Partial<InsertRestaurant>
      }
      restaurant_users: {
        Row: RestaurantUser
        Insert: Omit<RestaurantUser, "id" | "created_at">
        Update: Partial<Pick<RestaurantUser, "role">>
      }
      booking_settings: {
        Row: BookingSettings
        Insert: UpsertBookingSettings
        Update: Partial<UpsertBookingSettings>
      }
      reservations: {
        Row: Reservation
        Insert: InsertReservation
        Update: UpdateReservation
      }
      oauth_connections: {
        Row: OAuthConnection
        Insert: Omit<OAuthConnection, "id" | "created_at" | "updated_at">
        Update: Partial<
          Pick<
            OAuthConnection,
            | "access_token"
            | "refresh_token"
            | "expires_at"
            | "scopes"
            | "account_email"
          >
        >
      }
      chatbot_settings: {
        Row: ChatbotSettings
        Insert: Omit<ChatbotSettings, "updated_at">
        Update: Partial<Omit<ChatbotSettings, "restaurant_id" | "updated_at">>
      }
      knowledge_base: {
        Row: KnowledgeBaseEntry
        Insert: Omit<KnowledgeBaseEntry, "id" | "created_at" | "updated_at">
        Update: Partial<
          Pick<KnowledgeBaseEntry, "category" | "title" | "content">
        >
      }
      conversation_sessions: {
        Row: ConversationSession
        Insert: Omit<ConversationSession, "id" | "created_at" | "updated_at">
        Update: Partial<
          Pick<
            ConversationSession,
            "customer_name" | "last_message_at" | "status"
          >
        >
      }
    }
  }
}
