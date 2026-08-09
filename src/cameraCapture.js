let activeStream = null;

export async function startCamera(videoEl) {
  stopCamera(videoEl);

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Camera is not supported in this browser.');
  }

  activeStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'user',
      width: { ideal: 1280 },
      height: { ideal: 1280 },
    },
  });

  videoEl.srcObject = activeStream;
  await videoEl.play();
  return activeStream;
}

export function stopCamera(videoEl) {
  if (activeStream) {
    activeStream.getTracks().forEach((track) => track.stop());
    activeStream = null;
  }

  if (videoEl) {
    videoEl.pause();
    videoEl.srcObject = null;
  }
}
