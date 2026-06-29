import { SchemaType } from "@google/generative-ai"

// ─── Tool Declarations (Gemini format) ────────────────────────
export const getStoreInfoDeclaration = {
  name: "get_restaurant_info",
  description:
    "Get general store or restaurant info such as name, address, contact details, description, and opening hours.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      slug: {
        type: SchemaType.STRING,
        description: "The store or restaurant slug (e.g. gorkha)",
      },
    },
    required: ["slug"],
  },
}

export const getRestaurantInfoDeclaration = getStoreInfoDeclaration;

export const escalateToHumanDeclaration = {
  name: "escalate_to_human",
  description:
    "Call this function when you cannot answer the customer's request, when the customer is unsatisfied with your answers, when the customer explicitly asks to speak to a human, or when you cannot proceed with a booking. This will display buttons for direct communication channels (like WhatsApp, Messenger, or LINE) to the user.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      reason: {
        type: SchemaType.STRING,
        description: "The reason why escalation is needed (e.g. 'Customer is unhappy with booking limits' or 'Question about off-menu allergens')",
      },
    },
    required: ["reason"],
  },
}

export const getMenuDeclaration = {
  name: "get_menu",
  description:
    "Get the store's complete menu categories and items (including names, descriptions, prices, popular items, vegetarian/vegan tags, and spicy levels).",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      slug: {
        type: SchemaType.STRING,
        description: "The store slug (e.g. gorkha)",
      },
    },
    required: ["slug"],
  },
}

export const checkBookingAvailabilityDeclaration = {
  name: "check_booking_availability",
  description:
    "Checks table availability for a specific date, time, and party size.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      slug: {
        type: SchemaType.STRING,
        description: "The store slug (e.g. gorkha)",
      },
      date: {
        type: SchemaType.STRING,
        description: "Date in YYYY-MM-DD format (e.g. 2026-06-29)",
      },
      time: {
        type: SchemaType.STRING,
        description: "Time in HH:MM format (e.g. 19:00)",
      },
      partySize: {
        type: SchemaType.NUMBER,
        description: "Number of guests in the party",
      },
    },
    required: ["slug", "date", "time", "partySize"],
  },
}

export const createBookingDeclaration = {
  name: "create_booking",
  description:
    "Creates and confirms a table booking. IMPORTANT: Always run check_booking_availability first. You must ask the user for their name, email, and phone number before calling this.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      slug: {
        type: SchemaType.STRING,
        description: "The store slug (e.g. gorkha)",
      },
      date: {
        type: SchemaType.STRING,
        description: "Date in YYYY-MM-DD format (e.g. 2026-06-29)",
      },
      time: {
        type: SchemaType.STRING,
        description: "Time in HH:MM format (e.g. 19:00)",
      },
      partySize: { type: SchemaType.NUMBER, description: "Number of guests" },
      customerName: {
        type: SchemaType.STRING,
        description: "Full name of the customer",
      },
      customerEmail: {
        type: SchemaType.STRING,
        description: "Email address of the customer",
      },
      customerPhone: {
        type: SchemaType.STRING,
        description: "Phone number of the customer",
      },
      notes: {
        type: SchemaType.STRING,
        description:
          "Optional notes or special requests (e.g. high chair, allergy)",
      },
    },
    required: [
      "slug",
      "date",
      "time",
      "partySize",
      "customerName",
      "customerEmail",
      "customerPhone",
    ],
  },
}

export const geminiTools: any = [
  {
    functionDeclarations: [
      getStoreInfoDeclaration,
      getMenuDeclaration,
      checkBookingAvailabilityDeclaration,
      createBookingDeclaration,
      escalateToHumanDeclaration,
    ],
  },
]

// ─── OpenAI Tool Definitions (for NVIDIA NIM and Ollama) ────────
export const openAiTools = [
  {
    type: "function",
    function: {
      name: "get_restaurant_info",
      description:
        "Get general store or restaurant info such as name, address, contact details, description, and opening hours.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "The store slug (e.g. gorkha)",
          },
        },
        required: ["slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_menu",
      description: "Get the store's complete menu categories and items.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "The store slug (e.g. gorkha)",
          },
        },
        required: ["slug"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_booking_availability",
      description:
        "Checks table availability for a specific date, time, and party size.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "The store slug (e.g. gorkha)",
          },
          date: {
            type: "string",
            description: "Date in YYYY-MM-DD format (e.g. 2026-06-29)",
          },
          time: {
            type: "string",
            description: "Time in HH:MM format (e.g. 19:00)",
          },
          partySize: {
            type: "number",
            description: "Number of guests in the party",
          },
        },
        required: ["slug", "date", "time", "partySize"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_booking",
      description:
        "Creates and confirms a table booking. IMPORTANT: Always run check_booking_availability first. You must ask the user for their name, email, and phone number before calling this.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "The store slug (e.g. gorkha)",
          },
          date: { type: "string", description: "Date in YYYY-MM-DD" },
          time: { type: "string", description: "Time in HH:MM" },
          partySize: { type: "number" },
          customerName: { type: "string" },
          customerEmail: { type: "string" },
          customerPhone: { type: "string" },
          notes: { type: "string" },
        },
        required: [
          "slug",
          "date",
          "time",
          "partySize",
          "customerName",
          "customerEmail",
          "customerPhone",
        ],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "escalate_to_human",
      description:
        "Call this function when you cannot answer the customer's request, when the customer is unsatisfied with your answers, when the customer explicitly asks to speak to a human, or when you cannot proceed with a booking. This will display buttons for direct communication channels (like WhatsApp, Messenger, or LINE) to the user.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "The reason why escalation is needed.",
          },
        },
        required: ["reason"],
      },
    },
  },
]

// ─── System Prompt builder ────────────────────────────────────
export function buildSystemPrompt({
  storeName,
  todayStr,
  tomorrowStr,
  maxDateStr,
  customPrompt,
  restaurantName, // Backwards compatibility parameter
}: {
  storeName?: string
  todayStr: string
  tomorrowStr: string
  maxDateStr: string
  customPrompt?: string | null
  restaurantName?: string
}): string {
  if (customPrompt) {
    return customPrompt
  }

  const finalName = storeName || restaurantName || "Store";

  return `You are a helpful AI assistant for "${finalName}".
Current Date (Today): ${todayStr}
Allowed Booking Range: From tomorrow (${tomorrowStr}) to 90 days from now (${maxDateStr}) only.

Rules & Guidelines:
1. DATE VALIDATION: Do not book any past dates or years. If the customer does not mention a year, assume it is the current year or the coming year (matching the allowed booking range).
2. BOOKING RANGE: Bookings are strictly allowed from next day (${tomorrowStr}) up to 90 days in the future (${maxDateStr}) only. Reject bookings outside this window.
3. CONCISE RESPONSES: Only give information explicitly asked by the customer. Never output details, menus, or answers that were not requested.
4. BOOKING FLOW: If they want a booking:
   a. Check availability using check_booking_availability first.
   b. Ask for name, email, and phone number if not already provided.
   c. Confirm details, then use create_booking to complete the reservation.
5. ESCALATION: If the customer is unsatisfied, asks to talk to a human, or you cannot satisfy their request (e.g. booking size exceeds limit, complex off-menu requests), call the escalate_to_human tool immediately so they can contact the shop directly.`
}

// Backwards compatibility wrapper
export function buildSystemPromptRestaurant(args: {
  restaurantName: string
  todayStr: string
  tomorrowStr: string
  maxDateStr: string
  customPrompt?: string | null
}): string {
  return buildSystemPrompt({
    storeName: args.restaurantName,
    ...args
  });
}
