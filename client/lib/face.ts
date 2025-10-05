export async function getCameraStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
}

export async function captureSignatureFromVideo(video: HTMLVideoElement): Promise<string> {
  const canvas = document.createElement("canvas");
  const size = 32;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");
  ctx.drawImage(video, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  // downscale to grayscale and normalize
  const gray: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const v = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    gray.push(v);
  }
  // normalize histogram buckets (16 bins)
  const bins = new Array(16).fill(0);
  for (const v of gray) {
    const idx = Math.min(15, Math.floor((v / 256) * 16));
    bins[idx] += 1;
  }
  const total = gray.length;
  const norm = bins.map((b) => b / total);
  return norm.join(",");
}

export function compareSignatures(a: string, b: string): number {
  const va = a.split(",").map(Number);
  const vb = b.split(",").map(Number);
  if (va.length !== vb.length) return 0;
  // cosine similarity
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < va.length; i++) {
    dot += va[i] * vb[i];
    na += va[i] * va[i];
    nb += vb[i] * vb[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1;
  return dot / denom;
}
