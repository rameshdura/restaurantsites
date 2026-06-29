// =============================================================
// Supabase Database Types — RestaurantSite
// Auto-maintained to match supabase/migrations/002_rename_to_stores.sql
// =============================================================

// ─── Enums ────────────────────────────────────────────────────

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show"

export type StoreUserRole = "owner" | "manager" | "staff"
export type RestaurantUserRole = StoreUserRole

export type OAuthProvider = "google" | "outlook" | "apple" | "todoist" | "slack"

export type CalendarProvider = "google" | "outlook" | "apple"

export type SessionStatus = "active" | "completed" | "abandoned"

// ─── Table Types ──────────────────────────────────────────────

export interface Store {
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

export type Restaurant = Store

export interface StoreUser {
  id: string
  store_id: string
  restaurant_id?: string // alias
  user_id: string
  role: StoreUserRole
  created_at: string
}

export type RestaurantUser = StoreUser

export interface BookingSettings {
  store_id: string
  restaurant_id?: string // alias
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
  store_id?: string
  restaurant_id?: string // alias
  store_slug?: string
  restaurant_slug?: string // alias
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
  store_id: string
  restaurant_id?: string // alias
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
  store_id: string
  restaurant_id?: string // alias
  assistant_name: string
  welcome_message: string | null
  system_prompt: string | null
  language: string
  booking_prompt: string | null
  updated_at: string
}

export interface KnowledgeBaseEntry {
  id: string
  store_id: string
  restaurant_id?: string // alias
  category: string | null // 'menu' | 'faq' | 'about' | 'policy' | 'hours'
  title: string | null
  content: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  role: "user" | "bot" | "assistant" | "system" | "model"
  content: string
  created_at?: string
  showContactButtons?: boolean
}

export interface ConversationSession {
  id: string
  store_id: string
  restaurant_id?: string // alias
  store_slug: string
  restaurant_slug?: string // alias
  session_id: string
  customer_name: string | null
  last_message_at: string
  status: SessionStatus
  created_at: string
  updated_at: string
  messages?: ChatMessage[]
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
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
      | "restaurant_id"
      | "restaurant_slug"
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

export type InsertStore = Omit<Store, "id" | "created_at" | "updated_at"> &
  Partial<Pick<Store, "id">>

export type InsertRestaurant = InsertStore

// ─── Default Booking Settings Fallback ───────────────────────
// Used when no booking_settings row exists for a store.

export const DEFAULT_BOOKING_SETTINGS: Omit<
  BookingSettings,
  "store_id" | "updated_at"
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
      stores: {
        Row: Store
        Insert: InsertStore
        Update: Partial<InsertStore>
      }
      restaurants: {
        Row: Store
        Insert: InsertStore
        Update: Partial<InsertStore>
      }
      store_users: {
        Row: StoreUser
        Insert: Omit<StoreUser, "id" | "created_at">
        Update: Partial<Pick<StoreUser, "role">>
      }
      restaurant_users: {
        Row: StoreUser
        Insert: Omit<StoreUser, "id" | "created_at">
        Update: Partial<Pick<StoreUser, "role">>
      }
      booking_settings: {
        Row: BookingSettings
        Insert: Omit<BookingSettings, "updated_at">
        Update: Partial<Omit<BookingSettings, "store_id" | "updated_at">>
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
        Update: Partial<Omit<ChatbotSettings, "store_id" | "updated_at">>
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
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "created_at" | "updated_at">
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>
      }
    }
  }
}
