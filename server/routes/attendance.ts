import { RequestHandler } from "express";
import { db, distanceMeters } from "../store";

export const checkin: RequestHandler = (req, res) => {
  const { token, studentId, studentName, faceMatch, location } = req.body || {};
  const session = db.sessions.get(token);
  if (!session) return res.status(404).json({ message: "Invalid session" });
  const now = Date.now();
  if (now > session.expiresAt) return res.status(400).json({ message: "Session expired" });

  let dist = undefined as number | undefined;
  if (session.location && location) {
    dist = distanceMeters(session.location, location);
  }
  const within = dist !== undefined ? dist <= session.radiusMeters + 1 : true;
  const present = Boolean(faceMatch) && within;

  db.attendance.push({
    id: `${token}:${studentId}:${now}`,
    token,
    studentId,
    studentName,
    timestamp: now,
    present,
    distanceMeters: dist,
    faceMatch,
  });

  return res.json({ message: present ? "Present" : "Absent", present, distanceMeters: dist });
};

export const summary: RequestHandler = (req, res) => {
  const { studentId } = req.params as { studentId: string };
  const { month } = req.query as { month?: string };
  const records = db.attendance.filter((r) => r.studentId === studentId);
  const byDay = new Map<string, boolean>();

  for (const r of records) {
    const d = new Date(r.timestamp);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (month && ym !== month) continue;
    const dayKey = `${ym}-${String(d.getDate()).padStart(2, "0")}`;
    // last record of the day wins
    byDay.set(dayKey, r.present);
  }

  const days = Array.from(byDay.entries()).map(([date, present]) => ({ date, present }));
  const totalPresent = days.filter((d) => d.present).length;
  const totalSessions = days.length;

  res.json({ totalPresent, totalSessions, days });
};

export const exportCsv: RequestHandler = (req, res) => {
  const { studentId } = req.params as { studentId: string };
  const { month } = req.query as { month?: string };
  const records = db.attendance.filter((r) => r.studentId === studentId);
  const byDay = new Map<string, boolean>();

  for (const r of records) {
    const d = new Date(r.timestamp);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (month && ym !== month) continue;
    const dayKey = `${ym}-${String(d.getDate()).padStart(2, "0")}`;
    byDay.set(dayKey, r.present);
  }

  const rows = [["Date", "Status"] as const, ...Array.from(byDay.entries()).map(([date, present]) => [date, present ? "Present" : "Absent"])];
  const csv = rows.map((r) => r.map((c) => (typeof c === "string" && c.includes(",") ? `"${c}"` : c)).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=attendance-${studentId}-${month || "all"}.csv`);
  res.send(csv);
};
