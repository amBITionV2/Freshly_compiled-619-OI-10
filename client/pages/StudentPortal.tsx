import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCameraStream, captureSignatureFromVideo, compareSignatures } from "@/lib/face";
import { useNavigate } from "react-router-dom";

export default function StudentPortal() {
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [savedSig, setSavedSig] = useState<string | null>(null);
  const [sessionLink, setSessionLink] = useState("");
  const [status, setStatus] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streaming, setStreaming] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const profile = localStorage.getItem("studentProfile");
    if (profile) {
      try {
        const obj = JSON.parse(profile);
        setStudentId(obj.studentId || "");
        setStudentName(obj.studentName || "");
        setSavedSig(obj.faceSignature || null);
      } catch {}
    }
  }, []);

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

  const saveFace = async () => {
    if (!videoRef.current) return;
    const sig = await captureSignatureFromVideo(videoRef.current);
    const profile = { studentId, studentName, faceSignature: sig };
    localStorage.setItem("studentProfile", JSON.stringify(profile));
    setSavedSig(sig);
    setStatus("Face saved for future verification");
  };

  const verify = async () => {
    const profile = localStorage.getItem("studentProfile");
    if (!profile || !videoRef.current) return setStatus("Please save your face first");
    const obj = JSON.parse(profile);
    const sig = await captureSignatureFromVideo(videoRef.current);
    const sim = compareSignatures(sig, obj.faceSignature);
    setStatus(`Similarity: ${(sim * 100).toFixed(0)}%`);
  };

  const joinSession = () => {
    try {
      const url = new URL(sessionLink);
      const token = url.pathname.split("/").pop();
      if (token) navigate(`/s/${token}`);
    } catch {
      if (sessionLink.startsWith("/s/")) {
        navigate(sessionLink);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Login</CardTitle>
            <CardDescription>Save your face once. We’ll use it to verify during class check-in.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Student ID" value={studentId} onChange={(e)=>setStudentId(e.target.value)} />
              <Input placeholder="Name" value={studentName} onChange={(e)=>setStudentName(e.target.value)} />
            </div>
            <div className="rounded-lg border p-3">
              <video ref={videoRef} className="aspect-video w-full rounded-md bg-black/20" />
              <div className="mt-3 flex gap-2">
                <Button onClick={startCam} className="bg-brand-600 hover:bg-brand-700">Start camera</Button>
                <Button onClick={saveFace} variant="secondary" disabled={!studentId || !studentName}>Save face</Button>
                <Button onClick={verify} variant="outline">Test verify</Button>
                <Button onClick={stopCam} variant="ghost">Stop</Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">{status}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Join a Session</CardTitle>
            <CardDescription>Paste the teacher’s session link. We will auto-mark attendance after verification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="https://…/s/abcdef" value={sessionLink} onChange={(e)=>setSessionLink(e.target.value)} />
            <Button onClick={joinSession}>Go to student interface</Button>
            {savedSig ? (
              <div className="text-xs text-muted-foreground">Face on file. Ready to verify.</div>
            ) : (
              <div className="text-xs text-destructive">No face saved yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
