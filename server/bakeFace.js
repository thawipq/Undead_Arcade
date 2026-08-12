import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { RETRO_PIXEL_HEAD } from '../shared/retroHead.js';
import { despillGreen, isGreenScreenPixel } from '../shared/greenScreen.js';

const HEAD_OUT_PATH = path.resolve('public/assets/pixel-head.png');

const GEMINI_MODELS = [
  { apiVersion: 'v1beta', model: 'gemini-2.5-flash-image' },
  { apiVersion: 'v1', model: 'gemini-2.5-flash-image' },
  { apiVersion: 'v1beta', model: 'gemini-2.0-flash-preview-image-generation' },
];

const HEAD_PROMPT_PHOTO = `
Using this photo, extract ONLY the person's face and hair.

Requirements:
- Photorealistic cutout of this exact person (do NOT pixelate, do NOT restyle)
- Include ONLY face + hair (forehead, cheeks, chin, ears if visible, full hairstyle)
- Do NOT include the neck, throat, collar, shoulders, or any body
- Crop tightly under the chin — stop at the jawline
- Centered, facing forward
- Clean edges, no checkerboard, no white/black box, no text
`.trim();

const HEAD_PROMPT_RETRO = `
Using this photo, redraw ONLY the person's face and hair as a classic 16-bit / 32-bit retro arcade sprite head for a top-down zombie shooter.

Requirements:
- Chunky visible pixel art (square pixels), SNES / arcade beat-em-up portrait style
- Keep this person's likeness: face shape, hair, skin tone, eyes, key features
- Flat cel shading, limited color palette, crisp dark 1px outline
- Include ONLY face + hair (forehead, cheeks, chin, ears if visible, full hairstyle)
- Do NOT include neck, throat, collar, shoulders, or body
- Crop tightly under the chin — stop at the jawline
- Centered, facing forward
- NO photorealism, NO soft blur, NO photo texture, NO smooth gradients
- No checkerboard, no white/black box, no text, no frame
`.trim();

const GEMINI_BG_SUFFIX = `
Place the subject on a solid flat bright green (#00FF00) background only.
No gradients, textures, shadows, or other colors in the background.
`.trim();

const HEAD_PROMPT = RETRO_PIXEL_HEAD ? HEAD_PROMPT_RETRO : HEAD_PROMPT_PHOTO;

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function parseFaceDataUrl(faceDataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(faceDataUrl || '');
  if (!match) {
    throw new Error('Face image missing. Take a photo or upload one first.');
  }
  return { mimeType: match[1], base64: match[2] };
}

function chromaKeyGreenPng(inputBuffer) {
  const png = PNG.sync.read(inputBuffer);
  const { width, height, data } = png;
  const total = width * height;
  const marked = new Uint8Array(total);

  const pushIfGreen = (x, y, queue) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (marked[i]) return;
    const o = i * 4;
    if (!isGreenScreenPixel(data[o], data[o + 1], data[o + 2], data[o + 3])) return;
    marked[i] = 1;
    queue.push(i);
  };

  const queue = [];
  for (let x = 0; x < width; x += 1) {
    pushIfGreen(x, 0, queue);
    pushIfGreen(x, height - 1, queue);
  }
  for (let y = 0; y < height; y += 1) {
    pushIfGreen(0, y, queue);
    pushIfGreen(width - 1, y, queue);
  }

  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    const y = (i / width) | 0;
    pushIfGreen(x + 1, y, queue);
    pushIfGreen(x - 1, y, queue);
    pushIfGreen(x, y + 1, queue);
    pushIfGreen(x, y - 1, queue);
  }

  for (let i = 0; i < total; i += 1) {
    const o = i * 4;
    if (marked[i]) {
      data[o + 3] = 0;
      continue;
    }

    const spilled = despillGreen(data[o], data[o + 1], data[o + 2]);
    data[o] = spilled.r;
    data[o + 1] = spilled.g;
    data[o + 2] = spilled.b;

    if (isGreenScreenPixel(data[o], data[o + 1], data[o + 2], data[o + 3])) {
      data[o + 3] = 0;
    }
  }

  return PNG.sync.write(png);
}

