// Local server: the API plus the front end on one port. Vercel does not use this file.
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import app from "./server/app.js";

// Load .env.local / .env only if the key is not already set by the environment
if (!process.env.ANTHROPIC_API_KEY) {
  dotenv.config({ path: ".env.local" });
  dotenv.config();
}

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(rootDir, "dist");
    app.use(express.static(distPath));
    app.get("*splat", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
