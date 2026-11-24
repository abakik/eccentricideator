import express from "express";
import { claudeRouter } from "./routes/claude.js";

/**
 * The API as an Express app with no port attached.
 * Vercel runs it as a function (see api/index.ts); dev-server.ts runs it locally.
 */
const app = express();

app.use(express.json({ limit: "2mb" }));
app.use("/api/claude", claudeRouter);

export default app;
