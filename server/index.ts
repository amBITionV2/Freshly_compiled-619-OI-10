import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { createSession, getSession } from "./routes/session";
import { checkin, summary, exportCsv } from "./routes/attendance";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Session
  app.post("/api/session/create", createSession);
  app.get("/api/session/:token", getSession);

  // Attendance
  app.post("/api/attendance/checkin", checkin);
  app.get("/api/attendance/student/:studentId/summary", summary);
  app.get("/api/attendance/student/:studentId/export", exportCsv);

  return app;
}
