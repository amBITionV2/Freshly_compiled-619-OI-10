import { RequestHandler } from "express";
import { db, SessionRec, tokens } from "../store";

export const createSession: RequestHandler = (req, res) => {
  const { teacherName, classroom, durationMinutes, batch, radiusMeters, location } = req.body || {};
  if (!teacherName || !classroom || !durationMinutes || !batch || !radiusMeters) {
    return res.status(400).json({ message: "Missing fields" });
  }
  const token = tokens.make();
  const now = Date.now();
  const rec: SessionRec = {
    token,
    teacherName,
    classroom,
    durationMinutes: Number(durationMinutes),
    batch,
    radiusMeters: Number(radiusMeters),
    location,
    createdAt: now,
    expiresAt: now + Number(durationMinutes) * 60 * 1000,
  };
  db.sessions.set(token, rec);
  res.json({ token, session: rec });
};

export const getSession: RequestHandler = (req, res) => {
  const { token } = req.params as { token: string };
  const rec = db.sessions.get(token);
  if (!rec) return res.status(404).json({ message: "Session not found" });
  res.json(rec);
};
