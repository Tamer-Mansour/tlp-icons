// Primary category from config/categories.json (explicit tables only) and deliberate ordering.

let compiled = null;
function patterns(cfg) {
  if (!compiled || compiled.cfg !== cfg) compiled = { cfg, list: cfg.patterns.map(([re, cat]) => [new RegExp(re), cat]) };
  return compiled.list;
}

export function categorize(icon, cfg) {
  if (cfg.icons[icon.name]) return cfg.icons[icon.name];
  for (const [re, cat] of patterns(cfg)) if (re.test(icon.name)) return cat;
  if (icon.source === 'lucide') {
    const cats = icon.upstreamCategories || [];
    for (const c of cfg.lucidePriority) if (cats.includes(c)) return cfg.lucide[c];
    return cats.length ? cfg.lucide[cats[0]] || null : 'interface';
  }
  if (icon.source === 'tabler') return cfg.tabler[icon.upstreamCategories[0]] || null;
  return null;
}

const DIR_RANK = { up: 0, down: 1, left: 2, right: 3, 'up-left': 4, 'up-right': 5, 'down-left': 6, 'down-right': 7 };
const tokenKey = t => {
  if (t in DIR_RANK) return [0, DIR_RANK[t], ''];
  if (/^\d+$/.test(t)) return [1, +t, ''];
  return [2, 0, t];
};
function compareTokens(a, b) {
  const ta = a.split('-'), tb = b.split('-');
  if (ta.length !== tb.length) return ta.length - tb.length;
  for (let k = 0; k < ta.length; k++) {
    const x = tokenKey(ta[k]), y = tokenKey(tb[k]);
    if (x[0] !== y[0]) return x[0] - y[0];
    if (x[1] !== y[1]) return x[1] - y[1];
    if (x[2] !== y[2]) return x[2] < y[2] ? -1 : 1;
  }
  return 0;
}

/** Featured (most used) first in the given order, then families alphabetically with siblings together. */
export function orderIcons(list, featured) {
  const rank = new Map(featured.map((n, k) => [n, k]));
  const fam = n => n.split('-')[0];
  return list.slice().sort((a, b) => {
    const ra = rank.has(a.name) ? rank.get(a.name) : Infinity, rb = rank.has(b.name) ? rank.get(b.name) : Infinity;
    if (ra !== rb) return ra - rb;
    const fa = fam(a.name), fb = fam(b.name);
    if (fa !== fb) return fa < fb ? -1 : 1;
    return compareTokens(a.name, b.name) || (a.name < b.name ? -1 : 1);
  });
}
