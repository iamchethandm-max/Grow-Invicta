import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json({ limit: "50mb" }));

// API Route for AI Assistant
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, context, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const systemInstruction = `You are the GrowInvicta Business AI Assistant, an elite workspace manager.
You help the agency owners and managers monitor their business, analyze reports, and execute operations.

The user's current app database state is:
${JSON.stringify(context || {})}

Today's current local date is 2026-06-28.

Your goals:
1. Answer any business question accurately using the provided database state context. (e.g. outstanding invoices, top-performing clients, projects status, time tracking logs).
2. Execute user commands. If the user tells you to do something (like "create an invoice for Spice Route for 45000", "add client John Doe", "add a task to fix the logo", "create a lead", "project", etc.), you MUST understand their intention, construct the appropriate action payload, and describe what you did.

You MUST respond ONLY with a JSON object matching the following structure:
{
  "text": "Your helpful natural response to the user explaining what you did or answering their question. Use markdown formatting inside the text if helpful.",
  "actions": [
    {
      "type": "CREATE_INVOICE" | "CREATE_CLIENT" | "CREATE_LEAD" | "CREATE_PROJECT" | "CREATE_TASK",
      "payload": { ... } // exact fields matching the action type
    }
  ]
}

Supported action types and their payload definitions:
- CREATE_INVOICE:
  {
    "clientName": string (must match an existing client name if possible, or create exactly what the user asked),
    "amount": number,
    "paidAmount": number (default 0),
    "dueDate": string ("YYYY-MM-DD", e.g. "2026-07-15"),
    "mode": "UPI" | "Bank Transfer" | "Cash" | "Credit Card" (default "Bank Transfer"),
    "status": "Paid" | "Partial" | "Overdue" | "Pending" (default "Pending"),
    "gstAmount": number (default 0),
    "serviceDetails": string (e.g. "Website Development Retainer", default "Design & Staging Build")
  }
- CREATE_CLIENT:
  {
    "name": string,
    "company": string,
    "mobile": string (default ""),
    "email": string (default ""),
    "notes": string (default ""),
    "monthlyRetainerAmount": number (default 0),
    "workType": "retainer" | "one-time" (default "one-time")
  }
- CREATE_LEAD:
  {
    "name": string,
    "company": string,
    "phone": string (default ""),
    "email": string (default ""),
    "status": "New" | "Contacted" | "Proposal" | "Negotiation" | "Won" | "Lost" (default "New"),
    "value": number (default 0)
  }
- CREATE_PROJECT:
  {
    "title": string,
    "clientName": string,
    "value": number,
    "status": "Planning" | "In Progress" | "Review" | "Completed" | "On Hold" (default "Planning")
  }
- CREATE_TASK:
  {
    "title": string,
    "assignedTo": string (default "Chethan D. M."),
    "project": string (default "General"),
    "dueDate": string ("YYYY-MM-DD", e.g. "2026-07-05"),
    "priority": "Low" | "Medium" | "High" | "Critical" (default "Medium"),
    "status": "Pending" | "In Progress" | "Review" | "Completed" (default "Pending")
  }

If the user's message is a question or conversation and doesn't explicitly command an action, leave the "actions" array empty [].

Strict constraint: Return valid JSON only, without any markdown backticks wrapper, e.g. do not wrap with \`\`\`json. Let the response start with { and end with }.`;

    const chatContent = [
      { role: "user", parts: [{ text: `Here is my business context data: ${JSON.stringify(context || {})}` }] }
    ];

    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach(msg => {
        chatContent.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        });
      });
    }

    chatContent.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContent,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text || "{}";
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText.trim());
    } catch (e) {
      parsedResponse = {
        text: responseText,
        actions: []
      };
    }

    res.json(parsedResponse);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Setup Vite Dev server middleware or static serve
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
