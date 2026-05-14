import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174,http://localhost:5175",
  adminKey: process.env.ADMIN_KEY || "admin123"
};
