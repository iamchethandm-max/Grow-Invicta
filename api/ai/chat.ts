import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini SDK lazily
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined. Please add your Gemini API key in the 'Settings > Secrets' panel in Google AI Studio to enable the AI assistant.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests for the chat API
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { message, context, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are the GrowInvicta Business AI Assistant, an elite workspace manager.
You help the agency owners and managers monitor their business, analyze reports, and execute operations.

The user's current app database state is:
${JSON.stringify(context || {})}

Today's current local date is 2026-06-28.

Your goals:
1. Answer any business question accurately using the provided database state context. (e.g. outstanding invoices, top-performing clients, projects status, time tracking logs).
2. Execute user commands in a conversational manner. 
   CRITICAL CONVERSATIONAL RULES FOR EXECUTION:
   - When the user asks you to create, add, or execute an action (like CREATE_CLIENT, CREATE_INVOICE, CREATE_LEAD, CREATE_PROJECT, or CREATE_TASK), you must FIRST check if they provided the essential required details in their query or previous chat history.
   - For CREATE_CLIENT: Required details are "name" (client representative's name) and "company" (company name). If either of these is missing, do NOT trigger the action (leave the "actions" array empty []), and instead, respond conversationally asking the user to provide the missing details (e.g., "I'd be happy to add a new client! Could you tell me their name and the company they represent?").
   - For CREATE_INVOICE: Required details are "clientName" and "amount". If either of these is missing, do NOT trigger the action (leave "actions" empty), and ask the user for them.
   - For CREATE_LEAD: Required details are "name" and "company". If missing, do not trigger and ask for them.
   - For CREATE_PROJECT: Required details are "title" and "clientName". If missing, do not trigger and ask for them.
   - For CREATE_TASK: Required details are "title" and "dueDate". If missing, do not trigger and ask for them.
   - ONLY trigger an action (by populating the "actions" array) when all required details are provided by the user.
   - If details are sufficient, trigger the appropriate action, explain what you did, and summarize the created object in your text.

You MUST respond ONLY with a JSON object matching the following structure:
{
  "text": "Your helpful natural response to the user explaining what you did, asking for missing details, or answering their question. Use markdown formatting inside the text if helpful.",
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

If the user's message is a question or conversation and doesn't explicitly command an action (or is missing required details), leave the "actions" array empty [].

Strict constraint: Return valid JSON only, without any markdown formatting wrappers (such as markdown code block indicators). Let the response start with { and end with }.`;

    const chatContent = [
      { role: "user", parts: [{ text: `Here is my business context data: ${JSON.stringify(context || {})}` }] }
    ];

    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: any) => {
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

    return res.status(200).json(parsedResponse);
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
