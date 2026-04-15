import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { analyzeOutfit } from './analyzeOutfit.js';
import { analyzeRequestSchema } from './schema.js';

const app = express();

const maxImageBytes = Number.parseInt(process.env.MAX_IMAGE_BYTES || '8000000', 10);
const jsonLimitMb = Math.max(2, Math.ceil((maxImageBytes * 1.5) / (1024 * 1024)));
const apiKey = String(process.env.AI_SERVER_API_KEY || '').trim();
const rateLimitWindowMs = Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
const rateLimitMaxRequests = Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20', 10);

app.use(cors());
app.use(express.json({ limit: `${jsonLimitMb}mb` }));

const analyzeLimiter = rateLimit({
  windowMs: Number.isFinite(rateLimitWindowMs) ? rateLimitWindowMs : 60000,
  max: Number.isFinite(rateLimitMaxRequests) ? rateLimitMaxRequests : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
  },
});

function requireApiKey(req, res, next) {
  if (!apiKey) {
    return next();
  }

  const provided = String(req.header('x-api-key') || '').trim();
  if (!provided || provided !== apiKey) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid API key',
    });
  }

  return next();
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'outfit-ai-server',
    mode: (process.env.AI_MODE || 'stub').toLowerCase(),
    authEnabled: Boolean(apiKey),
    time: new Date().toISOString(),
  });
});

app.post('/api/analyze-outfit', analyzeLimiter, requireApiKey, async (req, res) => {
  const parsedBody = analyzeRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      error: 'Invalid request body',
      details: parsedBody.error.flatten(),
    });
  }

  const { imageBase64, mimeType, categoryHint } = parsedBody.data;
  const estimatedBytes = Math.ceil((imageBase64.length * 3) / 4);

  if (estimatedBytes > maxImageBytes) {
    return res.status(413).json({
      error: 'Image too large',
      maxImageBytes,
    });
  }

  try {
    const result = await analyzeOutfit({ imageBase64, mimeType, categoryHint });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

const port = Number.parseInt(process.env.PORT || '8787', 10);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Outfit AI server listening on http://localhost:${port}`);
});
