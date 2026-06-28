import { NextResponse } from "next/server"
import {
  GoogleGenerativeAI,
  SchemaType,
  Content,
  Part,
} from "@google/generative-ai"
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime"
import { supabaseServer } from "@/lib/supabase"
import { getRestaurant } from "@/lib/restaurant"
import { checkAvailability } from "@/lib/availability"

// Initialize Gemini SDK safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenerativeAI(apiKey)
}

// Helper to resolve restaurant_id from slug
async function getRestaurantId(slug: string): Promise<string | null> {
  const { data } = await supabaseServer
    .from("restaurants")
    .select("id")
    .eq("slug", slug)
    .single()
  return data?.id ?? null
}

// ─── Tool Definitions (Gemini format) ────────────────────────
const getRestaurantInfoDeclaration = {
  name: "get_restaurant_info",
  description:
    "Get general restaurant info such as name, address, contact details, description, and opening hours.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      slug: {
        type: SchemaType.STRING,
        description: "The restaurant slug (e.g. gorkha)",
      },
    },
    required: ["slug"],
  },
}

const getMenuDeclaration = {
  name: "get_menu",
  description:
    "Get the restaurant's complete menu categories and items (including names, descriptions, prices, popular items, vegetarian/vegan tags, and spicy levels).",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      slug: {
        type: SchemaType.STRING,
        description: "The restaurant slug (e.g. gorkha)",
      },
    },
    required: ["slug"],
  },
}

