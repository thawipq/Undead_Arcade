const CUTOUT_HEAD_KEY = 'zombie-shooter-cutout-head-v1';

export function savePixelHeadDataUrl(dataUrl) {
  localStorage.setItem(CUTOUT_HEAD_KEY, dataUrl);
}

export function getSavedPixelHeadDataUrl() {
  return localStorage.getItem(CUTOUT_HEAD_KEY);
}

export function clearSavedPixelHead() {
  localStorage.removeItem(CUTOUT_HEAD_KEY);
}

/** Prefer AI background-removed head; fall back to raw face crop. */
export function getBestHeadDataUrl(faceDataUrl) {
  return getSavedPixelHeadDataUrl() || faceDataUrl || null;
}
