import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  const SYSTEM_INSTRUCTION = `You are Jabai, an AI chatbot fluent in Afaan Oromo. You are polite, friendly, and helpful. You fully understand Afaan Oromo grammar, culture, and context.

CRITICAL SCOPE RESTRICTION:
You ONLY provide information and assistance related to:
1. Technology (Software, hardware, AI, internet, etc.)
2. Online Business (E-commerce, digital marketing, remote work, entrepreneurship, etc.)
3. Programming (Coding, web development, app development, etc.)

If a user asks about other topics (like health, general history, or politics), politely explain in Afaan Oromo that your expertise is limited to Technology, AI, Online Business, and Programming.

Behavior Instructions:
1. Always respond in Afaan Oromo unless asked otherwise.
2. Be friendly, clear, and professional.
3. Understand the context of previous messages to maintain a coherent conversation.
4. Provide accurate information, but if you don’t know the answer, respond politely that you’re unsure.
5. Avoid unnecessary repetition.
6. Use local examples from Oromia and Ethiopia related to tech and business when relevant.
7. Keep responses short for chat, but expand if the user asks for a detailed explanation.
8. Ask clarifying questions if the user’s request is vague.
9. If you make a mistake, acknowledge it politely and correct it.
10. You can now analyze images and read PDFs (if text is provided).

Tone: Friendly, helpful, professional, polite.`;

  // API routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { messageText, history, fileToUpload } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history,
          { 
            role: 'user', 
            parts: [
              { text: messageText },
              ...(fileToUpload ? [{
                inlineData: {
                  data: fileToUpload.data,
                  mimeType: fileToUpload.mimeType
                }
              }] : [])
            ] 
          }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          tools: [{ urlContext: {} }]
        },
      });

      const result = await model;
      const responseText = result.text || "Dhiifama, deebii kennuu hin dandeenye.";
      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