const checkBookingAvailabilityDeclaration = {
  name: "check_booking_availability",
  description:
    "Checks table availability for a specific date, time, and party size.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      slug: {
        type: SchemaType.STRING,
        description: "The restaurant slug (e.g. gorkha)",
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

const createBookingDeclaration = {
  name: "create_booking",
  description:
    "Creates and confirms a table booking. IMPORTANT: Always run check_booking_availability first. You must ask the user for their name, email, and phone number before calling this.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      slug: {
        type: SchemaType.STRING,
        description: "The restaurant slug (e.g. gorkha)",
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

const geminiTools: any = [
  {
    functionDeclarations: [
      getRestaurantInfoDeclaration,
      getMenuDeclaration,
      checkBookingAvailabilityDeclaration,
      createBookingDeclaration,
    ],
  },
]

// ─── OpenAI Tool Definitions (for NVIDIA NIM and Ollama) ────────
const openAiTools = [
  {
    type: "function",
    function: {
      name: "get_restaurant_info",
      description:
        "Get general restaurant info such as name, address, contact details, description, and opening hours.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "The restaurant slug (e.g. gorkha)",
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
      description: "Get the restaurant's complete menu categories and items.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "The restaurant slug (e.g. gorkha)",
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
            description: "The restaurant slug (e.g. gorkha)",
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
        "Creates and confirms a table booking. Always run check_booking_availability first.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "The restaurant slug (e.g. gorkha)",
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
]

// ─── Bedrock Tool Definitions ─────────────────────────────────
const bedrockTools = {
  tools: [
    {
      toolSpec: {
        name: "get_restaurant_info",
        description:
          "Get general restaurant info such as name, address, contact details, description, and opening hours.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              slug: {
                type: "string",
                description: "The restaurant slug (e.g. gorkha)",
              },
            },
            required: ["slug"],
          },
        },
      },
    },
    {
      toolSpec: {
        name: "get_menu",
        description: "Get the restaurant's complete menu categories and items.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              slug: {
                type: "string",
                description: "The restaurant slug (e.g. gorkha)",
              },
            },
            required: ["slug"],
          },
        },
      },
    },
    {
      toolSpec: {
        name: "check_booking_availability",
        description:
          "Checks table availability for a specific date, time, and party size.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              slug: {
                type: "string",
                description: "The restaurant slug (e.g. gorkha)",
              },
              date: { type: "string", description: "Date in YYYY-MM-DD" },
              time: { type: "string", description: "Time in HH:MM" },
              partySize: { type: "number" },
            },
            required: ["slug", "date", "time", "partySize"],
          },
        },
      },
    },
    {
      toolSpec: {
        name: "create_booking",
        description:
          "Creates and confirms a table booking. Always run check_booking_availability first.",
        inputSchema: {
          json: {
            type: "object",
            properties: {
              slug: {
                type: "string",
                description: "The restaurant slug (e.g. gorkha)",
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
    },
  ],
}

// ─── Tool Call Router / Executor ──────────────────────────────
async function executeTool(
  name: string,
  args: any,
  restaurantData: any,
  slug: string,
  origin: string
) {
  if (name === "get_restaurant_info") {
    return {
      name: restaurantData.name,
      address: restaurantData.address,
      phone: restaurantData.phone,
      email: restaurantData.email,
      description: restaurantData.description,
      openingHours: restaurantData.openingHours,
      holidayNotes: restaurantData.holidayNotes,
    }
  } else if (name === "get_menu") {
    return {
      menuCategories: restaurantData.menuCategories,
      menu: restaurantData.menu,
    }
  } else if (name === "check_booking_availability") {
    return await checkAvailability(
      slug,
      args.date,
      args.time,
      Number(args.partySize)
    )
  } else if (name === "create_booking") {
    const bookingRes = await fetch(`${origin}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantSlug: slug,
        date: args.date,
        time: args.time,
        partySize: args.partySize,
        customerName: args.customerName,
        customerEmail: args.customerEmail,
        customerPhone: args.customerPhone,
        notes: args.notes || "",
      }),
    })
    return await bookingRes.json()
  }
  throw new Error(`Unknown tool: ${name}`)
}

// ─── POST /api/chat ───────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const provider = process.env.CHAT_PROVIDER || "gemini"
    const { restaurantSlug, messages } = await request.json()

    if (!restaurantSlug || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Missing restaurantSlug or messages" },
        { status: 400 }
      )
    }

    const restaurant = await getRestaurant(restaurantSlug)
    if (!restaurant) {
      return NextResponse.json(
        { error: `Restaurant "${restaurantSlug}" not found` },
        { status: 404 }
      )
    }

    const restaurantId = await getRestaurantId(restaurantSlug)
    const { data: restaurantData } = restaurant

    const today = new Date()
    const todayStr = today.toISOString().split("T")[0]
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0]
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + 90)
    const maxDateStr = maxDate.toISOString().split("T")[0]

    // ─────────────────────────────────────────────────────────────────────────
    // 💡 CUSTOMIZABLE CHATBOT PRETEXT / SYSTEM PROMPT
    // Edit the text below to change the personality, instructions, or behavior
    // of your AI chatbot.
    // ─────────────────────────────────────────────────────────────────────────
    let systemPrompt = `You are a helpful AI assistant for "${restaurantData.name || restaurantSlug}".
Current Date (Today): ${todayStr} (Sunday)
Allowed Booking Range: From tomorrow (${tomorrowStr}) to 90 days from now (${maxDateStr}) only.

Rules & Guidelines:
1. DATE VALIDATION: Do not book any past dates or years. If the customer does not mention a year, assume it is the current year or the coming year (matching the allowed booking range).
2. BOOKING RANGE: Bookings are strictly allowed from next day (${tomorrowStr}) up to 90 days in the future (${maxDateStr}) only. Reject bookings outside this window.
3. CONCISE RESPONSES: Only give information explicitly asked by the customer. Never output details, menus, or answers that were not requested.
4. BOOKING FLOW: If they want a booking:
   a. Check availability using check_booking_availability first.
   b. Ask for name, email, and phone number if not already provided.
   c. Confirm details, then use create_booking to complete the reservation.`
    // ─────────────────────────────────────────────────────────────────────────

    if (restaurantId) {
      const { data: settings } = await supabaseServer
        .from("chatbot_settings")
        .select("system_prompt")
        .eq("restaurant_id", restaurantId)
        .single()
      if (settings?.system_prompt) systemPrompt = settings.system_prompt
    }

    const origin = new URL(request.url).origin

    // ─── Gemini Provider ──────────────────────────────────────
    if (provider === "gemini") {
      const genAI = getGeminiClient()
      if (!genAI) {
        return NextResponse.json(
          { error: "Gemini API key not configured." },
          { status: 503 }
        )
      }

      const formattedHistory: Content[] = messages.map((m: any) => ({
        role: m.role === "bot" || m.role === "model" ? "model" : "user",
        parts: [{ text: m.content || "" }],
      }))

      const lastUserMessage = formattedHistory.pop()
      if (!lastUserMessage) {
        return NextResponse.json(
          { error: "Empty message history" },
          { status: 400 }
        )
      }

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: systemPrompt,
      })

      const contents: Content[] = [...formattedHistory, lastUserMessage]
      let response = await model.generateContent({
        contents,
        tools: geminiTools,
      })

      let loops = 0
      let functionCalls = response.response.functionCalls
        ? response.response.functionCalls()
        : undefined

      while (functionCalls && functionCalls.length > 0 && loops < 6) {
        loops++
        const candidate = response.response.candidates?.[0]
        if (!candidate || !candidate.content) break
        contents.push(candidate.content)

        const functionResponseParts: Part[] = []
        for (const call of functionCalls) {
          const { name, args } = call as { name: string; args: any }
          const result = await executeTool(
            name,
            args,
            restaurantData,
            restaurantSlug,
            origin
          )
          functionResponseParts.push({
            functionResponse: { name, response: { result } },
          })
        }

        contents.push({ role: "function", parts: functionResponseParts })
        response = await model.generateContent({ contents, tools: geminiTools })
        functionCalls = response.response.functionCalls
          ? response.response.functionCalls()
          : undefined
      }

      return NextResponse.json({
        reply: response.response.text || "I was unable to generate a response.",
      })
    }

    // ─── OpenAI-Compatible Providers (NVIDIA NIM / Ollama) ────
    if (provider === "nvidia" || provider === "ollama") {
      let endpoint = ""
      let headers: HeadersInit = { "Content-Type": "application/json" }
      let modelId = ""

      if (provider === "nvidia") {
        const apiKey = process.env.NVIDIA_API_KEY
        if (!apiKey)
          return NextResponse.json(
            { error: "NVIDIA API key not configured." },
            { status: 503 }
          )
        endpoint = "https://integrate.api.nvidia.com/v1/chat/completions"
        headers["Authorization"] = `Bearer ${apiKey}`
        modelId = process.env.NVIDIA_MODEL_ID || "meta/llama-3.1-70b-instruct"
      } else {
        const host = process.env.OLLAMA_HOST || "http://localhost:11434"
        endpoint = `${host.replace(/\/$/, "")}/v1/chat/completions`
        modelId = process.env.OLLAMA_MODEL_ID || "llama3.1"
      }

      // Convert messages to OpenAI chat format
      const openAiMessages: any[] = [
        { role: "system", content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role === "bot" ? "assistant" : "user",
          content: m.content,
        })),
      ]

      let loops = 0
      let active = true
      let finalReply = ""

      while (active && loops < 6) {
        loops++
        const res = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: modelId,
            messages: openAiMessages,
            tools: openAiTools,
            tool_choice: "auto",
          }),
        })

        if (!res.ok) {
          const err = await res.text()
          return NextResponse.json(
            { error: `Provider ${provider} returned error`, details: err },
            { status: 502 }
          )
        }

        const data = await res.json()
        const choice = data.choices?.[0]
        const message = choice?.message

        if (!message) break

        openAiMessages.push(message)

        if (message.tool_calls && message.tool_calls.length > 0) {
          for (const call of message.tool_calls) {
            const { name, arguments: argsString } = call.function
            const args =
              typeof argsString === "string"
                ? JSON.parse(argsString)
                : argsString
            const result = await executeTool(
              name,
              args,
              restaurantData,
              restaurantSlug,
              origin
            )

            openAiMessages.push({
              role: "tool",
              tool_call_id: call.id,
              name: name,
              content: JSON.stringify(result),
            })
          }
        } else {
          finalReply = message.content || ""
          active = false
        }
      }

      return NextResponse.json({
        reply: finalReply || "Unable to generate a reply.",
      })
    }

    // ─── AWS Bedrock Provider ─────────────────────────────────
    if (provider === "bedrock") {
      const client = new BedrockRuntimeClient({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
      })

      // Convert messages to Bedrock Converse format
      const bedrockMessages: any[] = messages.map((m: any) => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: [{ text: m.content }],
      }))

      let loops = 0
      let active = true
      let finalReply = ""

      while (active && loops < 6) {
        loops++
        const command = new ConverseCommand({
          modelId:
            process.env.BEDROCK_MODEL_ID ||
            "anthropic.claude-3-5-sonnet-20241022-v2:0",
          messages: bedrockMessages,
          system: [{ text: systemPrompt }],
          toolConfig: bedrockTools as any,
        })

        const response = await client.send(command)
        const outputMessage = response.output?.message
        if (!outputMessage) break

        bedrockMessages.push(outputMessage)

        const toolRequests = outputMessage.content?.filter((c) => c.toolUse)

        if (toolRequests && toolRequests.length > 0) {
          const toolResponseParts: any[] = []

          for (const request of toolRequests) {
            const { name, input, toolUseId } = request.toolUse!
            if (!name) continue
            const result = await executeTool(
              name,
              input,
              restaurantData,
              restaurantSlug,
              origin
            )

            toolResponseParts.push({
              toolResult: {
                toolUseId,
                content: [{ json: result }],
                status: "success",
              },
            })
          }

          bedrockMessages.push({
            role: "user",
            content: toolResponseParts,
          })
        } else {
          finalReply = outputMessage.content?.[0]?.text || ""
          active = false
        }
      }

      return NextResponse.json({
        reply: finalReply || "Unable to generate a response from Bedrock.",
      })
    }

    return NextResponse.json(
      { error: `Unknown provider: ${provider}` },
      { status: 400 }
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    console.error("[POST /api/chat] Error:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: msg },
      { status: 500 }
    )
  }
}
