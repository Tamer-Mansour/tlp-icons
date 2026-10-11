// Compact, deterministic name -> category lookup for dist/manifest.js.
//
// The names themselves gzip to ~18 KB no matter how they are packed, so the manifest does not ship them.
// Instead it ships a minimal perfect hash (CHD, "hash and displace"):
//   bucket = hash(name, 0) % B;  slot = hash(name, SEEDS[bucket]) % M;  category = CATS[TABLE[slot]]
// Every known name gets its own slot, so the lookup is exact for all of them (verified at build time).
// An unknown name maps to some category: that chunk loads once and the element reports data-missing.
import zlib from 'node:zlib';

// FNV-1a with a seed, plus a murmur-style finaliser. Must stay identical to HASH_SRC below.
export function hash(str, seed) {
  let x = (0x811c9dc5 ^ seed) >>> 0;
  for (let i = 0; i < str.length; i++) { x ^= str.charCodeAt(i); x = Math.imul(x, 16777619); }
  x ^= x >>> 15; x = Math.imul(x, 0x2c1b3c6d); x ^= x >>> 12; x = Math.imul(x, 0x297a2d39); x ^= x >>> 15;
  return x >>> 0;
}

const HASH_SRC = `const h = (s, seed) => {
  let x = (0x811c9dc5 ^ seed) >>> 0;
  for (let i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); }
  x ^= x >>> 15; x = Math.imul(x, 0x2c1b3c6d); x ^= x >>> 12; x = Math.imul(x, 0x297a2d39); x ^= x >>> 15;
  return x >>> 0;
};`;

const EMPTY = '~';

export function encodeManifest(nameToCat, catIds) {
  const names = Object.keys(nameToCat).sort();
  if (catIds.length > 70) throw new Error('too many categories for the compact manifest');
  const catIndex = Object.fromEntries(catIds.map((c, k) => [c, k]));
  const n = names.length;
  const B = Math.max(1, Math.ceil(n / 4));
  const M = Math.ceil(n * 1.08);
  const buckets = Array.from({ length: B }, (_, b) => ({ b, keys: [] }));
  for (const name of names) buckets[hash(name, 0) % B].keys.push(name);
  const table = new Array(M).fill(-1);
  const seeds = new Array(B).fill(0);
  for (const bucket of buckets.slice().sort((p, q) => q.keys.length - p.keys.length || p.b - q.b)) {
    if (!bucket.keys.length) continue;
    for (let seed = 1; ; seed++) {
      if (seed > 5e6) throw new Error('manifest: could not place a bucket');
      const slots = bucket.keys.map(k => hash(k, seed) % M);
      if (slots.some((s, i) => table[s] !== -1 || slots.indexOf(s) !== i)) continue;
      slots.forEach((s, i) => { table[s] = catIndex[nameToCat[bucket.keys[i]]]; });
      seeds[bucket.b] = seed;
      break;
    }
  }
  const T = table.map(v => (v === -1 ? EMPTY : String.fromCharCode(48 + v))).join('');
  const S = seeds.map(s => s.toString(36)).join(',');
  // self check: every name resolves to its own category
  const lookup = name => catIds[T.charCodeAt(hash(name, parseInt(seeds[hash(name, 0) % B], 10)) % M) - 48];
  for (const name of names) if (lookup(name) !== nameToCat[name]) throw new Error(`manifest self-check failed for ${name}`);
  return { B, M, T, S };
}

/** Source of the decoder that ends up in dist/manifest.js. */
export function decoderSource({ B, M }) {
  return `${HASH_SRC}
const SEEDS = S.split(',').map(x => parseInt(x, 36));
/** Category id of an icon name (deterministic; unknown names map to some category). */
export function categoryOf(name) {
  const v = T.charCodeAt(h(name, SEEDS[h(name, 0) % ${B}]) % ${M}) - 48;
  return C[v] || C[0];
}
/** Backwards compatible map-like view: MANIFEST[name] -> category id. */
export const MANIFEST = new Proxy(Object.create(null), { get: (t, k) => (typeof k === 'string' ? categoryOf(k) : undefined) });`;
}

export const gzipSize = text => zlib.gzipSync(Buffer.from(text), { level: 9 }).length;
