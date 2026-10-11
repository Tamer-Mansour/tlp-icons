// The animation library: names, default durations (design ms, before SPEED) and kinds.
// Keyframes live in src/runtime/tlp-icons.css; tests check both sides stay in sync.

export const SPEED = 0.6;

export const ANIMS = {
  // entrances: the part appears into place
  draw: { kind: 'entrance', dur: 1000 },
  fillIn: { kind: 'entrance', dur: 900 },
  popIn: { kind: 'entrance', dur: 800 },
  fadeIn: { kind: 'entrance', dur: 700 },
  slideIn: { kind: 'entrance', dur: 800 },
  riseIn: { kind: 'entrance', dur: 800 },
  dropIn: { kind: 'entrance', dur: 800 },
  grow: { kind: 'entrance', dur: 900 },
  growX: { kind: 'entrance', dur: 800 },
  // gestures: the part moves and returns exactly to rest
  pop: { kind: 'gesture', dur: 800 },
  breathe: { kind: 'gesture', dur: 1300 },
  jelly: { kind: 'gesture', dur: 1100 },
  swing: { kind: 'gesture', dur: 1400 },
  wiggle: { kind: 'gesture', dur: 1100 },
  tilt: { kind: 'gesture', dur: 1100 },
  nod: { kind: 'gesture', dur: 1000 },
  strike: { kind: 'gesture', dur: 1100 },
  hop: { kind: 'gesture', dur: 1000 },
  lift: { kind: 'gesture', dur: 1000 },
  sink: { kind: 'gesture', dur: 1000 },
  nudge: { kind: 'gesture', dur: 1000 },
  nudgeBack: { kind: 'gesture', dur: 1000 },
  float: { kind: 'gesture', dur: 1600 },
  flip: { kind: 'gesture', dur: 1200 },
  spin: { kind: 'turn', dur: 1500 },
  spinBack: { kind: 'turn', dur: 1500 },
  spinHalf: { kind: 'turn', dur: 1200 },
  sweep: { kind: 'turn', dur: 1600 },
  sweepHour: { kind: 'hour', dur: 1600 },
  blink: { kind: 'gesture', dur: 900 },
  shake: { kind: 'gesture', dur: 1000 },
  pulseRing: { kind: 'gesture', dur: 1200 },
  orbit: { kind: 'turn', dur: 1600 },
  stretch: { kind: 'gesture', dur: 1000 },
};

export const ANIM_NAMES = Object.keys(ANIMS);

/** Old prototype names still found in some overrides. */
export const LEGACY = { ring: 'swing', drop: 'sink', rise: 'lift', slideX: 'nudge', slideXBack: 'nudgeBack', bounce: 'hop', pulse: 'breathe', tick: 'sweep' };

export const LIMITS = { durMin: 300, durMax: 2400, delayMax: 1500, totalMax: 2600 };