function writeHeadPng(pngBuffer) {
  fs.writeFileSync(HEAD_OUT_PATH, pngBuffer);
  const b64 = pngBuffer.toString('base64');
  return {
    headDataUrl: `data:image/png;base64,${b64}`,
    path: 'assets/pixel-head.png',
    style: RETRO_PIXEL_HEAD ? 'retro' : 'photo',
  };
}

async function cutOutHeadOpenAI(apiKey, faceDataUrl) {
  const { mimeType, base64 } = parseFaceDataUrl(faceDataUrl);
  const faceBuffer = Buffer.from(base64, 'base64');

  const form = new FormData();
  form.append('model', 'gpt-image-1.5');
  form.append('prompt', HEAD_PROMPT);
  form.append('size', '1024x1024');
  form.append('quality', 'high');
  form.append('background', 'transparent');
  form.append('output_format', 'png');
  form.append('image[]', new Blob([faceBuffer], { type: mimeType }), 'face.png');

  const response = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload?.error?.message || `OpenAI error (${response.status})`;
    throw new Error(message);
  }

  const b64 = payload?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('OpenAI returned no image data.');
  }

  return { ...writeHeadPng(Buffer.from(b64, 'base64')), provider: 'openai' };
}

async function cutOutHeadGemini(apiKey, faceDataUrl) {
  const { mimeType, base64 } = parseFaceDataUrl(faceDataUrl);
  const prompt = `${HEAD_PROMPT}\n\n${GEMINI_BG_SUFFIX}`;
  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        { inlineData: { mimeType, data: base64 } },
      ],
    }],
    generationConfig: {
      responseModalities: ['IMAGE'],
    },
  };

  let lastError = 'Gemini returned no image data.';

  for (const { apiVersion, model } of GEMINI_MODELS) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      },
    );

    const payload = await response.json();
    if (!response.ok) {
      lastError = payload?.error?.message || `Gemini error (${response.status})`;
      continue;
    }

    const parts = payload?.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const imageB64 = part.inlineData?.data ?? part.inline_data?.data;
      if (!imageB64) continue;

      const pngBuffer = chromaKeyGreenPng(Buffer.from(imageB64, 'base64'));
      return { ...writeHeadPng(pngBuffer), provider: 'gemini', model };
    }

    lastError = 'Gemini returned no image data.';
  }

  throw new Error(lastError);
}

export function createBakeFaceMiddleware({ openaiKey, geminiKey } = {}) {
  const provider = geminiKey ? 'gemini' : openaiKey ? 'openai' : null;
  const configured = Boolean(provider);

  return async (req, res, next) => {
    if (!req.url?.startsWith('/api/bake-face')) {
      next();
      return;
    }

    if (req.method === 'GET' && req.url.startsWith('/api/bake-face/status')) {
      sendJson(res, 200, {
        configured,
        provider,
        headExists: fs.existsSync(HEAD_OUT_PATH),
        retroPixelHead: RETRO_PIXEL_HEAD,
      });
      return;
    }

    if (req.method !== 'POST' || req.url.split('?')[0] !== '/api/bake-face') {
      sendJson(res, 405, { error: 'Use POST /api/bake-face' });
      return;
    }

    if (!configured) {
      sendJson(res, 400, {
        error: 'Add GEMINI_API_KEY (or OPENAI_API_KEY) to a .env file in the project root, then restart npm run dev.',
      });
      return;
    }

    try {
      const body = await readJson(req);
      const result = provider === 'gemini'
        ? await cutOutHeadGemini(geminiKey, body.faceDataUrl)
        : await cutOutHeadOpenAI(openaiKey, body.faceDataUrl);
      sendJson(res, 200, { ok: true, ...result });
    } catch (error) {
      console.error('[bake-face]', error);
      sendJson(res, 500, { error: error.message || 'Head cutout failed' });
    }
  };
}
