import fs from 'node:fs';
import path from 'node:path';

const HEAD_OUT_PATH = path.resolve('public/assets/pixel-head.png');

const HEAD_PROMPT = `
Using this photo, extract ONLY the person's face and hair.

Requirements:
- Photorealistic cutout of this exact person (do NOT pixelate, do NOT restyle)
- Include ONLY face + hair (forehead, cheeks, chin, ears if visible, full hairstyle)
- Do NOT include the neck, throat, collar, shoulders, or any body
- Crop tightly under the chin — stop at the jawline
- Fully transparent background
- Centered, facing forward
- Clean edges, no checkerboard, no white/black box, no text
`.trim();

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

async function cutOutHead(apiKey, faceDataUrl) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(faceDataUrl || '');
  if (!match) {
    throw new Error('Face image missing. Take a photo or upload one first.');
  }

  const faceBuffer = Buffer.from(match[2], 'base64');

  const form = new FormData();
  form.append('model', 'gpt-image-1.5');
  form.append('prompt', HEAD_PROMPT);
  form.append('size', '1024x1024');
  form.append('quality', 'high');
  form.append('background', 'transparent');
  form.append('output_format', 'png');
  form.append('image[]', new Blob([faceBuffer], { type: match[1] }), 'face.png');

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

  fs.writeFileSync(HEAD_OUT_PATH, Buffer.from(b64, 'base64'));

  return {
    headDataUrl: `data:image/png;base64,${b64}`,
    path: 'assets/pixel-head.png',
  };
}

export function createBakeFaceMiddleware(apiKey) {
  return async (req, res, next) => {
    if (!req.url?.startsWith('/api/bake-face')) {
      next();
      return;
    }

    if (req.method === 'GET' && req.url.startsWith('/api/bake-face/status')) {
      sendJson(res, 200, {
        configured: Boolean(apiKey),
        headExists: fs.existsSync(HEAD_OUT_PATH),
      });
      return;
    }

    if (req.method !== 'POST' || req.url.split('?')[0] !== '/api/bake-face') {
      sendJson(res, 405, { error: 'Use POST /api/bake-face' });
      return;
    }

    if (!apiKey) {
      sendJson(res, 400, {
        error: 'Add OPENAI_API_KEY to a .env file in the project root, then restart npm run dev.',
      });
      return;
    }

    try {
      const body = await readJson(req);
      const result = await cutOutHead(apiKey, body.faceDataUrl);
      sendJson(res, 200, { ok: true, ...result });
    } catch (error) {
      console.error('[bake-face]', error);
      sendJson(res, 500, { error: error.message || 'Head cutout failed' });
    }
  };
}
