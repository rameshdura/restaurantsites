import { NextResponse } from "next/server"
import { GoogleGenerativeAI, Content, Part } from "@google/generative-ai"
import OpenAI from "openai"
import { supabaseServer, getDbTables } from "@/lib/supabase"
import { getRestaurant } from "@/lib/restaurant"
import { checkAvailability } from "@/lib/availability"
import { geminiTools, openAiTools, buildSystemPrompt } from "@workspace/ai-chat"

// Initialize Gemini SDK safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  return new GoogleGenerativeAI(apiKey)
}

// Helper to resolve restaurant_id from slug
async function getRestaurantId(slug: string): Promise<string | null> {
  const db = await getDbTables()
  const { data } = await supabaseServer
    .from(db.stores)
    .select("id")
    .eq("slug", slug)
    .single()
  return data?.id ?? null
}

// Tool definitions are imported from @workspace/ai-chat



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
    const todayStr = today.toISOString().split("T")[0] ?? ""
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0] ?? ""
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + 90)
    const maxDateStr = maxDate.toISOString().split("T")[0] ?? ""

    // ─────────────────────────────────────────────────────────────────────────
    // 💡 CUSTOMIZABLE CHATBOT PRETEXT / SYSTEM PROMPT
    // Edit the text below to change the personality, instructions, or behavior
    // of your AI chatbot.
    // ─────────────────────────────────────────────────────────────────────────
    let customPrompt: string | null = null
    if (restaurantId) {
      const { data: settings } = await supabaseServer
        .from("chatbot_settings")
        .select("system_prompt")
        .eq("restaurant_id", restaurantId)
        .single()
      if (settings?.system_prompt) customPrompt = settings.system_prompt
    }

    const systemPrompt = buildSystemPrompt({
      restaurantName: restaurantData.name || restaurantSlug,
      todayStr,
      tomorrowStr,
      maxDateStr,
      customPrompt,
    })

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
      const apiKey = process.env.BEDROCK_API_KEY
      const baseURL = process.env.BEDROCK_BASE_URL
      const modelId = process.env.BEDROCK_MODEL_ID || "google.gemma-4-e2b"

      if (!apiKey) {
        return NextResponse.json(
          { error: "Bedrock API key not configured." },
          { status: 503 }
        )
      }

      const client = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL,
      })

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
        const completion = await client.chat.completions.create({
          model: modelId,
          messages: openAiMessages,
          tools: openAiTools as any,
          tool_choice: "auto",
        })

        const choice = completion.choices?.[0]
        const message = choice?.message

        if (!message) break

        openAiMessages.push(message)

        if (message.tool_calls && message.tool_calls.length > 0) {
          for (const call of message.tool_calls) {
            const { name, arguments: argsString } = (call as any).function
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
