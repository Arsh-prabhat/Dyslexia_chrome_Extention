import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with override: true so server/.env takes precedence
dotenv.config({ path: path.join(__dirname, '.env'), override: true });
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

function getApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return undefined;
  const trimmed = key.trim().replace(/^["']|["']$/g, '');
  if (trimmed === 'your_gemini_api_key_here' || trimmed.length < 5) {
    return undefined;
  }
  return trimmed;
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const SYSTEM_INSTRUCTION = `You are a reading accessibility assistant. Rewrite the supplied text so that it is easier to understand for a reader with dyslexia or reading difficulties. Preserve meaning and factual information. Use shorter sentences, clear structure, familiar vocabulary, and explicit relationships between ideas. Do not remove important information. Do not invent information. CRITICAL REQUIREMENT: Output ONLY the simplified text directly. Do NOT include any intro like "Here is a simplified version", do NOT add markdown dividers like "---" or headers like "#". Just output the rewritten text paragraphs directly.`;

app.post('/api/simplify', async (req, res) => {
  try {
    const { text, chunkIndex = 0, totalChunks = 1 } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text field is required and must be non-empty.' });
    }

    const apiKey = getApiKey();

    if (!apiKey) {
      console.warn('[DyslexiaReader Backend] GEMINI_API_KEY is missing or invalid.');
      return res.status(500).json({
        error: 'Backend missing valid GEMINI_API_KEY. Please set GEMINI_API_KEY in server/.env file.'
      });
    }

    // Call Google Gemini API (gemini-3.6-flash)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_INSTRUCTION },
            { text: `Simplify the following text:\n\n${text}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[DyslexiaReader Backend] Gemini API Error response:', response.status, errorBody);
      return res.status(502).json({
        error: `Gemini API service returned status ${response.status}. Check API key and quota.`
      });
    }

    const data = await response.json();
    const candidateText =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!candidateText) {
      return res.status(500).json({ error: 'Gemini API returned empty text response.' });
    }

    return res.json({
      simplifiedText: candidateText.trim(),
      chunkIndex,
      totalChunks
    });
  } catch (err) {
    console.error('[DyslexiaReader Backend] Internal error:', err);
    return res.status(500).json({ error: 'Internal server error while processing simplification.' });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(getApiKey())
  });
});

app.listen(PORT, () => {
  console.log(`[DyslexiaReader Backend] Server listening on http://localhost:${PORT}`);
  console.log(`[DyslexiaReader Backend] GEMINI_API_KEY configured: ${Boolean(getApiKey())}`);
});
