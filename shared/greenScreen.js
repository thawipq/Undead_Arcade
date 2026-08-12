/** Detect Gemini / chroma-key green backgrounds (#00FF00 and similar). */
export function isGreenScreenPixel(r, g, b, a = 255) {
  if (a < 12) return true;

  const maxRb = Math.max(r, b);
  const dominance = g - maxRb;

  if (g < 70) return false;
  if (dominance < 18) return false;

  // Bright lime screen
  if (g >= 180 && maxRb <= 140 && dominance >= 35) return true;

  // Mid greens connected to the border flood
  if (g >= 100 && dominance >= 28 && g / Math.max(1, maxRb) >= 1.22) return true;

  return false;
}

export function despillGreen(r, g, b) {
  const maxRb = Math.max(r, b);
  if (g <= maxRb + 10) return { r, g, b };

  const spill = Math.min(1, (g - maxRb) / 85);
  return {
    r,
    g: Math.round(g - (g - maxRb) * spill * 0.92),
    b,
  };
}
