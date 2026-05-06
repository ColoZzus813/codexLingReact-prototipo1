import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import courseRoutes from "./routes/courseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import pythonLessonRoutes from "./routes/pythonLessonRoutes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "codexling-api",
    database: "connected"
  });
});

app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/python/lessons", pythonLessonRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);
