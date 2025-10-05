export interface SessionRec {
  token: string;
  teacherName: string;
  classroom: string;
  durationMinutes: number;
  batch: string;
  radiusMeters: number;
  location?: { lat: number; lng: number };
  createdAt: number;
  expiresAt: number;
}

export interface AttendanceRec {
  id: string;
  token: string;
  studentId: string;
  studentName: string;
  timestamp: number;
  present: boolean;
  distanceMeters?: number;
  faceMatch?: boolean;
}

export const db = {
  sessions: new Map<string, SessionRec>(),
  attendance: [] as AttendanceRec[],
};

export const tokens = {
  make(): string {
    const rnd = Math.random().toString(36).slice(2, 10);
    const ts = Date.now().toString(36).slice(-4);
    return `${rnd}${ts}`;
  },
};

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371e3;
  const phi1 = (a.lat * Math.PI) / 180;
  const phi2 = (b.lat * Math.PI) / 180;
  const dphi = ((b.lat - a.lat) * Math.PI) / 180;
  const dlambda = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dphi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}
