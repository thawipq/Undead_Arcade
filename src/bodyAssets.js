const BODY_STORAGE_KEY = 'undeadArcadeBodyId';

export const PLAYER_BODIES = [
  {
    id: 'soldier',
    label: 'MALE',
    path: 'assets/Mainbody.png',
    // Detect brown socket per frame (stable on male sheet).
    headSockets: null,
    headSeatExtra: 0,
  },
  {
    id: 'female',
    label: 'FEMALE',
    path: 'assets/mainbodyfemale.png',
    // Per walk-frame neck points (344×384 frame coords), measured from the
    // torso silhouette so the head follows the neck bob instead of floating.
    headSockets: {
      right: [
        { x: 160, y: 50 },
        { x: 174, y: 50 },
        { x: 174, y: 50 },
        { x: 168, y: 50 },
      ],
      left: [
        { x: 179, y: 48 },
        { x: 167, y: 48 },
        { x: 169, y: 48 },
        { x: 167, y: 48 },
      ],
    },
    // Push the face into the collar (lower = higher on screen).
    headSeatExtra: 6,
  },
];

export function getSelectedBodyId() {
  try {
    const saved = localStorage.getItem(BODY_STORAGE_KEY);
    if (saved && PLAYER_BODIES.some((body) => body.id === saved)) return saved;
  } catch {
    // ignore
  }
  return PLAYER_BODIES[0].id;
}

export function setSelectedBodyId(id) {
  const body = PLAYER_BODIES.find((entry) => entry.id === id);
  if (!body) return;
  try {
    localStorage.setItem(BODY_STORAGE_KEY, body.id);
  } catch {
    // ignore
  }
}

export function getSelectedBody() {
  return PLAYER_BODIES.find((body) => body.id === getSelectedBodyId()) ?? PLAYER_BODIES[0];
}

export function cycleBodyId(delta) {
  const current = getSelectedBodyId();
  const index = PLAYER_BODIES.findIndex((body) => body.id === current);
  const next = PLAYER_BODIES[(index + delta + PLAYER_BODIES.length) % PLAYER_BODIES.length];
  setSelectedBodyId(next.id);
  return next;
}
