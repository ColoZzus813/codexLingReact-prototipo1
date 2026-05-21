import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174,http://localhost:5175",
  adminKey: process.env.ADMIN_KEY || "admin123",
  sqlServer: {
    server: process.env.SQL_SERVER || "localhost",
    user: process.env.SQL_USER || "sa",
    password: process.env.SQL_PASSWORD || "",
    database: process.env.SQL_DATABASE || "CodexLing",
    authentication: {
      type: "default"
    },
    options: {
      encrypt: false,
      trustServerCertificate: true,
      connectTimeout: 15000
    }
  }
};
