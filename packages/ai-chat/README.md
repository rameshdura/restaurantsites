# AI Chat Module (`@workspace/ai-chat`)

## 1. Context & Purpose (Why it is here)
The `ai-chat` package contains the prompt configurations, tool schemas, and core response generation logic for the restaurant AI assistant.

By encapsulating this behavior:
* We ensure the AI assistant represents the restaurant's brand, menu, and availability rules consistently, regardless of whether it's accessed via the website's chat widget, WhatsApp, an SMS bot, or the Model Context Protocol (MCP) server.
* The system prompt guidelines and Gemini/AWS Bedrock SDK interactions are isolated from Next.js route details.
* We can modify, version, and tune prompt declarations without deploying updates to the frontend layout.

---

## 2. Scope & Responsibilities (What it does vs. doesn't do)

### The Module DOES:
* **Expose Tool Declarations:** Export function calling schemas (Gemini tool format) for checking availability, making bookings, getting menu data, and retrieving restaurant info.
* **Build System Prompts:** Generate the standard context prompt mapping the restaurant’s details (opening hours, cuisine style, guidelines) to control the LLM's persona.
* **Normalize Messaging History:** Structure message lists for SDK consumption (Gemini `Content[]` structure or Bedrock formats).

### The Module DOES NOT:
* **Validate Booking Feasibility directly:** It defines the *schema* of the `check_booking_availability` and `create_booking` tools, but delegates their actual execution to the `@workspace/booking-engine`.
* **Persist Chat Sessions:** Storing user messages in database tables or `localStorage` is handled by the application layer.

---

## 3. Relatives & Dependencies
* **Google Generative AI (`@google/generative-ai`):** Used to interface with Gemini models.
* **AWS Bedrock Runtime SDK (`@aws-sdk/client-bedrock-runtime`):** Used for Bedrock Converse interfaces.
* **Relatives:** Imported by `apps/web` (triggers streaming chat endpoints).

---

## 4. Usage Guide

### Getting Tool Definitions for LLM Initialization
```typescript
import { toolDeclarations } from '@workspace/ai-chat';

// Provide toolDeclarations to the Gemini API client config:
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  tools: [{ functionDeclarations: toolDeclarations }]
});
```

### Constructing Restaurant System Prompt
```typescript
import { buildSystemPrompt } from '@workspace/ai-chat';

const systemPrompt = buildSystemPrompt({
  restaurantName: "Sushi Zen",
  cuisineType: "Japanese Sushi",
  additionalInstructions: "Always recommend our signature Wagyu Roll."
});
```
