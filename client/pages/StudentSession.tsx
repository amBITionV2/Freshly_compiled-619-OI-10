import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCameraStream, captureSignatureFromVideo, compareSignatures } from "@/lib/face";
import { getCurrentPosition } from "@/lib/geo";

interface SessionDto {
  token: string;
  teacherName: string;
  classroom: string;
  durationMinutes: number;
  batch: string;
  radiusMeters: number;
  location?: { lat: number; lng: number };
}

export default function StudentSession() {
  const { token } = useParams();
  const [session, setSession] = useState<SessionDto | null>(null);
  const [status, setStatus] = useState<string>("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [report, setReport] = useState<any | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/session/${token}`);
      if (res.ok) setSession(await res.json());
    })();
  }, [token]);

  const startCam = async () => {
    if (streaming) return;
    const stream = await getCameraStream();
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStreaming(true);
    }
  };

  const stopCam = () => {
    const v = videoRef.current;
    if (v && v.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      v.srcObject = null;
    }
    setStreaming(false);
  };

  const checkIn = async () => {
    const profileRaw = localStorage.getItem("studentProfile");
    if (!profileRaw) {
      setStatus("Please go to Student page to save your face first");
      return;
    }
    const profile = JSON.parse(profileRaw);
    if (!videoRef.current) return;
    setStatus("Verifying face…");
    const sig = await captureSignatureFromVideo(videoRef.current);
    const sim = compareSignatures(sig, profile.faceSignature);
    const faceMatch = sim >= 0.9; // threshold
    if (!faceMatch) {
      setStatus(`Face mismatch (${(sim * 100).toFixed(0)}%). Try again.`);
      return;
    }
    setStatus("Checking distance…");
    const loc = await getCurrentPosition();
    const res = await fetch("/api/attendance/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, studentId: profile.studentId, studentName: profile.studentName, faceMatch, location: loc }),
    });
    const data = await res.json();
    setStatus(data.message || "Checked in");
    setCheckedIn(true);
    await loadReport(profile.studentId);
  };

  const loadReport = async (studentId: string) => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const res = await fetch(`/api/attendance/student/${encodeURIComponent(studentId)}/summary?month=${ym}`);
    if (res.ok) setReport(await res.json());
  };

  const downloadCsv = async () => {
    const profileRaw = localStorage.getItem("studentProfile");
    if (!profileRaw) return;
    const profile = JSON.parse(profileRaw);
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const url = `/api/attendance/student/${encodeURIComponent(profile.studentId)}/export?month=${ym}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${profile.studentId}-${ym}.csv`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Student Interface</CardTitle>
            <CardDescription>
              {session ? (
                <span>Batch {session.batch} • Classroom {session.classroom} • Radius {session.radiusMeters}m</span>
              ) : (
                <span>Loading session…</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <video ref={videoRef} className="aspect-video w-full rounded-md bg-black/20" />
            <div className="flex gap-2">
              <Button onClick={startCam} className="bg-brand-600 hover:bg-brand-700">Start camera</Button>
              <Button onClick={checkIn} variant="secondary">Verify & check-in</Button>
              <Button onClick={stopCam} variant="ghost">Stop</Button>
            </div>
            <div className="text-sm text-muted-foreground">{status}</div>

            {checkedIn && (
              <div className="mt-6 rounded-lg border p-4">
                <div className="mb-2 text-sm font-semibold">Your report</div>
                {report ? (
                  <div className="text-sm">
                    <div>Month total present: {report.totalPresent}</div>
                    <div>Total sessions: {report.totalSessions}</div>
                    <div className="mt-2 max-h-40 overflow-auto rounded border bg-muted/40 p-2 text-xs">
                      {report.days && report.days.map((d: any) => (
                        <div key={d.date} className="flex items-center justify-between">
                          <span>{d.date}</span>
                          <span className={d.present ? "text-green-600" : "text-red-600"}>{d.present ? "Present" : "Absent"}</span>
                        </div>
                      ))}
                    </div>
                    <Button onClick={downloadCsv} className="mt-3">Download month CSV</Button>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No data yet</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
