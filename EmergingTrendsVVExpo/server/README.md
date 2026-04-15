# Outfit AI Backend

This server powers real outfit detection for the Expo app scan flow.

## Run

1. Install dependencies:

```bash
cd "c:/Users/Emerging_trendsVV/EmergingTrendsVVExpo/server"
npm.cmd install
```

2. Create environment file:

```bash
copy .env.example .env
```

3. Start in stub mode (safe default):

```bash
npm.cmd run dev
```

4. Enable live OpenAI detection:

Set these in `.env`:

- `AI_MODE=openai`
- `OPENAI_API_KEY=<your key>`
- `OPENAI_MODEL=gpt-4.1-mini` (or another vision-capable model)
- `AI_SERVER_API_KEY=<shared secret expected in x-api-key header>`

Rate limiting controls:

- `RATE_LIMIT_WINDOW_MS=60000`
- `RATE_LIMIT_MAX_REQUESTS=20`

Then run:

```bash
npm.cmd run dev
```

## API

### GET /health
Returns status, mode, and timestamp.

### POST /api/analyze-outfit
Protected with `x-api-key` when `AI_SERVER_API_KEY` is set.

Request body:

```json
{
  "imageBase64": "<base64 image bytes>",
  "mimeType": "image/jpeg",
  "categoryHint": "travel"
}
```

Response body:

```json
{
  "version": "1.0",
  "provider": "openai",
  "model": "gpt-4.1-mini",
  "detectedAt": "2026-04-15T13:30:00.000Z",
  "result": {
    "itemType": "shirt",
    "color": "white",
    "secondaryColors": ["blue"],
    "material": "cotton",
    "materialNotes": "smooth weave, likely cotton blend",
    "style": "smart casual",
    "features": ["collared neckline", "button placket", "long sleeves"],
    "pattern": "solid",
    "occasion": "work",
    "confidence": 0.86,
    "reasoning": "single upper-body garment is dominant in frame",
    "warnings": []
  }
}
```

## Contract enums

- `itemType`: coat, jacket, blazer, shirt, tshirt, sweater, hoodie, dress, skirt, pants, jeans, shorts, shoes, boots, bag, accessory, other
- `material`: cotton, denim, linen, wool, leather, silk, polyester, viscose, blend, unknown
- `pattern`: solid, striped, checked, floral, graphic, textured, other, unknown
- `occasion`: casual, work, travel, formal, sport, party, other

## Exact model prompt design

System prompt:

```text
You are a fashion item vision analyst.
Return STRICT JSON only.
Do not include markdown, prose, or extra keys.
You must follow the schema exactly.
```

User prompt template:

```text
Task: Analyze one clothing-focused image and extract garment metadata.

Rules:
- Prefer the dominant garment in frame.
- If multiple garments are visible, choose the central/foreground one and add a warning.
- Be conservative: use unknown/other instead of hallucinating.
- Use lowercase labels for enums and color names.
- confidence must be 0 to 1 and reflect visual certainty.
- features should be visually verifiable traits only.

Allowed itemType: coat, jacket, blazer, shirt, tshirt, sweater, hoodie, dress, skirt, pants, jeans, shorts, shoes, boots, bag, accessory, other
Allowed material: cotton, denim, linen, wool, leather, silk, polyester, viscose, blend, unknown
Allowed pattern: solid, striped, checked, floral, graphic, textured, other, unknown
Allowed occasion: casual, work, travel, formal, sport, party, other

Category hint from app: <travel|work|...>
```

This prompt and schema are enforced in server code with JSON schema + Zod validation.
