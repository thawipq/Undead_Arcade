const FACE_STORAGE_KEY = 'zombie-shooter-face-v3';
const CAPTURE_SIZE = 512;

/**
 * Center-crop a square face photo (no pixelation).
 * Returns a PNG data URL for AI background removal.
 */
export function captureFace(source, options = {}) {
  const { mirror = false, outputSize = CAPTURE_SIZE } = options;

  const srcW = source.naturalWidth || source.videoWidth || source.width;
  const srcH = source.naturalHeight || source.videoHeight || source.height;

  if (!srcW || !srcH) {
    throw new Error('Could not read image size.');
  }

  const src = document.createElement('canvas');
  const srcCtx = src.getContext('2d');
  src.width = srcW;
  src.height = srcH;

  if (mirror) {
    srcCtx.translate(srcW, 0);
    srcCtx.scale(-1, 1);
  }
  srcCtx.drawImage(source, 0, 0, srcW, srcH);

  const side = Math.min(src.width, src.height);
  const sx = (src.width - side) / 2;
  const sy = (src.height - side) / 2;

  const out = document.createElement('canvas');
  out.width = outputSize;
  out.height = outputSize;
  const outCtx = out.getContext('2d');
  outCtx.imageSmoothingEnabled = true;
  outCtx.drawImage(src, sx, sy, side, side, 0, 0, outputSize, outputSize);

  return out.toDataURL('image/png');
}

export function loadFaceFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please choose an image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          resolve(captureFace(img));
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Could not load that image.'));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

export function captureFaceFromVideo(video) {
  if (!video.videoWidth) {
    throw new Error('Camera is not ready yet.');
  }
  return captureFace(video, { mirror: true });
}

/** @deprecated use captureFaceFromVideo */
export function pixelateFromVideo(video) {
  return captureFaceFromVideo(video);
}

export function saveFaceDataUrl(dataUrl) {
  localStorage.setItem(FACE_STORAGE_KEY, dataUrl);
}

export function getSavedFaceDataUrl() {
  return localStorage.getItem(FACE_STORAGE_KEY);
}

export function clearSavedFace() {
  localStorage.removeItem(FACE_STORAGE_KEY);
}
