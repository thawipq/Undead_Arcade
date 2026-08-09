export async function getBakeStatus() {
  const res = await fetch('/api/bake-face/status');
  if (!res.ok) {
    return { configured: false, headExists: false };
  }
  return res.json();
}

/** Ask the server to generate a pixel-art head only (not a full spritesheet). */
export async function generatePixelHead(faceDataUrl) {
  const res = await fetch('/api/bake-face', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ faceDataUrl }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || 'Head generation failed');
  }
  return payload;
}
