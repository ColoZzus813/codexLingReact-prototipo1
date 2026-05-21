import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import courseRoutes from "./routes/courseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courseLessonRoutes from "./routes/courseLessonRoutes.js";
import pythonLessonRoutes from "./routes/pythonLessonRoutes.js";
import forumRoutes from "./routes/forumRoutes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { realtimeEvents } from "./utils/realtime.js";

export const app = express();

const allowedOrigins = String(env.corsOrigin)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  }
}));
app.use(express.json());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "codexling-api",
    database: "connected"
  });
});

app.get("/api/events", realtimeEvents);
app.use("/api/courses/:courseType/lessons", courseLessonRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/python/lessons", pythonLessonRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/admin", adminRoutes);

// Debug: log all requests hitting API
app.use("/api", (req, _res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});


app.use(notFound);
app.use(errorHandler);
