import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import chatHandler from "./api/ai/chat";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// API Route for AI Assistant - delegating to the shared Vercel serverless function handler
app.post("/api/ai/chat", async (req, res) => {
  try {
    await chatHandler(req as any, res as any);
  } catch (err: any) {
    console.error("Express routing error to Vercel handler:", err);
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
