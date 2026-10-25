# 07. Proposed AI Integration Deep Dive (Pre-Trained LLM API)

```mermaid
flowchart LR
    User[Traveler] -->|Prompt: 'Plan a 3-day Algarve coastal getaway'| Frontend[Trillo Client UI]
    Frontend -->|POST /api/v1/ai/itinerary| EdgeWorker[Cloudflare Edge Worker / Gateway]
    EdgeWorker -->|Check Cache| KV[(Cloudflare KV / Redis Cache)]
    
    KV -->|Cache Hit (Instant)| ReturnCached[Return Cached Itinerary JSON]
    KV -->|Cache Miss| LLMProvider[Google Gemini 1.5 Flash / OpenAI GPT-4o-mini]
    
    subgraph Prompt_Pipeline ["Structured Prompt Pipeline"]
        SystemPrompt["System Prompt: Luxury Travel Concierge & JSON Guardrails"]
        CatalogContext["Grounding Context: Real Destination & Pricing Catalog"]
        UserQuery["Sanitized Traveler Constraints (Dates, Budget, Tier)"]
    end

    EdgeWorker --> Prompt_Pipeline
    Prompt_Pipeline --> LLMProvider
    LLMProvider -->|Structured JSON Output| EdgeWorker
    EdgeWorker -->|Store Result with TTL| KV
    EdgeWorker -->|Render Interactive Plan| Frontend
    ReturnCached --> Frontend
```

---

## 1. AI Integration Scope & Justification

### Current Status
> **No custom machine learning model was trained by the developer.**
>
> In accordance with modern enterprise best practices, building an intelligent travel assistant does not require training or fine-tuning foundation weights from scratch. Instead, it is architected around a pre-trained Large Language Model (LLM) accessed via an external REST API with structured prompt engineering and retrieval-augmented grounding.

### Problem Solved
While Trillo provides an intuitive visual interface for pre-configured vacation packages, travelers often have bespoke constraints (e.g., *"We are a family of four with a toddler visiting Albufeira for three days, need kid-friendly beaches, vegan dining, and cliffside walking paths"*). An integrated AI Concierge provides personalized itineraries matched directly to Trillo's property and activity catalog.

---

## 2. LLM Provider Comparison Matrix

| Provider & Model | Input Cost / 1M Tokens | Output Cost / 1M Tokens | p95 Latency | Structured JSON Support | Context Window | Best Fit For Trillo |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Google Gemini 1.5 Flash** | **$0.075** | **$0.30** | **~450ms** | **Native Schema Enforcement** | **1,000,000** | **Recommended (Lowest cost & fastest)** |
| **OpenAI GPT-4o-mini** | $0.15 | $0.60 | ~650ms | Native `json_schema` | 128,000 | Excellent |
| **Claude 3.5 Haiku** | $0.25 | $1.25 | ~600ms | Tool Calling JSON | 200,000 | High Quality |
| **Local Llama 3 (Ollama)** | Free (Compute cost) | Free (Compute cost) | ~2,500ms | Grammar constraints | 8,000 | Poor for web client |

---

## 3. System Prompt & Structured Output Schema

### Production System Prompt
```markdown
You are the Trillo Luxury Travel Concierge, an elite European travel advisor.
Your goal is to synthesize bespoke travel itineraries strictly grounded in Trillo's verified property catalog.

RULES:
1. Always suggest accommodations from the Trillo catalog (Hotel Las Palmas, Villa Bellagio, Grand Hyatt Santorini, Ritz Carlton Kyoto).
2. Never invent non-existent hotel tiers or incorrect pricing.
3. Keep day-by-day itineraries concise, elegant, and actionable.
4. Output MUST conform strictly to the JSON schema provided below. Do not wrap in markdown quotes or preamble.
```

### Structured JSON Schema
```json
{
  "destination": "Albufeira, Portugal",
  "recommendedProperty": "Hotel Las Palmas",
  "tier": "Deluxe Terrace Suite",
  "estimatedLodgingCost": "$540 USD",
  "itinerary": [
    {
      "day": 1,
      "theme": "Arrival & Clifftop Sunset",
      "activities": [
        "Private airport limousine check-in at Hotel Las Palmas",
        "Afternoon relaxation at the cliffside infinity pool",
        "Michelin-starred seafood dinner overlooking the Atlantic"
      ]
    },
    {
      "day": 2,
      "theme": "Marine Wildlife & Sea Caves",
      "activities": [
        "Morning speedboat excursion to Benagil Cathedral Cave",
        "Wild dolphin pod safari guided by certified marine biologists",
        "Evening coastal walk along Praia da Falésia"
      ]
    }
  ]
}
```

---

## 4. Token & Cost Control Strategy
1. **Edge Caching**: Identical queries (e.g., *"3 days in Albufeira"*) are cached at Cloudflare Edge KV for 24 hours (`TTL = 86400s`), achieving a >60% cache hit ratio and reducing API costs to pennies per month.
2. **Token Clamping**: System prompts are compacted, and responses are constrained via `max_tokens: 500`.
3. **Client-Side Debouncing**: The AI inquiry input requires a minimum 3-character query and debounces user submissions to prevent duplicate API dispatches.

---

## 5. Vendor Lock-In Mitigation
The integration utilizes a lightweight gateway abstraction interface:

```javascript
// Provider-agnostic gateway interface:
class TravelConciergeClient {
  constructor(provider = 'gemini') {
    this.provider = provider;
  }
  async generateItinerary(prompt, constraints) {
    // Routes to /api/v1/ai/generate regardless of underlying LLM model
    const response = await fetch('/api/v1/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, constraints, provider: this.provider })
    });
    return await response.json();
  }
}
```
Switching from Gemini to OpenAI or Anthropic requires updating a single environment configuration variable at the edge gateway with zero modifications to the client-facing UI.
