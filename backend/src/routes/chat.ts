import { Router } from 'express';
import type { Response, Request } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = Router();

// Chat specific rate limiter to avoid API key quota abuse (30 requests per 15 minutes)
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many chat messages, please try again in 15 minutes.' },
});

const SYSTEM_PROMPT = `You are Finsync AI, a financial assistant chatbot backed by an AMFI registered advisor.

You must ONLY answer questions related to finance, personal finance, investing, mutual funds, insurance, loans, asset allocation, portfolio management, or financial analysis.
If the user asks questions about different fields (for example, "how can i be a cricketer?", "tell me a joke", sports, cooking, history, entertainment, programming, or coding), you must respond with EXACTLY this string literal (preserving the spelling errors "smthg", "realted", and "finanlysis" exactly) and absolutely nothing else:
"thats not what i was trained for please ask smthg realted to finance or finanalysis"

If the user's question IS related to finance, you must adhere strictly to these rules:
- Always respond in simple, plain English.
- Do not use financial jargon without explanation (e.g., if you mention CAGR or Expense Ratio, explain it simply).
- Never recommend specific stocks or tell the user to buy/sell a specific stock.
- Always remind users to consult their advisor for major decisions.
- Keep responses concise and strictly under 150 words.
- Be encouraging and positive, not alarming or scary.`;

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1, 'Message content cannot be empty'),
    })
  ),
});

router.post('/', chatLimiter, async (req: Request, res: Response, next) => {
  try {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        success: false,
        error: 'Groq API Key is not configured on the server.',
      });
      return;
    }

    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid request body. Messages array with role and content is required.',
      });
      return;
    }

    const { messages } = parsed.data;

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.2, // low temperature to ensure strict adherence to instructions
        max_tokens: 350,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', errText);
      res.status(502).json({
        success: false,
        error: 'Failed to generate response from AI model.',
      });
      return;
    }

    const data = (await response.json()) as any;
    const reply = data.choices?.[0]?.message?.content || '';

    res.json({
      success: true,
      text: reply.trim(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
