import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentPosition } from "@/lib/geo";

export default function Teacher() {
  const [teacherName, setTeacherName] = useState("");
  const [classroom, setClassroom] = useState("");
  const [duration, setDuration] = useState(60);
  const [batch, setBatch] = useState("");
  const [radius, setRadius] = useState(50);
  const [link, setLink] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setStatus("Getting location…");
    try {
      const loc = await getCurrentPosition();
      setStatus("Creating session…");
      const res = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherName, classroom, durationMinutes: Number(duration), batch, radiusMeters: Number(radius), location: loc }),
      });
      const data = await res.json();
      const url = `${window.location.origin}/s/${data.token}`;
      setLink(url);
      setStatus("Session created");
    } catch (e: any) {
      setStatus(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setStatus("Link copied");
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Teacher Login & Session</CardTitle>
            <CardDescription>Enter class details to generate a student link. We will use your phone location for proximity checks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Teacher name" value={teacherName} onChange={(e)=>setTeacherName(e.target.value)} />
              <Input placeholder="Batch" value={batch} onChange={(e)=>setBatch(e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Input placeholder="Classroom number" value={classroom} onChange={(e)=>setClassroom(e.target.value)} />
              <Input type="number" placeholder="Duration (min)" value={duration} onChange={(e)=>setDuration(Number(e.target.value))} />
              <Input type="number" placeholder="Radius (m)" value={radius} onChange={(e)=>setRadius(Number(e.target.value))} />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={generate} disabled={loading || !teacherName || !classroom || !batch} className="bg-brand-600 hover:bg-brand-700">{loading ? "Generating…" : "Generate session link"}</Button>
            </div>
            {link && (
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2 text-sm">
                <div className="flex-1 break-all">{link}</div>
                <Button size="sm" variant="outline" onClick={copy}>Copy link</Button>
              </div>
            )}
            <div className="text-sm text-muted-foreground">{status}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
